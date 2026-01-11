import type { APIRoute } from "astro";
import { createClient } from "@libsql/client/web";
import { toHTML } from "@portabletext/to-html";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // 1. AMBIL ENV LANGSUNG DARI CLOUDFLARE RUNTIME
  // Di Astro Cloudflare Adapter, env HANYA ada di sini.
  // @ts-ignore
  const env = locals.runtime?.env;

  // 2. CEK APAKAH SERVER CLOUDFLARE SUDAH KONFIGURASI DENGAN BENAR
  if (!env || !env.TURSO_URL || !env.TURSO_TOKEN) {
    return new Response(
      JSON.stringify({ 
        error: "Server Configuration Error: Environment Variables Not Found",
        details: "Pastikan adapter: cloudflare() sudah ada di astro.config.mjs dan variabel sudah di-save di dashboard Cloudflare."
      }), 
      { status: 500 }
    );
  }

  // 3. SETUP DATABASE CLIENT
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

    // 4. PROSES DATA GAMBAR (Fallback ke URL Sanity Langsung biar aman)
    let finalImageUrl = "";
    if (data.mainImage?.asset?._ref) {
      const assetRef = data.mainImage.asset._ref;
      const parts = assetRef.split("-"); // image-ID-SIZE-EXTENSION
      const fileName = `${parts[1]}-${parts[2]}.${parts[3]}`;
      
      // Ambil Project ID dari env yang sudah kita tarik tadi
      const projId = env.PUBLIC_SANITY_PROJECT_ID;
      const dataset = env.PUBLIC_SANITY_DATASET || "production";
      
      // Kita pakai URL Sanity dulu untuk memastikan database terisi, 
      // Nanti kalau R2 mau diaktifkan lagi tinggal tambahkan fetch-nya di sini.
      finalImageUrl = `https://cdn.sanity.io/images/${projId}/${dataset}/${fileName}`;
    }

    // 5. INSERT / UPDATE KE TURSO
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};