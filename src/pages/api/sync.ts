import type { APIRoute } from "astro";
import { createPostsTable, upsertPost } from "../../lib/turso";

export const ALL: APIRoute = async ({ request }) => {
  try {
    const PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
    const DATASET = import.meta.env.PUBLIC_SANITY_DATASET || "production";
    
    const method = request.method;
    let posts = [];

    if (method === "GET") {
      // QUERY GROQ: Murni visual_content, no more body/content_html
      const QUERY = encodeURIComponent(`*[_type == "post"]{ 
        "_id": _id,
        "title": title,
        "slug": slug.current,
        "description": description,
        "category": category,
        "author": author,
        "published_at": coalesce(publishedAt, _createdAt),
        "sanity_ref": mainImage.asset._ref, 
        "visual_content": visualContent
      }`);
      
      const sanityUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;
      const response = await fetch(sanityUrl);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);
      posts = data.result || [];
      
      // TRIGGER RESET TABEL (DROP & CREATE)
      await createPostsTable();
    } else {
      // MODE WEBHOOK (POST)
      const body = await request.json();
      posts = Array.isArray(body) ? body : [body];
    }

    for (const post of posts) {
      // LOGIC LINK R2 (CLOUDFLARE)
      const imageRef = post.sanity_ref || post.mainImage?.asset?._ref;
      let r2Url = "";

      if (imageRef) {
          const cleanId = imageRef.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
          r2Url = `https://r2.zaidly.com/blog/${cleanId}`;
      }

      // SIMPAN KE TURSO
      await upsertPost({
        id: post._id,
        title: post.title,
        slug: typeof post.slug === 'string' ? post.slug : post.slug?.current,
        description: post.description,
        category: post.category,
        author: post.author,
        publishedAt: post.published_at || post.publishedAt,
        r2ImageUrl: r2Url, 
        visualContent: JSON.stringify(post.visual_content || post.visualContent || [])
      });
    }

    return new Response(JSON.stringify({ success: true, count: posts.length }), { status: 200 });
  } catch (e: any) {
    console.error("❌ Sync Error:", e.message);
    return new Response(JSON.stringify({ error: e.message, success: false }), { status: 500 });
  }
};

export const POST = ALL;
export const GET = ALL;