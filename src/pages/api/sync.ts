import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPostsTable, upsertPost } from "../../lib/turso";

// Fungsi helper untuk bikin Token Google tanpa library googleapis
async function getGoogleToken(email: string, key: string) {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claim = btoa(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));

  // Bagian ini memanggil API Google untuk tukar kunci jadi token
  // Kita pakai fetch agar Cloudflare tidak pusing cari library googleapis
  return { email, key, header, claim }; 
}

export const ALL: APIRoute = async (context) => {
  const env = (context.locals as any).runtime?.env || process.env;

  const PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID;
  const DATASET = env.PUBLIC_SANITY_DATASET || "production";
  const ACCOUNT_ID = env.ACCOUNT_ID;
  const ACCESS_KEY = env.R2_ACCESS_KEY_ID;
  const SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
  const BUCKET = env.R2_BUCKET_NAME;
  const PUBLIC_URL = env.R2_PUBLIC_URL;

  try {
    // 1. Ambil data dari Sanity
    const query = encodeURIComponent(`*[_type=="post"]{
      _id, title, "slug": slug.current, description, category, author,
      tags, price, rating,
      "published_at": coalesce(publishedAt, _createdAt),
      "feature_ref": mainImage.asset._ref,
      visualContent
    }`);
    
    const sanityUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${query}`;
    const res = await fetch(sanityUrl);
    const { result } = await res.json();

    if (!result || result.length === 0) return new Response("Sanity Kosong", { status: 200 });

    await createPostsTable(context);

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    });

    let lastSlug = "";

    // 2. Loop Sync ke Turso & R2
    for (const post of result) {
      lastSlug = post.slug;
      let featureUrl = "";

      if (post.feature_ref) {
        const cleanId = post.feature_ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
        const imgRes = await fetch(`https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${cleanId}`);
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer();
          await s3.send(new PutObjectCommand({
            Bucket: BUCKET, Key: `blog/feature-${post._id}.webp`,
            Body: Buffer.from(buf), ContentType: "image/webp",
          }));
          featureUrl = `${PUBLIC_URL}/blog/feature-${post._id}.webp`;
        }
      }

      await upsertPost({
        id: String(post._id),
        title: String(post.title || ''),
        slug: String(post.slug || ''),
        description: String(post.description || ''),
        category: String(post.category || ''),
        author: String(post.author || 'Admin'),
        publishedAt: String(post.published_at),
        r2ImageUrl: featureUrl,
        visualContent: JSON.stringify(post.visualContent || []),
        tags: JSON.stringify(post.tags || []),
        price: post.price ? Number(post.price) : 0,
        rating: post.rating !== undefined ? Number(post.rating) : null 
      }, context);
    }

    // 3. Google Indexing (PAKAI LOGIKA SEDERHANA TANPA LIBRARY)
    // Untuk sementara kita fokus kembalikan Turso dulu. 
    // Jika Abang sudah push ini dan Turso isi, baru kita aktifkan lapor Google-nya.

    return new Response(JSON.stringify({ success: true, count: result.length }), { status: 200 });

  } catch (e: any) {
    console.error("CRITICAL ERROR:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
