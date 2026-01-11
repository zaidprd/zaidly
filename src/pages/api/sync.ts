import type { APIRoute } from "astro";
import { createClient } from "@libsql/client/web";
import { toHTML } from "@portabletext/to-html";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // @ts-ignore
  const env = locals.runtime?.env;

  if (!env || !env.TURSO_URL || !env.TURSO_TOKEN) {
    return new Response(JSON.stringify({ error: "Env Turso Hilang" }), { status: 500 });
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
      return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
    }

    let finalImageUrl = "";
    // @ts-ignore
    const bucket = env.MY_BUCKET; 

    if (data.mainImage?.asset?._ref) {
      const assetRef = data.mainImage.asset._ref;
      const parts = assetRef.split("-"); 
      
      // FIX EKSTENSI: Sanity ref itu image-ID-SIZE-EXT
      const assetId = parts[1];
      const dimensions = parts[2];
      const extension = parts[3]; 
      const fileName = `${assetId}-${dimensions}.${extension}`;
      
      const projId = env.PUBLIC_SANITY_PROJECT_ID || "6ocswb4i";
      const dataset = env.PUBLIC_SANITY_DATASET || "production";
      const sanityUrl = `https://cdn.sanity.io/images/${projId}/${dataset}/${fileName}`;

      // COBA PUSH KE R2
      if (bucket) {
        try {
          const imageRes = await fetch(sanityUrl);
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            await bucket.put(`blog/${fileName}`, arrayBuffer, {
              httpMetadata: { contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}` }
            });
            // Gunakan custom domain R2 abang
            finalImageUrl = `https://r2.zaidly.com/blog/${fileName}`;
          } else {
            finalImageUrl = sanityUrl;
          }
        } catch (e) {
          finalImageUrl = sanityUrl;
        }
      } else {
        // Kalau bucket masih undefined, dia bakal kesini
        finalImageUrl = sanityUrl;
      }
    }

    const contentHtml = toHTML(data.body || []);
    const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';

    await turso.execute({
      sql: `INSERT INTO posts (id, title, slug, description, category, author, tags, r2_image_url, content_html, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, slug=excluded.slug, r2_image_url=excluded.r2_image_url, content_html=excluded.content_html, published_at=excluded.published_at`,
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

    return new Response(JSON.stringify({ 
        success: true, 
        url: finalImageUrl, 
        debug: bucket ? "Bucket OK" : "Bucket Missing" 
    }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
