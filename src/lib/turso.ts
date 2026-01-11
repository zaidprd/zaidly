import { createClient } from "@libsql/client";

export const turso = createClient({
  url: import.meta.env.TURSO_URL,
  authToken: import.meta.env.TURSO_TOKEN,
});

export async function getTursoPosts() {
  // Ambil data dari tabel posts
  const result = await turso.execute("SELECT * FROM posts ORDER BY published_at DESC");
  
  return result.rows.map(post => ({
    // Samakan dengan kolom di screenshot Turso abang
    id: String(post.id),
    title: String(post.title),
    description: String(post.description),
    slug: String(post.slug),
    category: post.category ? String(post.category) : "General",
    // Pastikan pakai r2_image_url sesuai nama kolom di DB
    image: post.r2_image_url ? String(post.r2_image_url) : null, 
    author: post.author ? String(post.author) : "Admin",
    pubDate: post.published_at ? String(post.published_at) : new Date().toISOString(),
    isExternal: true 
  }));
}