import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPostsTable, upsertPost } from "../../lib/turso";

export const ALL: APIRoute = async (context) => {
  const env = (context.locals as any).runtime?.env || process.env;

  const PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID;
  const DATASET = env.PUBLIC_SANITY_DATASET || "production";
  const ACCOUNT_ID = env.ACCOUNT_ID;
  const ACCESS_KEY = env.R2_ACCESS_KEY_ID;
  const SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
  const BUCKET = env.R2_BUCKET_NAME;
  const PUBLIC_URL = env.R2_PUBLIC_URL;

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  function getSanityImageUrl(ref: string) {
    const cleanId = ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
    return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${cleanId}`;
  }

  async function uploadToR2(ref: string, fileName: string) {
    try {
      const res = await fetch(getSanityImageUrl(ref));
      if (!res.ok) return "";
      const buf = await res.arrayBuffer();
      const finalKey = `blog/${fileName}.webp`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: finalKey,
        Body: Buffer.from(buf),
        ContentType: "image/webp",
      }));
      return `${PUBLIC_URL}/${finalKey}`;
    } catch (e) {
      console.error("Gagal upload:", fileName);
      return "";
    }
  }

  try {
    // 1. TAMBAH price DAN rating DI QUERY SANITY
    const query = encodeURIComponent(`*[_type=="post"]{
      _id, title, "slug": slug.current, description, category, author,
      tags,
      price,
      rating,
      "published_at": coalesce(publishedAt, _createdAt),
      "feature_ref": mainImage.asset._ref,
      visualContent
    }`);
    
    const sanityUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${query}`;
    const res = await fetch(sanityUrl);
    const { result } = await res.json();

    await createPostsTable(context);

    for (const post of result) {
      // 1. Upload Feature Image
      let featureUrl = "";
      if (post.feature_ref) {
        featureUrl = await uploadToR2(post.feature_ref, `feature-${post._id}`);
      }

      // 2. Upload Body Images (visualContent)
      const fixedVisualContent = await Promise.all(
        (post.visualContent || []).map(async (block: any) => {
          if (block._type === "image" && block.asset?._ref) {
            const r2Url = await uploadToR2(block.asset._ref, `body-${block._key}`);
            return { 
              ...block, 
              url: r2Url, 
              asset: { ...block.asset, _ref: "uploaded-to-r2" } 
            };
          }
          return block;
        })
      );

      // 3. SIMPAN KE TURSO - TAMBAH price DAN rating
      await upsertPost({
  id: String(post._id),
  title: String(post.title || ''),
  slug: String(post.slug || ''),
  description: String(post.description || ''),
  category: String(post.category || ''),
  author: String(post.author || 'Admin'),
  publishedAt: String(post.published_at),
  r2ImageUrl: featureUrl,
  visualContent: JSON.stringify(fixedVisualContent),
  tags: JSON.stringify(post.tags || []),
  price: post.price ? Number(post.price) : 0,
  // JANGAN PAKAI Number(post.rating || null)
  // PAKAI LOGIKA INI:
  rating: post.rating !== undefined && post.rating !== null ? Number(post.rating) : null 
}, context);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    console.error("Sync Error Details:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};