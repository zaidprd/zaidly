// src/lib/turso.ts
import { createClient } from "@libsql/client";

export const turso = createClient({
  url: import.meta.env.TURSO_URL,
  authToken: import.meta.env.TURSO_TOKEN,
});

export async function getTursoPosts() {
  const result = await turso.execute("SELECT * FROM posts ORDER BY published_at DESC");
  
  return result.rows.map(post => ({
    // Kita samakan formatnya dengan data dari Payload CMS kemarin
    title: String(post.title),
    description: String(post.description),
    slug: String(post.slug),
    category: String(post.category),
    // Link gambar R2 yang abang input manual di Sanity nanti
    image: String(post.r2_image_url), 
    author: String(post.author),
    pubDate: String(post.published_at),
    // Flag ini penting supaya PostCard abang tetap mengenali ini sebagai external content
    isPayload: true 
  }));
}