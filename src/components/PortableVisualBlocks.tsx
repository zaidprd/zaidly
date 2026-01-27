/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// Renderer untuk Link Cerah (#d97706)
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      if (rawText.includes('{%')) return <p className="zaidly-normal-p">{children}</p>;

      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText);
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    h2: ({ children }: any) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h2 id={id} className="zaidly-h2" style={{scrollMarginTop: '120px'}}>{children}</h2>;
    },
    h3: ({ children }: any) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h3 id={id} className="zaidly-h3" style={{scrollMarginTop: '120px'}}>{children}</h3>;
    }
  },
  types: {
    // FIX GAMBAR R2
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || ''} loading="lazy" />
        </div>
      );
    },
    // MENGEMBALIKAN PRODUCT REVIEW CARD YANG HILANG
    productReviewCard: ({ value }: any) => {
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
                  {stars.map((num) => (
                    <span key={num} className={`${num <= Math.floor(rawRating) ? "text-yellow-500" : "text-gray-200"} text-xl`}>★</span>
                  ))}
                </div>
                <span className="font-black italic">({rawRating})</span>
              </div>
            </div>
            <div className="divider"></div>
            <div className="zaidly-card-stat">
              <span className="label">Price Point</span>
              <span className="value price">{value.itemPrice || 'Check'}</span>
            </div>
            <div className="zaidly-card-actions">
              {value.amazonUrl && (
                <a href={value.amazonUrl} target="_blank" rel="nofollow" className="zaidly-btn amz">CHECK PRICE</a>
              )}
            </div>
          </div>
        </div>
      );
    },
    // TOMBOL SEJAJAR
    affiliateButton: ({ value }: any) => {
      const label = (value.label || '').toLowerCase();
      const isAli = value.storeId === 'aliexpress' || label.includes('ali');
      return (
        <div className="zaidly-btn-container">
          <div className="zaidly-logo-box">
            {isAli ? (
              <div className="ali-logo"><span>Ali</span>Express</div>
            ) : (
              <div className="amz-logo">amazon</div>
            )}
          </div>
          <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn ${isAli ? 'ali' : 'amz'}`}>
            {(value.label || 'CHECK PRICE').toUpperCase()}
          </a>
        </div>
      );
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
        .portable-text-wrapper { display: block; width: 100%; }
        .zaidly-inline-link { color: #d97706 !important; text-decoration: underline; font-weight: 800; }
        
        /* TOMBOL SEJAJAR */
        .zaidly-btn-container {
          display: inline-flex !important;
          flex-direction: column;
          align-items: center;
          width: 155px;
          margin-right: 18px;
          margin-bottom: 30px;
          vertical-align: top;
        }

        .zaidly-logo-box { height: 35px; display: flex; align-items: center; margin-bottom: 8px; font-weight: 900; }
        .zaidly-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; display: block; }
        .ali { background: #e62e04; color: white; }
        .amz { background: #ff9900; color: black; }
        
        /* PRODUCT CARD STYLE */
        .zaidly-card { margin: 2rem 0; padding: 1.5rem; border: 1px solid #eee; border-radius: 12px; }
        .zaidly-card-title { font-weight: 900; font-size: 1.5rem; margin-bottom: 1rem; }
        .zaidly-card-body { display: flex; align-items: center; gap: 2rem; border-top: 1px solid #f5f5f5; padding-top: 1rem; }
        .divider { width: 1px; height: 40px; background: #eee; }
        .label { font-size: 10px; text-transform: uppercase; color: #888; }

        .zaidly-img-box img { width: 100%; height: auto; margin: 2rem 0; border-bottom: 4px solid #4a3728; }
        table { width: 100%; border-collapse: collapse; margin: 2rem 0; border: 1px solid #eee; }
        th { background: #3C2F2F; color: #fff; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
