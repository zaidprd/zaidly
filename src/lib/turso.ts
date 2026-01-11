import { createClient } from "@libsql/client";

// 1. Definisikan Client Turso (Fix Error: Cannot find name 'turso')
export const turso = createClient({
  url: import.meta.env.TURSO_URL || "",
  authToken: import.meta.env.TURSO_TOKEN || "",
});

export async function getTursoPosts() {
  // Ambil semua kolom termasuk visual_content yang baru kita buat
  const result = await turso.execute("SELECT * FROM posts ORDER BY published_at DESC");
  
  // 2. Tambahkan (post: any) untuk Fix Error TypeScript "implicitly any"
  return result.rows.map((post: any) => ({
    id: String(post.id),
    title: String(post.title),
    description: String(post.description || ""),
    slug: String(post.slug),
    category: post.category ? String(post.category) : "General",
    image: post.r2_image_url ? String(post.r2_image_url) : null, 
    author: post.author ? String(post.author) : "Admin",
    pubDate: post.published_at ? String(post.published_at) : new Date().toISOString(),
    content_html: post.content_html ? String(post.content_html) : "",
    
    // Tarik data Portable Text (Gambar/Tombol) dari database
    visual_content: post.visual_content ? String(post.visual_content) : null,
    
    isExternal: true 
  }));
}