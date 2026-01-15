import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPostsTable, upsertPost } from "../../lib/turso";

export const ALL: APIRoute = async (context) => {
  // 🔥 FIX 1: Ambil ENV khusus Cloudflare Runtime
  const env = (context.locals as any).runtime?.env || process.env;

  const PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID;
  const DATASET = env.PUBLIC_SANITY_DATASET || "production";
  const ACCOUNT_ID = env.ACCOUNT_ID;
  const ACCESS_KEY = env.R2_ACCESS_KEY_ID;
  const SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
  const BUCKET = env.R2_BUCKET_NAME;
  const PUBLIC_URL = env.R2_PUBLIC_URL;

  try {
    // Validasi kredensial
    if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
      throw new Error("Kredensial R2 tidak terbaca di Cloudflare!");
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });

    const sanityUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${encodeURIComponent(
      `*[_type=="post"]{_id, title, "slug": slug.current, description, category, author, "published_at": coalesce(publishedAt, _createdAt), "feature_ref": mainImage.asset._ref, visualContent}`
    )}`;

    const res = await fetch(sanityUrl);
    const { result } = await res.json();

    // 🔥 FIX 2: Pastikan lib/turso juga bisa baca env
    await createPostsTable();

    for (const post of result) {
      let featureUrl = "";
      if (post.feature_ref) {
        const cleanId = post.feature_ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
        const sUrl = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${cleanId}`;
        const buf = await fetch(sUrl).then(r => r.arrayBuffer());
        
        const finalKey = `blog/feature-${post._id}.webp`;
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET, Key: finalKey, Body: Buffer.from(buf), ContentType: "image/webp"
        }));
        featureUrl = `${PUBLIC_URL}/${finalKey}`;
      }

      await upsertPost({
        id: post._id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        category: post.category,
        author: post.author,
        publishedAt: post.published_at,
        r2ImageUrl: featureUrl,
        visualContent: JSON.stringify(post.visualContent || []),
      }, context); // Kirim context agar turso bisa baca env
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
