import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPostsTable, upsertPost } from "../../lib/turso";

export const ALL: APIRoute = async (context) => {
  const env = (context.locals as any).runtime?.env || process.env;
  const { 
    PUBLIC_SANITY_PROJECT_ID: PROJECT_ID, 
    PUBLIC_SANITY_DATASET: DATASET = "production", 
    ACCOUNT_ID, 
    R2_ACCESS_KEY_ID: ACCESS_KEY, 
    R2_SECRET_ACCESS_KEY: SECRET_KEY, 
    R2_BUCKET_NAME: BUCKET, 
    R2_PUBLIC_URL: PUBLIC_URL 
  } = env;

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  // Fungsi Helper untuk Mindahin Gambar ke R2
  async function uploadToR2(ref: string, fileName: string) {
    try {
      const cleanId = ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
      const imgRes = await fetch(`https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${cleanId}`);
      if (!imgRes.ok) return "";
      const buf = await imgRes.arrayBuffer();
      const finalKey = `blog/${fileName}.webp`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: finalKey,
        Body: Buffer.from(buf),
        ContentType: "image/webp",
      }));
      return `${PUBLIC_URL}/${finalKey}`;
    } catch (e) {
      console.error("Gagal upload:", fileName);
      return "";
    }
  }

  try {
    const query = encodeURIComponent(`*[_type=="post"]{
      _id, title, "slug": slug.current, description, category, author,
      tags, price, rating,
      "published_at": coalesce(publishedAt, _createdAt),
      "feature_ref": mainImage.asset._ref,
      visualContent
    }`);
    
    const sanityUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${query}`;
    const res = await fetch(sanityUrl);
    const { result } = await res.json();

    if (!result || result.length === 0) return new Response("Sanity Kosong", { status: 200 });

    await createPostsTable(context);

    for (const post of result) {
      // 1. Upload Gambar Utama (Featured Image)
      let featureUrl = "";
      if (post.feature_ref) {
        featureUrl = await uploadToR2(post.feature_ref, `feature-${post._id}`);
      }

      // 2. Upload SEMUA GAMBAR di dalam isi artikel (Visual Content)
      // Ini bagian yang sempat hilang kemarin
      const fixedVisualContent = await Promise.all(
        (post.visualContent || []).map(async (block: any) => {
          if (block._type === "image" && block.asset?._ref) {
            const r2Url = await uploadToR2(block.asset._ref, `body-${block._key}`);
            return { 
              ...block, 
              asset: { ...block.asset, url: r2Url } 
            };
          }
          return block;
        })
      );

      // 3. Simpan ke Turso
      await upsertPost({
        id: String(post._id),
        title: String(post.title || ''),
        slug: String(post.slug || ''),
        description: String(post.description || ''),
        category: String(post.category || ''),
        author: String(post.author || 'Admin'),
        publishedAt: String(post.published_at),
        r2ImageUrl: featureUrl,
        visualContent: JSON.stringify(fixedVisualContent), // Menyimpan data yang sudah ada link gambarnya
        tags: JSON.stringify(post.tags || []),
        price: post.price ? Number(post.price) : 0,
        rating: post.rating !== undefined ? Number(post.rating) : null 
      }, context);
    }

    return new Response(JSON.stringify({ success: true, count: result.length }), { status: 200 });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};