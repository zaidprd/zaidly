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
    h2: ({ children }: any) => {
      const text = Array.isArray(children) ? children.join('') : children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h2 id={id} className="zaidly-h2">{children}</h2>;
    },
    h3: ({ children }: any) => {
      const text = Array.isArray(children) ? children.join('') : children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h3 id={id} className="zaidly-h3">{children}</h3>;
    }
  },
  types: {
    productReviewCard: ({ value }: any) => {
      const hasAmazon = !!value.amazonUrl;
      const hasAli = !!value.aliExpressUrl;
      const rawRating = value.itemRating || 0;
      const stars = [1, 2, 3, 4, 5];

      return (
        <div className="zaidly-card">
          <h3 className="zaidly-card-title">{value.productName}</h3>
          <div className="zaidly-card-body">
            <div className="zaidly-card-stat">
              <span className="label">Expert Score</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {stars.map((num) => {
                    let starClass = "text-gray-200 text-xl";
                    if (num <= Math.floor(rawRating)) {
                      starClass = "text-yellow-500 text-xl";
                    } else if (num === Math.ceil(rawRating) && rawRating % 1 !== 0) {
                      starClass = "text-yellow-500 text-xl opacity-60";
                    }
                    return <span key={num} className={starClass}>★</span>;
                  })}
                </div>
                <span className="font-black text-lg text-coffee-dark italic">({rawRating})</span>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="zaidly-card-stat">
              <span className="label">Price Point</span>
              <span className="value price text-2xl font-black text-coffee-dark">{value.itemPrice || 'Check Link'}</span>
            </div>

            <div className="zaidly-card-actions">
              {hasAmazon && (
                <div className="zaidly-btn-container-kit">
                  <div className="zaidly-logo-box-kit">
                    <div className="amz-logo">amazon<div className="smile"></div></div>
                  </div>
                  <div className="seo-glow-blur amz-blur"></div>
                  <a href={value.amazonUrl} target="_blank" rel="nofollow" className="zaidly-btn-kit amz">CHECK PRICE</a>
                </div>
              )}
              {hasAli && (
                <div className="zaidly-btn-container-kit">
                  <div className="zaidly-logo-box-kit">
                    <div className="ali-logo"><span>Ali</span>Express</div>
                  </div>
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
      const label = (value.label || '').toLowerCase();
      const isAli = value.storeId === 'aliexpress' || label.includes('ali');
      return (
        <div className="zaidly-btn-standalone-inline">
          <div className="zaidly-btn-container-kit">
            <div className="zaidly-logo-box-kit">
              {isAli ? <div className="ali-logo"><span>Ali</span>Express</div> : <div className="amz-logo">amazon<div className="smile"></div></div>}
            </div>
            <div className={`seo-glow-blur ${isAli ? 'ali-blur' : 'amz-blur'}`}></div>
            <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn-kit ${isAli ? 'ali' : 'amz'}`}>{(value.label || 'CHECK PRICE').toUpperCase()}</a>
          </div>
        </div>
      );
    },
    image: ({ value }: any) => {
      const imageUrl = value.url || `https://r2.zaidly.com/blog/body-${value._key}.webp`;
      return <div className="zaidly-img-box"><img src={imageUrl} alt={value.alt || 'Zaidly Review'} loading="lazy" /></div>;
    },
  },
};

export default function PortableVisualBlocks({ value }: { value: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!value) return null;

  return (
    <div className={`portable-text-wrapper ${isClient ? 'is-hydrated' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .portable-text-wrapper { display: block; width: 100%; color: #000; }
        .zaidly-card { margin: 3rem 0; padding: 2rem; border: 1.5px solid rgba(74, 55, 40, 0.1); border-radius: 16px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .zaidly-card-title { font-family: ui-serif, Georgia, serif; font-style: italic; font-weight: 900; font-size: 1.85rem; margin: 0 0 1.5rem 0; color: #4a3728; text-transform: capitalize; }
        .zaidly-card-body { display: flex; align-items: center; gap: 2.5rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .zaidly-card-stat { display: flex; flex-direction: column; }
        .zaidly-card-stat .label { font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
        .divider { width: 1px; height: 50px; background: #eee; }
        .zaidly-card-actions { margin-left: auto; display: flex; gap: 15px; }
        
        /* THE KEY FIX: INLINE BLOCK FOR STANDALONE BUTTONS */
        .zaidly-btn-standalone-inline { 
           display: inline-flex !important; 
           vertical-align: top;
           margin-right: 20px;
           margin-bottom: 30px;
           margin-top: 1rem;
        }

        .zaidly-btn-container-kit { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; width: fit-content; }
        .zaidly-logo-box-kit { height: 35px; display: flex; align-items: center; margin-bottom: 8px; font-weight: 900; }
        .zaidly-btn-kit { 
           padding: 10px 18px; border-radius: 6px; font-weight: 900; font-size: 11px; 
           text-decoration: none; text-align: center; display: block; min-width: 120px;
           position: relative; z-index: 2; transition: 0.2s;
        }
        
        .amz { background: #ff9900; color: black; }
        .ali { background: #e62e04; color: white; }
        .amz-logo { color: #000; font-family: sans-serif; font-size: 17px; position: relative; }
        .ali-logo { color: #e62e04; font-family: sans-serif; font-size: 14px; }
        .ali-logo span { background: #e62e04; color: white; padding: 2px 5px; border-radius: 4px; margin-right: 4px; }
        .smile { width: 35px; height: 3px; border-bottom: 2.5px solid #ff9900; border-radius: 50%; margin: -6px auto 0; }
        
        .seo-glow-blur { position: absolute; bottom: 0; left: 10%; width: 80%; height: 50%; filter: blur(12px); opacity: 0.4; z-index: -1; border-radius: 6px; }
        .amz-blur { background: #ff9900; }
        .ali-blur { background: #e62e04; }

        .zaidly-normal-p { margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.125rem; }
        .zaidly-img-box img { width: 100%; height: auto; margin: 2rem 0; border-radius: 8px; }
        
        @media (max-width: 768px) {
          .zaidly-card-body { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .divider { display: none; }
          .zaidly-card-actions { margin-left: 0; width: 100%; justify-content: flex-start; }
          .zaidly-btn-standalone-inline { display: flex !important; width: 100%; margin-right: 0; }
          .zaidly-btn-container-kit { width: 100%; }
          .zaidly-btn-kit { width: 100%; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}