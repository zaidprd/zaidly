import { createClient } from "@libsql/client";

export const turso = createClient({
  // Kita tambahkan pengecekan ke process.env untuk Cloudflare Functions
  url: import.meta.env.TURSO_URL || (globalThis as any).process?.env?.TURSO_URL || "",
  authToken: import.meta.env.TURSO_TOKEN || (globalThis as any).process?.env?.TURSO_TOKEN || "",
});

/**
 * FUNGSI: Reset & Buat Tabel Baru
 * Menggunakan struktur r2_image_url dan visual_content (Portable Text)
 */
export async function createPostsTable() {
  // Hapus tabel lama jika ingin reset struktur total
  await turso.execute(`DROP TABLE IF EXISTS posts`);

  await turso.execute(`
    CREATE TABLE posts (
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
      post.publishedAt, // Sinkron dengan sync-sanity.ts
      post.r2ImageUrl,  // Sinkron dengan sync-sanity.ts
      post.visualContent // JSON String dari Portable Text
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
      // Di sini visual_content masih dalam bentuk string JSON dari DB
      visual_content: post.visual_content 
    }));
  } catch (error) {
    console.error("❌ Gagal ambil data Turso:", error);
    return [];
  }
}