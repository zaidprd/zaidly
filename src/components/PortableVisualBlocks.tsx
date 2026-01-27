/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

// Konfigurasi Marked yang lebih aman & clean
const renderer = new marked.Renderer();

// 1. LINK: SEO-Clean dengan 'sponsored'
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" rel="nofollow sponsored noopener" target="_blank" class="zaidly-inline-link">${text}</a>`;
};

// 2. HEADING MARKDOWN: Dialihkan agar tidak bentrok dengan ID Sanity (opsional, tapi tetap aman)
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

const RenderSanityTable = ({ value }: any) => {
  if (!value || !value.rows) return null;
  return (
    <div className="zaidly-table-scroller">
      <table className="zaidly-modern-table">
        <thead>
          <tr>
            {value.rows[0]?.cells?.map((cell: string, i: number) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.rows.slice(1).map((row: any, i: number) => (
            <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
              {row.cells?.map((cell: string, j: number) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StoreLogo = ({ store, label }: { store: string; label: string }) => {
  const isAli = store === 'aliexpress' || label.toLowerCase().includes('ali');
  return (
    <div className="zaidly-logo-box">
      {isAli ? (
        <div className="ali-logo-brand"><span>Ali</span>Express</div>
      ) : (
        <div className="amz-logo-brand">amazon<div className="amz-arrow"></div></div>
      )}
    </div>
  );
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      if (rawText.includes('{%')) return <p className="zaidly-legacy-btn">{children}</p>;

      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || rawText.includes('**');
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    blockquote: ({ children }: any) => <blockquote className="zaidly-premium-quote">{children}</blockquote>,
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
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || ''} loading="lazy" />
        </div>
      );
    },
    table: RenderSanityTable,
    productReviewCard: ({ value }: any) => {
      const rawRating = value.itemRating || 0;
      const stars = [1, 2, 3, 4, 5];
      return (
        <div className="zaidly-card-review">
          <h3 className="zaidly-card-title">{value.productName}</h3>
          <div className="zaidly-card-content">
            <div className="zaidly-stat">
              <span className="zaidly-label">EXPERT SCORE</span>
              <div className="zaidly-stars-box">
                <div className="stars">
                  {stars.map((n) => (
                    <span key={n} style={{ color: n <= Math.floor(rawRating) ? '#ff9900' : '#ddd' }}>★</span>
                  ))}
                </div>
                <span className="score-num">({rawRating})</span>
              </div>
            </div>
            <div className="zaidly-divider"></div>
            <div className="zaidly-stat">
              <span className="zaidly-label">PRICE POINT</span>
              <span className="price-val">{value.itemPrice || 'Check'}</span>
            </div>
            <div className="zaidly-card-btns">
               <div className="zaidly-btn-container no-margin">
                  <StoreLogo store="amazon" label="amazon" />
                  <a href={value.amazonUrl} target="_blank" rel="nofollow sponsored noopener" className="zaidly-btn amz">CHECK PRICE</a>
               </div>
            </div>
          </div>
        </div>
      );
    },
    affiliateButton: ({ value }: any) => {
      const label = value.label || 'CHECK PRICE';
      const store = value.storeId || '';
      return (
        <div className="zaidly-btn-container">
          <StoreLogo store={store} label={label} />
          <a href={value.url} target="_blank" rel="nofollow sponsored noopener" className={`zaidly-btn ${(store === 'aliexpress' || label.toLowerCase().includes('ali')) ? 'ali' : 'amz'}`}>
            {label.toUpperCase()}
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
        .portable-text-wrapper { display: block; width: 100%; color: #000; }
        .zaidly-inline-link, .zaidly-markdown-content a { color: #d97706 !important; text-decoration: underline; font-weight: 800; }
        .zaidly-premium-quote { border-left: 5px solid #d97706; padding: 15px 25px; background: #fffcf0; font-style: italic; margin: 25px 0; border-radius: 0 10px 10px 0; font-size: 1.1rem; }

        .zaidly-table-scroller { width: 100%; overflow-x: auto; margin: 2.5rem 0; border-radius: 12px; border: 1px solid #eee; -webkit-overflow-scrolling: touch; }
        table.zaidly-modern-table, .zaidly-markdown-content table { width: 100%; border-collapse: collapse; min-width: 600px; }
        
        .zaidly-table-scroller th, .zaidly-markdown-content th { background: #3C2F2F !important; color: #fff !important; padding: 16px; text-align: left; text-transform: uppercase; font-size: 13px; }
        .zaidly-table-scroller td, .zaidly-markdown-content td { padding: 14px 16px; border-bottom: 1px solid #eee; font-weight: 600; color: #4a3728; }
        .even { background-color: #ffffff; }
        .odd { background-color: #fcfaf8; }

        .zaidly-btn-container { display: inline-flex !important; flex-direction: column; align-items: center; width: 155px; margin-right: 20px; margin-bottom: 30px; vertical-align: top; }
        .no-margin { margin-right: 0 !important; margin-bottom: 0 !important; }
        .zaidly-logo-box { height: 35px; display: flex; align-items: center; margin-bottom: 8px; }
        .amz-logo-brand { color: #000; font-weight: 900; font-size: 18px; position: relative; }
        .amz-arrow { width: 100%; height: 5px; border-bottom: 2.5px solid #ff9900; border-radius: 0 0 50% 50%; margin-top: -6px; }
        .ali-logo-brand { color: #e62e04; font-weight: 900; font-size: 14px; }
        .ali-logo-brand span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 3px; }
        .zaidly-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-align: center; display: block; text-decoration: none; }
        .amz { background: #ff9900; color: #000; }
        .ali { background: #e62e04; color: #fff; }

        .zaidly-card-review { margin: 3rem 0; padding: 2.5rem; border: 1.5px solid #eee; border-radius: 16px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .zaidly-card-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 1.5rem; color: #4a3728; }
        .zaidly-card-content { display: flex; align-items: center; gap: 2rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .zaidly-divider { width: 1px; height: 50px; background: #eee; }
        .score-num, .price-val { font-weight: 900; color: #4a3728; font-size: 1.2rem; }

        .zaidly-normal-p { margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.125rem; }
        .zaidly-img-box img { width: 100%; border-radius: 12px; border-bottom: 4px solid #4a3728; margin: 2rem 0; }

        @media (max-width: 768px) {
          .zaidly-card-content { flex-direction: column; align-items: flex-start; }
          .zaidly-divider { display: none; }
          .zaidly-btn-container { width: 140px; margin-right: 10px; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
