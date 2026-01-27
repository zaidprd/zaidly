/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// LINK CERAH (#d97706)
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

// TABEL MARKDOWN CUSTOM RENDERER
renderer.table = ({ header, body }: any) => {
  return `
    <div class="zaidly-table-wrapper">
      <table class="zaidly-main-table">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
};

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

const RenderStoreLogo = ({ store, label }: { store: string; label: string }) => {
  const isAli = store === 'aliexpress' || label.toLowerCase().includes('ali');
  return (
    <div className="zaidly-logo-container">
      {isAli ? (
        <div className="ali-logo-brand"><span>Ali</span>Express</div>
      ) : (
        <div className="amz-logo-brand">
          amazon
          <div className="amz-arrow-icon"></div>
        </div>
      )}
    </div>
  );
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      if (rawText.includes('{%')) return <p className="zaidly-normal-p">{children}</p>;

      // DETEKSI TABEL & MARKDOWN
      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || rawText.includes('**');

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
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || ''} loading="lazy" />
        </div>
      );
    },
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
               <div className="zaidly-btn-wrapper no-margin">
                  <RenderStoreLogo store="amazon" label="amazon" />
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
        <div className="zaidly-btn-wrapper">
          <RenderStoreLogo store={store} label={label} />
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
        .zaidly-inline-link, .zaidly-markdown-area a { color: #d97706 !important; text-decoration: underline; font-weight: 800; }

        /* BUTTON SEJAJAR & LOGO */
        .zaidly-btn-wrapper { display: inline-flex !important; flex-direction: column; align-items: center; width: 155px; margin-right: 20px; margin-bottom: 30px; vertical-align: top; }
        .no-margin { margin-right: 0 !important; margin-bottom: 0 !important; }
        .zaidly-logo-container { height: 35px; display: flex; align-items: center; margin-bottom: 8px; }
        .amz-logo-brand { color: #000; font-weight: 900; font-size: 17px; font-family: sans-serif; position: relative; }
        .amz-arrow-icon { width: 100%; height: 5px; border-bottom: 2.5px solid #ff9900; border-radius: 0 0 50% 50%; margin-top: -6px; }
        .ali-logo-brand { color: #e62e04; font-weight: 900; font-size: 14px; }
        .ali-logo-brand span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 3px; }
        .zaidly-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; display: block; }
        .ali { background: #e62e04; color: #fff; }
        .amz { background: #ff9900; color: #000; }

        /* TABEL PREMIUM (HEADER COKELAT GELAP) */
        .zaidly-table-wrapper { width: 100%; overflow-x: auto; margin: 2.5rem 0; border-radius: 12px; border: 1px solid #eee; }
        table.zaidly-main-table { width: 100%; border-collapse: collapse; background: #fff; }
        table.zaidly-main-table th { background: #3C2F2F !important; color: #fff !important; padding: 16px; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        table.zaidly-main-table td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; color: #4a3728; font-weight: 600; font-size: 15px; }
        table.zaidly-main-table tr:last-child td { border-bottom: none; }

        /* REVIEW CARD */
        .zaidly-card-review { margin: 3rem 0; padding: 2rem; border: 1.5px solid #eee; border-radius: 16px; background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
        .zaidly-card-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 1.5rem; color: #4a3728; }
        .zaidly-card-content { display: flex; align-items: center; gap: 2rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .zaidly-divider { width: 1px; height: 50px; background: #eee; }
        .zaidly-label { font-size: 10px; font-weight: 900; color: #aaa; }
        .score-num, .price-val { font-weight: 900; color: #4a3728; font-size: 1.2rem; }

        .zaidly-normal-p, .zaidly-markdown-area p { margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.125rem; }
        .zaidly-img-box img { width: 100%; border-radius: 12px; border-bottom: 4px solid #4a3728; margin: 2rem 0; }

        @media (max-width: 768px) {
          .zaidly-card-content { flex-direction: column; align-items: flex-start; }
          .zaidly-divider { display: none; }
          .zaidly-btn-wrapper { width: 140px; margin-right: 10px; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
