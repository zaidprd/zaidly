/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// Custom Link Renderer agar link internal berwarna cokelat Zaidly (tidak hitam)
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

const components = {
  block: {
    h2: ({ children, value }: any) => {
      const text = value.children.map((c: any) => c.text).join('');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      return <h2 id={id} className="zaidly-h2" style={{scrollMarginTop: '120px'}}>{children}</h2>;
    },
    h3: ({ children, value }: any) => {
      const text = value.children.map((c: any) => c.text).join('');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      return <h3 id={id} className="zaidly-h3" style={{scrollMarginTop: '120px'}}>{children}</h3>;
    },
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      // Support Markdown & Table, tapi abaikan jika mengandung tag legacy {% %}
      const isMarkdown = (rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || /^\s*[-*+]\s+/m.test(rawText)) && !rawText.includes('{%');
      
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    blockquote: ({ children }: any) => (
      <blockquote className="zaidly-blockquote">{children}</blockquote>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-body-image-container">
          <img src={imageUrl} alt={value.alt || 'Zaidly Coffee Review'} className="zaidly-main-img" loading="lazy" />
          {value.alt && <p className="zaidly-alt-caption">{value.alt}</p>}
        </div>
      );
    },
    video: ({ value }: any) => {
      const videoUrl = value.asset?.url || value.url;
      if (!videoUrl) return null;
      return (
        <div className="zaidly-body-image-container">
          <video controls className="zaidly-main-img" style={{ backgroundColor: '#000' }}>
            <source src={videoUrl} type="video/mp4" />
          </video>
          {value.caption && <p className="zaidly-alt-caption">{value.caption}</p>}
        </div>
      );
    },
    productReviewCard: ({ value }: any) => {
      const hasAmazon = !!value.amazonUrl;
      const hasAli = !!value.aliExpressUrl;
      const rawRating = value.itemRating || 0;
      const stars = [1, 2, 3, 4, 5];
      const productImage = value.asset?.url || value.imageUrl || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : "https://zaidly.com/images/default-product.webp");
      
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": value.productName,
        "image": [productImage],
        "description": value.description || `Expert gear review of ${value.productName} by Zaidly Gear Lab.`,
        "brand": { "@type": "Brand", "name": "Zaidly" },
        "review": {
          "@type": "Review",
          "reviewRating": { "@type": "Rating", "ratingValue": rawRating, "bestRating": "5" },
          "author": { "@type": "Organization", "name": "Zaidly Gear Lab" }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": rawRating,
          "reviewCount": "1"
        },
        "offers": {
          "@type": "Offer",
          "url": value.amazonUrl || value.aliExpressUrl || "https://zaidly.com",
          "price": value.itemPrice ? value.itemPrice.replace(/[^0-9.]/g, '') : "1.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "priceValidUntil": `${new Date().getFullYear() + 1}-12-31`
        }
      };

      return (
        <div className="zaidly-card">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
          <h3 className="zaidly-card-title">{value.productName}</h3>
          <div className="zaidly-card-body">
            <div className="zaidly-card-stat">
              <span className="label">Expert Score</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {stars.map((num) => {
                    let starClass = num <= Math.floor(rawRating) ? "text-yellow-500" : "text-gray-200";
                    return <span key={num} className={`${starClass} text-xl`}>★</span>;
                  })}
                </div>
                <span className="font-black text-lg text-coffee-dark italic">({rawRating})</span>
              </div>
            </div>
            <div className="divider"></div>
            <div className="zaidly-card-stat">
              <span className="label">Price Point</span>
              <span className="value price text-2xl font-black text-coffee-dark">{value.itemPrice || 'Check'}</span>
            </div>
            <div className="zaidly-card-actions">
              {hasAmazon && (
                <div className="zaidly-btn-container-kit">
                  <div className="amz-logo-box"><span className="amz-text">amazon</span><div className="amz-arrow"></div></div>
                  <div className="seo-glow-blur amz-blur"></div>
                  <a href={value.amazonUrl} target="_blank" rel="nofollow" className="zaidly-btn-kit amz">CHECK PRICE</a>
                </div>
              )}
              {hasAli && (
                <div className="zaidly-btn-container-kit">
                  <div className="ali-logo-box"><span>Ali</span>Express</div>
                  <div className="seo-glow-blur ali-blur"></div>
                  <a href={value.aliExpressUrl} target="_blank" rel="nofollow" className="zaidly-btn-kit ali">CHECK PRICE</a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
    affiliateButton: ({ value }: any) => {
      const isAli = (value.label || '').toLowerCase().includes('ali') || value.storeId === 'aliexpress';
      return (
        <div className="zaidly-btn-standalone-inline">
          <div className="zaidly-btn-container-kit">
            {isAli ? (
              <div className="ali-logo-box"><span>Ali</span>Express</div>
            ) : (
              <div className="amz-logo-box"><span className="amz-text">amazon</span><div className="amz-arrow"></div></div>
            )}
            <div className={`seo-glow-blur ${isAli ? 'ali-blur' : 'amz-blur'}`}></div>
            <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn-kit ${isAli ? 'ali' : 'amz'}`}>{(value.label || 'CHECK PRICE').toUpperCase()}</a>
          </div>
        </div>
      );
    }
  }
};

export default function PortableVisualBlocks({ value }: { value: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!value) return null;

  return (
    <div className={`portable-text-wrapper ${isClient ? 'is-hydrated' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .portable-text-wrapper { width: 100%; color: #000; }
        .zaidly-inline-link { color: #be9b7b !important; text-decoration: underline; font-weight: bold; }
        .zaidly-markdown-area a { color: #be9b7b !important; font-weight: bold; }
        .zaidly-body-image-container { width: 100%; display: flex; flex-direction: column; align-items: flex-start; margin-top: 40px; margin-bottom: 30px; }
        .zaidly-main-img { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: block; margin-bottom: 10px !important; }
        .zaidly-alt-caption { text-align: left; font-size: 13px; color: #6b7280; font-style: italic; font-weight: 500; }
        .zaidly-blockquote { border-left: 5px solid #be9b7b; background: #ffffff; padding: 2rem; margin: 3rem 0; font-style: italic; color: #4a3728; border-radius: 0 16px 16px 0; }
        .zaidly-markdown-area table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 14px; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee; }
        .zaidly-markdown-area th { background-color: #3C2F2F; color: #fff; padding: 16px; text-align: left; }
        .zaidly-markdown-area td { padding: 14px 16px; border-bottom: 1px solid #eee; color: #4a3728; }
        .zaidly-card { margin: 3rem 0; padding: 2rem; border: 1.5px solid rgba(74,55,40,0.1); border-radius: 16px; background: #fff; }
        .zaidly-card-title { font-family: serif; font-style: italic; font-weight: 900; font-size: 1.85rem; color: #4a3728; }
        .zaidly-btn-kit { padding: 10px 18px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; min-width: 115px; position: relative; z-index: 2; transition: 0.2s; }
        .amz { background: #ff9900; color: #000; }
        .ali { background: #e62e04; color: #fff; }
        .amz-logo-box { height: 35px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
        .amz-text { font-family: sans-serif; font-weight: 900; font-size: 18px; color: #000; }
        .amz-arrow { width: 45px; height: 10px; border-bottom: 3px solid #ff9900; border-radius: 0 0 50% 50%; }
        .seo-glow-blur { position: absolute; bottom: 0; left: 10%; width: 80%; height: 50%; filter: blur(12px); opacity: 0.4; z-index: -1; }
        .amz-blur { background: #ff9900; }
        .ali-blur { background: #e62e04; }
        @media (max-width: 768px) {
          .zaidly-card-body { flex-direction: row; flex-wrap: wrap; justify-content: space-between; gap: 1rem; }
          .zaidly-card-actions { width: 100%; justify-content: space-between; gap: 10px; }
          .zaidly-btn-kit { flex: 1; min-width: unset; }
          .divider { display: none; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
