import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPostsTable, upsertPost } from "../../lib/turso";

// Ambil ENV dengan fallback (untuk Lokal & Cloudflare)
const PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
const DATASET = import.meta.env.PUBLIC_SANITY_DATASET || "production";
const ACCOUNT_ID = import.meta.env.ACCOUNT_ID || process.env.ACCOUNT_ID;
const ACCESS_KEY = import.meta.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = import.meta.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = import.meta.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME;
const PUBLIC_URL = import.meta.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;

// ================= R2 CLIENT =================
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY as string,
    secretAccessKey: SECRET_KEY as string,
  },
});

// ================= HELPERS =================
function sanityImageUrl(ref: string) {
  // Rumus Regex: Ubah image-ID-DIMENSI-FORMAT jadi ID-DIMENSI.FORMAT
  const cleanId = ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${cleanId}`;
}

async function uploadToR2(key: string, buffer: ArrayBuffer, contentType: string) {
  // 🔥 FIX 1: Tambahkan folder 'blog/' agar file masuk ke folder di R2
  const finalKey = `blog/${key}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: finalKey,
      Body: Buffer.from(buffer),
      ContentType: contentType,
    })
  );

  // 🔥 FIX 2: Return URL harus Domain + Folder + Nama File
  // Contoh: https://r2.zaidly.com/blog/feature-xxxx.webp
  return `${PUBLIC_URL}/${finalKey}`;
}

// ================= MAIN API =================
export const GET: APIRoute = async () => {
  try {
    // Validasi Awal kredensial
    if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY || !PUBLIC_URL) {
      throw new Error("Kredensial R2 atau PUBLIC_URL tidak terbaca di .env!");
    }

    const QUERY = encodeURIComponent(`*[_type=="post"]{
      _id,
      title,
      "slug": slug.current,
      description,
      category,
      author,
      "published_at": coalesce(publishedAt, _createdAt),
      "feature_ref": mainImage.asset._ref,
      visualContent
    }`);

    const sanityUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;
    const res = await fetch(sanityUrl);
    const { result } = await res.json();

    // Pastikan tabel siap (Hati-hati: kalau createPostsTable isinya DROP TABLE, data lama hilang)
    await createPostsTable();

    for (const post of result) {
      console.log(`🚀 Mengolah: ${post.title}`);

      // 1. FEATURE IMAGE
      let featureUrl = "";
      if (post.feature_ref) {
        try {
            const buf = await fetch(sanityImageUrl(post.feature_ref)).then(r => r.arrayBuffer());
            const key = `feature-${post._id}.webp`; 
            featureUrl = await uploadToR2(key, buf, "image/webp");
        } catch (e) {
            console.error("Gagal olah feature image");
        }
      }

      // 2. BODY IMAGES (visualContent)
      const visual = await Promise.all(
        (post.visualContent || []).map(async (b: any) => {
          if (b._type === "image" && b.asset?._ref) {
            try {
              const buf = await fetch(sanityImageUrl(b.asset._ref)).then(r => r.arrayBuffer());
              // Gunakan ID unik blok (_key) untuk nama file agar konsisten
              const key = `body-${b._key || crypto.randomUUID().split('-')[0]}.webp`;
              const url = await uploadToR2(key, buf, "image/webp");
              
              return { 
                ...b, 
                _type: "image", 
                url: url, // Injeksi URL R2 lengkap dengan folder blog/
                alt: b.alt || "" 
              };
            } catch (imgErr) {
              console.error("Gagal upload gambar body, skip.");
              return b;
            }
          }
          return b;
        })
      );

      // 3. SAVE TO TURSO
      await upsertPost({
        id: post._id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        category: post.category,
        author: post.author,
        publishedAt: post.published_at,
        r2ImageUrl: featureUrl,
        visualContent: JSON.stringify(visual),
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Sync Berhasil dengan Folder Blog" }), { 
        status: 200,
        headers: { "Content-Type": "application/json" } 
    });

  } catch (e: any) {
    console.error("❌ SYNC ERROR:", e.message);
    return new Response(JSON.stringify({ success: false, error: e.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
};