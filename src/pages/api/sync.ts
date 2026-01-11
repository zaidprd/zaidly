// src/pages/api/sync.ts
export const prerender = false;
import { turso } from "../../lib/turso"; 
import { toHTML } from "@portabletext/to-html";
import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data._id) return new Response("Missing ID", { status: 400 });

    // 1. Logic Hapus
    if (data.action === 'delete') {
      await turso.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [data._id] });
      return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
    }

    // 2. Setup R2 (Pakai import.meta.env agar terbaca di Cloudflare)
    const ACCOUNT_ID = import.meta.env.ACCOUNT_ID || process.env.ACCOUNT_ID;
    const ACCESS_KEY = import.meta.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
    const SECRET_KEY = import.meta.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY || "",
        secretAccessKey: SECRET_KEY || "",
      },
    });

    let finalImageUrl = "";
    
    // 3. Proses Gambar
    if (data.mainImage?.asset?._ref) {
      try {
        const assetId = data.mainImage.asset._ref
          .replace("image-", "").replace("-webp", ".webp").replace("-jpg", ".jpg").replace("-png", ".png");
        
        const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
        const dataset = import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET;
        
        const sanityUrl = `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}`;

        const imageRes = await fetch(sanityUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const fileName = `blog/${data.slug?.current || data._id}.webp`;

        await s3Client.send(new PutObjectCommand({
          Bucket: import.meta.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "",
          Key: fileName,
          Body: Buffer.from(arrayBuffer),
          ContentType: "image/webp",
        }));
        
        const publicUrl = import.meta.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;
        finalImageUrl = `${publicUrl}/${fileName}`;
      } catch (e) {
        console.error("R2 Upload failed");
        finalImageUrl = ""; 
      }
    }

    // 4. Update Turso (Tambahkan published_at agar sinkron dengan lib/turso.ts)
    const contentHtml = toHTML(data.body || []);
    const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';
    const publishedAt = data.publishedAt || new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO posts (id, title, slug, description, category, author, tags, r2_image_url, content_html, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, slug=excluded.slug, description=excluded.description, 
            category=excluded.category, author=excluded.author, tags=excluded.tags, 
            r2_image_url=excluded.r2_image_url, content_html=excluded.content_html, 
            published_at=excluded.published_at`,
      args: [
        data._id,
        data.title || "Untitled",
        data.slug?.current || `post-${data._id}`,
        data.description || "",
        data.category || "General",
        data.author || "Admin",
        tagsString,
        finalImageUrl,
        contentHtml,
        publishedAt
      ]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};