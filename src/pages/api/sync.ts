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
  const PUBLIC_URL = env.R2_PUBLIC_URL; // Pastikan isinya https://r2.zaidly.com

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
    const query = encodeURIComponent(`*[_type=="post"]{
      _id, title, "slug": slug.current, description, category, author,
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
            // Gunakan _key unik dari Sanity untuk nama file di R2
            const r2Url = await uploadToR2(block.asset._ref, `body-${block._key}`);
            return { 
              ...block, 
              url: r2Url, // Suntikkan URL R2 ke JSON
              asset: { ...block.asset, _ref: "uploaded-to-r2" } 
            };
          }
          return block;
        })
      );

      // 3. Simpan ke Turso
      await upsertPost({
        id: post._id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        category: post.category,
        author: post.author,
        publishedAt: post.published_at,
        r2ImageUrl: featureUrl,
        visualContent: JSON.stringify(fixedVisualContent),
      }, context);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
