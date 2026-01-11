---
// src/pages/api/sync.ts
import type { APIRoute } from "astro";
import { createClient } from "@libsql/client/web";
import { toHTML } from "@portabletext/to-html";

export const prerender = false; // WAJIB FALSE karena ini API dinamis

export const POST: APIRoute = async ({ request, locals }) => {
  // @ts-ignore
  const env = locals.runtime?.env;

  // 1. CEK KONFIGURASI
  if (!env || !env.TURSO_URL || !env.TURSO_TOKEN) {
    return new Response(JSON.stringify({ error: "Missing Env Vars" }), { status: 500 });
  }

  const turso = createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_TOKEN,
  });

  try {
    const data = await request.json();
    if (!data._id) return new Response("Missing ID", { status: 400 });

    // Handle Delete
    if (data.action === 'delete') {
      await turso.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [data._id] });
      return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
    }

    // 2. PROSES GAMBAR (DOWNLOAD DARI SANITY -> UPLOAD KE R2)
    let finalImageUrl = "";
    const bucket = env.MY_BUCKET; // Pastikan nama binding di Cloudflare adalah MY_BUCKET

    if (data.mainImage?.asset?._ref) {
      const assetRef = data.mainImage.asset._ref;
      const parts = assetRef.split("-"); // image-ID-SIZE-EXTENSION
      const fileName = `${parts[1]}-${parts[2]}.${parts[3]}`;
      
      const projId = env.PUBLIC_SANITY_PROJECT_ID;
      const dataset = env.PUBLIC_SANITY_DATASET || "production";
      const sanityUrl = `https://cdn.sanity.io/images/${projId}/${dataset}/${fileName}`;

      if (bucket) {
        try {
          // DOWNLOAD GAMBAR
          const imageRes = await fetch(sanityUrl);
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            
            // UPLOAD KE R2
            await bucket.put(`blog/${fileName}`, arrayBuffer, {
              httpMetadata: { contentType: imageRes.headers.get("content-type") || "image/jpeg" }
            });

            // GUNAKAN URL R2 (Ganti domain ini dengan Custom Domain R2 abang)
            finalImageUrl = `https://r2.zaidly.com/blog/${fileName}`;
          }
        } catch (uploadError) {
          console.error("R2 Upload Failed, falling back to Sanity URL", uploadError);
          finalImageUrl = sanityUrl; // Fallback kalau R2 gagal
        }
      } else {
        finalImageUrl = sanityUrl; // Kalau bucket belum di-binding
      }
    }

    // 3. INSERT / UPDATE KE TURSO
    const contentHtml = toHTML(data.body || []);
    const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';

    await turso.execute({
      sql: `INSERT INTO posts (id, title, slug, description, category, author, tags, r2_image_url, content_html, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, 
            slug=excluded.slug, 
            description=excluded.description,
            category=excluded.category,
            author=excluded.author,
            tags=excluded.tags,
            r2_image_url=excluded.r2_image_url,
            content_html=excluded.content_html,
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
        data.publishedAt || new Date().toISOString()
      ]
    });

    return new Response(JSON.stringify({ success: true, url: finalImageUrl }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
