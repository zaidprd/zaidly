// src/pages/api/sync.ts
export const prerender = false;

import { turso } from "../../lib/turso"; 
import { toHTML } from "@portabletext/to-html";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // 1. Logic Hapus
    if (data.action === 'delete') {
      await turso.execute({
        sql: "DELETE FROM posts WHERE id = ?",
        args: [data._id]
      });
      return new Response(JSON.stringify({ message: "Berhasil dihapus" }), { status: 200 });
    }

    // 2. Convert Body ke HTML
    const contentHtml = toHTML(data.body || []);
    
    // 3. Gabungkan Tags array menjadi String agar masuk ke database Turso
    const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';

    // 4. Masukkan ke Turso (Tambahkan kolom 'tags' dan 'pub_date')
    await turso.execute({
      sql: `INSERT INTO posts (id, title, slug, description, category, author, tags, pub_date, r2_image_url, content_html) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, 
            slug=excluded.slug,
            description=excluded.description, 
            category=excluded.category,
            author=excluded.author,
            tags=excluded.tags,
            pub_date=excluded.pub_date,
            r2_image_url=excluded.r2_image_url,
            content_html=excluded.content_html`,
      args: [
        data._id, 
        data.title, 
        data.slug?.current || '', 
        data.description || '', 
        data.category || 'gear-lab', 
        data.author || 'Admin', 
        tagsString, // DATA TAGS MASUK SINI
        data.pubDate || new Date().toISOString(), // TANGGAL MASUK SINI
        data.r2_image_url || '',
        contentHtml
      ]
    });

    return new Response(JSON.stringify({ message: "Zaidly Sync Berhasil!" }), { status: 200 });
  } catch (error: any) {
    console.error("Gagal Sinkronisasi:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};