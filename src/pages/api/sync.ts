// src/pages/api/sync.ts
export const prerender = false;

import { turso } from "../../lib/turso"; 
import { toHTML } from "@portabletext/to-html";
import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 1. Koneksi ke Cloudflare R2 pakai kunci yang abang pasang tadi
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Logic Hapus Artikel
    if (data.action === 'delete' || data._type === 'delete') {
      await turso.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [data._id] });
      return new Response(JSON.stringify({ message: "Dihapus" }), { status: 200 });
    }

    // 2. PROSES PINDAH GAMBAR KE R2
    let finalImageUrl = "";
    if (data.mainImage?.asset?._ref) {
      // Bongkar ID Sanity jadi Link Download
      const assetId = data.mainImage.asset._ref
        .replace("image-", "")
        .replace("-webp", ".webp")
        .replace("-jpg", ".jpg")
        .replace("-png", ".png");
      
      const sanityUrl = `https://cdn.sanity.io/images/${process.env.PUBLIC_SANITY_PROJECT_ID}/${process.env.PUBLIC_SANITY_DATASET}/${assetId}`;

      // Download dari Sanity
      const imageRes = await fetch(sanityUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const fileName = `blog/${data.slug?.current || data._id}.webp`;

      // Upload ke Bucket 'zaidly-media'
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(arrayBuffer),
        ContentType: "image/webp",
      }));

      // Link Gambar R2 yang akan disimpan ke Turso
      finalImageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    }

    // 3. SIMPAN TEKS KE TURSO
    const contentHtml = toHTML(data.body || []);
    const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';

    await turso.execute({
      sql: `INSERT INTO posts (id, title, slug, description, category, author, tags, r2_image_url, content_html) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, slug=excluded.slug, description=excluded.description, 
            category=excluded.category, author=excluded.author, tags=excluded.tags, 
            r2_image_url=excluded.r2_image_url, content_html=excluded.content_html`,
      args: [
        data._id, 
        data.title || 'Untitled', 
        data.slug?.current || '', 
        data.description || '', 
        data.category || 'gear-lab', 
        data.author || 'Admin', 
        tagsString, 
        finalImageUrl, // Link R2 masuk ke sini!
        contentHtml
      ]
    });

    // 4. TRIGGER DEPLOY OTOMATIS (Jika ada)
    if (process.env.CLOUDFLARE_DEPLOY_HOOK_URL) {
      await fetch(process.env.CLOUDFLARE_DEPLOY_HOOK_URL, { method: 'POST' });
    }

    return new Response(JSON.stringify({ message: "Sakti! Gambar di R2 & Data di Turso" }), { status: 200 });
  } catch (error: any) {
    console.error("Error Sync:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};