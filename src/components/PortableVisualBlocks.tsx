/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// 1. HEADING ID (UNTUK TOC)
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

// 2. LINK CERAH MENYALA
renderer.link = ({ href, text }: any) => 
  `<a href="${href}" rel="nofollow sponsored noopener" target="_blank" class="zaidly-link-styled">${text}</a>`;

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
      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || /^\s*[-*+]\s+/m.test(rawText);
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        // BUNGKUS HTML MARKDOWN DISINI BIAR TABELNYA PUNYA DIV SCROLLER OTOMATIS
        return <section className="zaidly-markdown-gate" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    blockquote: ({ children }: any) => (
      <blockquote className="zaidly-blockquote">
        <span className="quote-icon">“</span>
        {children}
      </blockquote>
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
    productReviewCard: ({ value }: any) => {
      const hasAmazon = !!value.amazonUrl;
      const hasAli = !!value.aliExpressUrl;
      const rawRating = value.itemRating || 0;
      const stars = [1, 2, 3, 4, 5];
      const productImage = value.asset?.url || value.imageUrl || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : "https://zaidly.com/images/default-product.webp");
      const productDesc = value.description || `Expert gear review of ${value.productName} by Zaidly Gear Lab.`;

      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": value.productName,
        "image": [productImage],
        "description": productDesc,
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
        .portable-text-wrapper { width: 100%; color: #000; overflow-x: hidden; }
        
        /* 1. LINK STYLE: ORANGE NYALA */
        .zaidly-link-styled, .zaidly-markdown-gate a { color: #ff8c00 !important; font-weight: 800; text-decoration: underline; text-underline-offset: 4px; }

        /* 2. BLOCKQUOTE */
        .zaidly-blockquote { border-left: 6px solid #ff8c00; background: #fffcf0; padding: 2.2rem; margin: 3rem 0; font-style: italic; border-radius: 0 16px 16px 0; position: relative; }
        .quote-icon { position: absolute; top: -10px; left: 15px; font-size: 5rem; color: #ff8c00; opacity: 0.1; }

        /* 3. TABLE SCROLL: LOGIKA CSS TEMBUS (HANYA TABEL) */
        .zaidly-markdown-gate { width: 100%; }
        
        /* Mencari tabel di dalam markdown gate */
        .zaidly-markdown-gate table { 
           display: block; 
           width: 100%; 
           overflow-x: auto; 
           -webkit-overflow-scrolling: touch; 
           border-collapse: collapse; 
           margin: 2.5rem 0; 
           border-radius: 12px;
           background: #fff;
           border: 1px solid rgba(74, 55, 40, 0.1);
        }
        
        /* Menjaga lebar kolom di mobile biar beneran scroll */
        @media (max-width: 768px) {
          .zaidly-markdown-gate th, .zaidly-markdown-gate td { min-width: 140px; }
        }

        .zaidly-markdown-gate th { background-color: #3C2F2F; color: #fff; padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 800; }
        .zaidly-markdown-gate td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; color: #4a3728; font-size: 14px; }
        .zaidly-markdown-gate tr:nth-child(even) { background: #ffffff; }
        .zaidly-markdown-gate tr:nth-child(odd) { background: #f9f7f5; }

        /* 4. BUTTONS & CARDS (TETAP SEMPURNA) */
        .zaidly-card { margin: 3rem 0; padding: 2.5rem; border: 1.5px solid rgba(74,55,40,0.1); border-radius: 24px; background: #fff; box-shadow: 0 15px 45px rgba(0,0,0,0.04); }
        .zaidly-card-title { font-family: serif; font-style: italic; font-weight: 900; font-size: 1.85rem; margin-bottom: 1.5rem; color: #4a3728; }
        .zaidly-card-body { display: flex; align-items: center; gap: 2.5rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
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
        .zaidly-btn-standalone-inline { display: inline-flex !important; vertical-align: top; margin-right: 20px; margin-bottom: 1rem; margin-top: 1rem; }
        
        @media (max-width: 768px) {
          .zaidly-card-body { flex-direction: row; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; }
          .zaidly-card-actions { width: 100%; margin-left: 0; justify-content: space-between; gap: 10px; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
