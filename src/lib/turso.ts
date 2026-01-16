import { createClient } from "@libsql/client";

function createTursoClient(context?: any) {
  const env =
    context?.locals?.runtime?.env || // Cloudflare
    import.meta.env ||               // Astro dev
    process.env;                     // fallback

  const url = env.TURSO_URL;
  const authToken = env.TURSO_TOKEN;

  if (!url || !authToken) {
    throw new Error("❌ TURSO_URL / TURSO_TOKEN tidak ditemukan");
  }

  return createClient({ url, authToken });
}

export async function createPostsTable(context?: any) {
  const turso = createTursoClient(context);

  // UPDATE: Menambahkan kolom price dan rating (REAL untuk angka desimal)
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
      visual_content TEXT,
      tags TEXT,
      price REAL,
      rating REAL
    )
  `);

  console.log("✅ Tabel posts siap dengan fitur SEO (Price & Rating)");
}

export async function upsertPost(post: any, context?: any) {
  const turso = createTursoClient(context);

  // UPDATE: Tambahkan price & rating ke SQL dan Args
  return await turso.execute({
    sql: `
      INSERT OR REPLACE INTO posts
      (id, title, slug, description, category, author, published_at, r2_image_url, visual_content, tags, price, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      post.id,
      post.title,
      post.slug,
      post.description,
      post.category,
      post.author,
      post.publishedAt,
      post.r2ImageUrl,
      post.visualContent,
      post.tags,
      post.price || 0,   // Masuk ke DB
      post.rating || null,  // Masuk ke DB
    ],
  });
}

export async function getTursoPosts(context?: any) {
  try {
    const turso = createTursoClient(context);

    const result = await turso.execute(
      "SELECT * FROM posts ORDER BY published_at DESC"
    );

    return result.rows.map((post: any) => ({
      ...post,
      id: String(post.id),
      title: String(post.title),
      slug: String(post.slug),
      visual_content: post.visual_content,
      tags: post.tags,
      price: post.price,   // Kirim ke Frontend
      rating: post.rating, // Kirim ke Frontend
    }));
  } catch (err) {
    console.error("❌ Turso error:", err);
    return [];
  }
}