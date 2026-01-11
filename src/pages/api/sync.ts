import type { APIRoute } from "astro";
import { createClient } from "@libsql/client/web";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // @ts-ignore
  const env = locals.runtime?.env;

  if (!env || !env.TURSO_URL || !env.TURSO_TOKEN) {
    return new Response(JSON.stringify({ error: "Config Turso Missing" }), { status: 500 });
  }

  const turso = createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_TOKEN,
  });

  try {
    const data = await request.json();
    if (!data._id) return new Response("Missing ID", { status: 400 });

    if (data.action === 'delete') {
      await turso.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [data._id] });
      return new Response("Deleted", { status: 200 });
    }

    // --- LOGIC GAMBAR R2 TETAP SAMA ---
    let finalImageUrl = "";
    // @ts-ignore
    const bucket = env.MY_BUCKET; 

    if (data.mainImage?.asset?._ref) {
      const assetRef = data.mainImage.asset._ref;
      const parts = assetRef.split("-"); 
      const assetId = parts[1];
      const dimensions = parts[2];
      const extension = parts[parts.length - 1]; 
      const fileName = `${assetId}-${dimensions}.${extension}`;
      const projId = env.PUBLIC_SANITY_PROJECT_ID || "6ocswb4i";
      const sanityUrl = `https://cdn.sanity.io/images/${projId}/production/${fileName}`;

      if (bucket) {
        try {
          const imageRes = await fetch(sanityUrl);
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            await bucket.put(`blog/${fileName}`, arrayBuffer, {
              httpMetadata: { contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}` }
            });
            finalImageUrl = `https://r2.zaidly.com/blog/${fileName}`;
          } else {
            finalImageUrl = sanityUrl;
          }
        } catch (e) {
          finalImageUrl = sanityUrl;
        }
      } else {
        finalImageUrl = sanityUrl;
      }
    }

    // --- PERBAIKAN DI SINI (SISTEM MARKDOWN) ---
    // Karena data.body sekarang sudah string Markdown, kita simpan MENTAH ke Turso.
    // Kita tidak perlu lagi toHTML di sini.
    const bodyContent = typeof data.body === 'string' ? data.body : ""; 
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
        bodyContent, // Simpan sebagai string Markdown mentah
        data.publishedAt || new Date().toISOString()
      ]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};