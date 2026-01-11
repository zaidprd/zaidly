export const prerender = false;
import { turso } from "../../lib/turso"; 
import { toHTML } from "@portabletext/to-html";
import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data._id) return new Response("Missing ID", { status: 400 });

    if (data.action === 'delete') {
      await turso.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [data._id] });
      return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
    }

    // Setup R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${import.meta.env.ACCOUNT_ID || process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: import.meta.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });

    let finalImageUrl = "";
    
    // Proses Gambar
    if (data.mainImage?.asset?._ref) {
      try {
        const assetRef = data.mainImage.asset._ref;
        const parts = assetRef.split("-");
        const fileName = `${parts[1]}-${parts[2]}.${parts[3]}`;
        
        const projId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
        const dataset = import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET;
        const sanityUrl = `https://cdn.sanity.io/images/${projId}/${dataset}/${fileName}`;

        const imageRes = await fetch(sanityUrl);
        const arrayBuffer = await imageRes.arrayBuffer();

        await s3Client.send(new PutObjectCommand({
          Bucket: import.meta.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "",
          Key: `blog/${fileName}`,
          Body: Buffer.from(arrayBuffer),
          ContentType: `image/${parts[3]}`,
        }));
        
        finalImageUrl = `${import.meta.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL}/blog/${fileName}`;
      } catch (e) {
        // BACKUP: Kalau R2 gagal, pakai link Sanity langsung biar gak kosong
        const assetRef = data.mainImage.asset._ref;
        const parts = assetRef.split("-");
        const projId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
        const dataset = import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET;
        finalImageUrl = `https://cdn.sanity.io/images/${projId}/${dataset}/${parts[1]}-${parts[2]}.${parts[3]}`;
      }
    }

    const contentHtml = toHTML(data.body || []);
    const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';

    await turso.execute({
      sql: `INSERT INTO posts (id, title, slug, description, category, author, tags, r2_image_url, content_html, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, slug=excluded.slug, description=excluded.description, 
            category=excluded.category, author=excluded.author, tags=excluded.tags, 
            r2_image_url=excluded.r2_image_url, content_html=excluded.content_html, published_at=excluded.published_at`,
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
        data.publishedAt || new Date().toISOString()
      ]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};