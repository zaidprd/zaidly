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
                  <div className="amz-logo-box">
                    <span className="amz-text">amazon</span>
                    <div className="amz-arrow"></div>
                  </div>
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
              <div className="amz-logo-box">
                <span className="amz-text">amazon</span>
                <div className="amz-arrow"></div>
              </div>
            )}
            <div className={`seo-glow-blur ${isAli ? 'ali-blur' : 'amz-blur'}`}></div>
            <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn-kit ${isAli ? 'ali' : 'amz'}`}>
              {(value.label || 'CHECK PRICE').toUpperCase()}
            </a>
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
        .zaidly-card { margin: 3rem 0; padding: 2rem; border: 1.5px solid rgba(74,55,40,0.1); border-radius: 16px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .zaidly-card-title { font-family: serif; font-style: italic; font-weight: 900; font-size: 1.85rem; margin-bottom: 1.5rem; color: #4a3728; }
        .zaidly-card-body { display: flex; align-items: center; gap: 2.5rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .zaidly-card-stat { display: flex; flex-direction: column; }
        .label { font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
        .divider { width: 1px; height: 50px; background: #eee; }
        .zaidly-card-actions { margin-left: auto; display: flex; gap: 15px; }

        /* STANDARDIZED KIT */
        .zaidly-btn-container-kit { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
        .zaidly-btn-kit { padding: 10px 18px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; min-width: 115px; position: relative; z-index: 2; transition: transform 0.2s; }
        .zaidly-btn-kit:hover { transform: translateY(-2px); }
        .amz { background: #ff9900; color: #000; }
        .ali { background: #e62e04; color: #fff; }

        /* REAL AMAZON LOGO WITH ARROW SMILE */
        .amz-logo-box { height: 35px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; margin-bottom: 4px; }
        .amz-text { font-family: sans-serif; font-weight: 900; font-size: 18px; color: #000; line-height: 1; }
        .amz-arrow { 
          width: 45px; height: 10px; border-bottom: 3px solid #ff9900; border-radius: 0 0 50% 50%; 
          margin-top: -4px; position: relative; 
        }
        .amz-arrow::after { 
          content: ''; position: absolute; right: -2px; bottom: -3px; 
          border-left: 5px solid transparent; border-right: 5px solid transparent; 
          border-top: 6px solid #ff9900; transform: rotate(-25deg); 
        }

        /* ALI LOGO */
        .ali-logo-box { height: 35px; display: flex; align-items: center; font-weight: 900; color: #e62e04; font-size: 14px; margin-bottom: 4px; }
        .ali-logo-box span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 4px; }

        /* SEO GLOW */
        .seo-glow-blur { position: absolute; bottom: 0; left: 10%; width: 80%; height: 50%; filter: blur(12px); opacity: 0.4; z-index: -1; }
        .amz-blur { background: #ff9900; }
        .ali-blur { background: #e62e04; }

        /* INLINE BUTTONS */
        .zaidly-btn-standalone-inline { display: inline-flex !important; vertical-align: top; margin-right: 20px; margin-bottom: 30px; margin-top: 1rem; }

        @media (max-width: 768px) {
          .zaidly-card-body { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .divider { display: none; }
          /* HORIZONTAL DI MOBILE */
          .zaidly-card-actions { 
            margin-left: 0; width: 100%; display: flex !important; 
            flex-direction: row !important; justify-content: flex-start; gap: 12px; 
          }
          .zaidly-btn-standalone-inline { display: inline-flex !important; margin-right: 12px; width: auto; }
          .zaidly-btn-kit { min-width: 105px; padding: 10px 14px; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}