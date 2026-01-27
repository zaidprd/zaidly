/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// 1. LINK BERWARNA CERAH (#d97706)
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

// 2. HEADINGS UNTUK TOC
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

// 3. RENDER TABEL MODERN DENGAN WARNA BARIS BERBEDA (ZEBRA STRIPES)
const RenderSanityTable = ({ value }: any) => {
  if (!value || !value.rows) return null;
  return (
    <div className="zaidly-table-container">
      <div className="zaidly-table-scroll-wrapper">
        <table className="zaidly-custom-table">
          <thead>
            <tr>
              {value.rows[0]?.cells?.map((cell: string, i: number) => (
                <th key={i}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.rows.slice(1).map((row: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                {row.cells?.map((cell: string, j: number) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      
      // FIX BUTTON ARTIKEL LAMA: Jangan biarkan 'marked' menyentuh shortcode {% %}
      if (rawText.includes('{%')) return <p className="zaidly-legacy-shortcode">{children}</p>;

      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || rawText.includes('**');
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    // BLOCKQUOTE BERWARNA
    blockquote: ({ children }: any) => (
      <blockquote className="zaidly-quote">{children}</blockquote>
    ),
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
              <div className="zaidly-stars-box flex items-center gap-1">
                <div className="stars flex">
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
                  <a href={value.amazonUrl} target="_blank" rel="nofollow" className="zaidly-btn amz">CHECK PRICE</a>
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
          <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn ${(store === 'aliexpress' || label.toLowerCase().includes('ali')) ? 'ali' : 'amz'}`}>
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
        
        /* WARNA LINK & QUOTE */
        .zaidly-inline-link, .zaidly-markdown-area a { color: #d97706 !important; text-decoration: underline; font-weight: 800; }
        .zaidly-quote { border-left: 5px solid #d97706; padding: 10px 20px; background: #fef3c7; font-style: italic; margin: 20px 0; border-radius: 0 8px 8px 0; }

        /* FIX TABEL: Hanya tabel yang bisa digulir */
        .zaidly-table-container { margin: 2rem 0; width: 100%; }
        .zaidly-table-scroll-wrapper { width: 100%; overflow-x: auto; border-radius: 12px; border: 1px solid #eee; -webkit-overflow-scrolling: touch; }
        
        table.zaidly-custom-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        table.zaidly-custom-table th { background: #3C2F2F !important; color: #fff !important; padding: 14px 16px; text-align: left; font-size: 13px; text-transform: uppercase; }
        table.zaidly-custom-table td { padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: 600; color: #4a3728; }
        
        /* WARNA TABEL BERBEDA (ZEBRA) */
        .row-even { background-color: #ffffff; }
        .row-odd { background-color: #f9f7f5; }

        /* BUTTON & LOGO */
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

        /* REVIEW CARD */
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
