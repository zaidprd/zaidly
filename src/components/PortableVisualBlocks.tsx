/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || /^\s*[-*+]\s+/m.test(rawText);
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    blockquote: ({ children }: any) => (
      <blockquote className="zaidly-blockquote">
        {children}
      </blockquote>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const imageUrl = value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-body-image-container">
          <img 
            src={imageUrl} 
            alt={value.alt || 'Zaidly Coffee Review'} 
            className="zaidly-main-img"
            loading="lazy"
          />
          {value.alt && <p className="zaidly-alt-caption">{value.alt}</p>}
        </div>
      );
    },

    productReviewCard: ({ value }: any) => {
      const hasAmazon = !!value.amazonUrl;
      const hasAli = !!value.aliExpressUrl;
      const rawRating = value.itemRating || 0;
      const stars = [1, 2, 3, 4, 5];

      // --- DATA SCHEMA UNTUK GOOGLE (BINTANG) ---
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": value.productName,
        "review": {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": rawRating,
            "bestRating": "5"
          },
          "author": { "@type": "Person", "name": "Zaidly Gear Lab" }
        },
        "offers": {
          "@type": "Offer",
          "price": value.itemPrice?.replace(/[^0-9.]/g, '') || "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      };

      return (
        <div className="zaidly-card">
          <script 
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} 
          />
          <h3 className="zaidly-card-title">{value.productName}</h3>
          <div className="zaidly-card-body">
            <div className="zaidly-card-stat">
              <span className="label">Expert Score</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {stars.map((num) => {
                    let starClass = num <= Math.floor(rawRating) ? "text-yellow-500" : "text-gray-200";
                    if (num === Math.ceil(rawRating) && rawRating % 1 !== 0) starClass += " opacity-60";
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
            {isAli ? <div className="ali-logo-box"><span>Ali</span>Express</div> : <div className="amz-logo-box"><span className="amz-text">amazon</span><div className="amz-arrow"></div></div>}
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
        
        .zaidly-body-image-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-top: 40px;
          margin-bottom: 30px;
        }
        .zaidly-main-img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: block;
          margin-bottom: 10px !important;
        }
        .zaidly-alt-caption {
          text-align: left;
          font-size: 13px;
          color: #6b7280;
          margin-top: 3px !important;
          margin-bottom: 0px !important;
          font-style: italic;
          font-family: sans-serif;
          padding-left: 4px;
          opacity: 1;
          font-weight: 500;
          line-height: 1.4;
        }

        .zaidly-blockquote { 
          border-left: 5px solid #be9b7b; background: #ffffff; padding: 2rem; 
          margin: 3rem 0; font-style: italic; font-family: serif; color: #4a3728;
          border-radius: 0 16px 16px 0; box-shadow: 0 10px 30px rgba(190, 155, 123, 0.12);
          position: relative;
        }
        .zaidly-blockquote::before {
          content: '“'; position: absolute; top: -15px; left: 15px; font-size: 90px;
          color: rgba(190, 155, 123, 0.1); font-family: serif; line-height: 1; z-index: 0;
        }

        .zaidly-markdown-area table { 
          width: 100%; border-collapse: collapse; margin: 2.5rem 0; font-family: inherit; font-size: 14px; 
          background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); 
          border: 1px solid rgba(74, 55, 40, 0.08);
        }
        .zaidly-markdown-area th { 
          background-color: #3C2F2F; color: #FDFCF0; font-weight: 800; text-transform: uppercase; 
          letter-spacing: 0.05em; padding: 16px; text-align: left; font-size: 11px;
        }
        .zaidly-markdown-area td { padding: 14px 16px; border-bottom: 1px solid rgba(74, 55, 40, 0.06); color: #4a3728; }
        .zaidly-markdown-area tr:nth-child(even) { background-color: #FDFCF0; }

        .zaidly-card { margin: 3rem 0; padding: 2rem; border: 1.5px solid rgba(74,55,40,0.1); border-radius: 16px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .zaidly-card-title { font-family: serif; font-style: italic; font-weight: 900; font-size: 1.85rem; margin-bottom: 1.5rem; color: #4a3728; }
        .zaidly-card-body { display: flex; align-items: center; gap: 2.5rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .zaidly-card-stat { display: flex; flex-direction: column; }
        .label { font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
        .divider { width: 1px; height: 50px; background: #eee; }
        .zaidly-card-actions { margin-left: auto; display: flex; gap: 15px; }
        .zaidly-btn-container-kit { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
        .zaidly-btn-kit { padding: 10px 18px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; min-width: 115px; position: relative; z-index: 2; transition: transform 0.2s; }
        .amz { background: #ff9900; color: #000; }
        .ali { background: #e62e04; color: #fff; }
        .amz-logo-box { height: 35px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; margin-bottom: 4px; }
        .amz-text { font-family: sans-serif; font-weight: 900; font-size: 18px; color: #000; line-height: 1; }
        .amz-arrow { width: 45px; height: 10px; border-bottom: 3px solid #ff9900; border-radius: 0 0 50% 50%; margin-top: -4px; position: relative; }
        .amz-arrow::after { content: ''; position: absolute; right: -2px; bottom: -3px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #ff9900; transform: rotate(-25deg); }
        .ali-logo-box { height: 35px; display: flex; align-items: center; font-weight: 900; color: #e62e04; font-size: 14px; margin-bottom: 4px; }
        .ali-logo-box span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 4px; }
        .seo-glow-blur { position: absolute; bottom: 0; left: 10%; width: 80%; height: 50%; filter: blur(12px); opacity: 0.4; z-index: -1; }
        .amz-blur { background: #ff9900; }
        .ali-blur { background: #e62e04; }
        .zaidly-btn-standalone-inline { display: inline-flex !important; vertical-align: top; margin-right: 20px; margin-bottom: 30px; margin-top: 1rem; }
        @media (max-width: 768px) {
          .zaidly-card-body { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .divider { display: none; }
          .zaidly-card-actions { margin-left: 0; width: 100%; display: flex !important; flex-direction: row !important; justify-content: flex-start; gap: 12px; }
          .zaidly-btn-standalone-inline { display: inline-flex !important; margin-right: 12px; width: auto; }
          .zaidly-btn-kit { min-width: 105px; padding: 10px 14px; }
          .zaidly-markdown-area table { display: block; overflow-x: auto; white-space: nowrap; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}