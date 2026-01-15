import { createClient } from "@libsql/client";

// Fungsi untuk mendapatkan client secara dinamis agar tidak URL_INVALID di Cloudflare
function getClient() {
  const url = import.meta.env.TURSO_URL || (globalThis as any).process?.env?.TURSO_URL || "";
  const authToken = import.meta.env.TURSO_TOKEN || (globalThis as any).process?.env?.TURSO_TOKEN || "";
  
  return createClient({
    url: url,
    authToken: authToken,
  });
}

export const turso = getClient();

/**
 * FUNGSI: Buat Tabel (Tanpa Menghapus Data Eksis)
 * Menggunakan struktur r2_image_url dan visual_content (Portable Text)
 */
export async function createPostsTable() {
  // Kita ganti DROP TABLE menjadi CREATE TABLE IF NOT EXISTS agar data aman
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT,
      slug TEXT UNIQUE,
      description TEXT,
      category TEXT,
      author TEXT,
      published_at TEXT,
      r2_image_url TEXT,
      visual_content TEXT 
    )
  `);
  console.log("✅ Tabel diperbarui: r2_image_url & visual_content READY.");
}

/**
 * FUNGSI: Simpan Data (UPSERT)
 * Dipanggil oleh api/sync-sanity.ts
 */
export async function upsertPost(post: any) {
  return await turso.execute({
    sql: `INSERT OR REPLACE INTO posts 
          (id, title, slug, description, category, author, published_at, r2_image_url, visual_content) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      post.id, 
      post.title, 
      post.slug, 
      post.description, 
      post.category, 
      post.author, 
      post.publishedAt, 
      post.r2ImageUrl,  
      post.visualContent 
    ],
  });
}

/**
 * FUNGSI: Ambil Data untuk Halaman Astro
 */
export async function getTursoPosts() {
  try {
    const result = await turso.execute("SELECT * FROM posts ORDER BY published_at DESC");
    return result.rows.map((post: any) => ({
      ...post,
      id: String(post.id),
      title: String(post.title),
      slug: String(post.slug),
      visual_content: post.visual_content 
    }));
  } catch (error) {
    console.error("❌ Gagal ambil data Turso:", error);
    return [];
  }
}
