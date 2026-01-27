/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// 1. LINK ORANYE KERAS
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" rel="nofollow sponsored noopener" target="_blank" class="zaidly-link">${text}</a>`;
};

// 2. RENDERER TABEL MARKDOWN (3 WARNA)
renderer.table = ({ header, body }: any) => {
  return `
    <div class="zaidly-table-scroller">
      <table class="zaidly-3color-table">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
};

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      if (rawText.includes('{%')) return <p className="zaidly-legacy-p">{children}</p>;

      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || rawText.includes('**');
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-md-gate" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-p">{children}</p>;
    },
    blockquote: ({ children }: any) => <blockquote className="zaidly-quote">{children}</blockquote>,
    h2: ({ children }: any) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }: any) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h3 id={id}>{children}</h3>;
    },
  },
  types: {
    // 3. TABEL SANITY OBJECT (3 WARNA)
    table: ({ value }: any) => (
      <div className="zaidly-table-scroller">
        <table className="zaidly-3color-table">
          <thead>
            <tr>{value.rows[0]?.cells?.map((c: any, i: number) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {value.rows.slice(1).map((r: any, i: number) => (
              <tr key={i}>
                {r.cells?.map((c: any, j: number) => <td key={j}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      return imageUrl ? <div className="zaidly-img-box"><img src={imageUrl} alt={value.alt || ''} loading="lazy" /></div> : null;
    },
    // PRODUCT CARD & BUTTONS (Identik & Sejajar)
    productReviewCard: ({ value }: any) => {
      const rawRating = value.itemRating || 0;
      const stars = [1, 2, 3, 4, 5];
      return (
        <div className="zaidly-card">
          <h3 className="card-title">{value.productName}</h3>
          <div className="card-body">
            <div className="stat-box">
              <span className="label">EXPERT SCORE</span>
              <div className="stars-row">
                {stars.map((n) => <span key={n} style={{ color: n <= Math.floor(rawRating) ? '#ff9900' : '#ddd' }}>★</span>)}
                <span className="num">({rawRating})</span>
              </div>
            </div>
            <div className="v-line"></div>
            <div className="stat-box">
              <span className="label">PRICE POINT</span>
              <span className="price">{value.itemPrice || 'Check'}</span>
            </div>
            <div className="cta-area">
               <div className="btn-stack">
                  <div className="amz-logo">amazon<div className="amz-arrow"></div></div>
                  <a href={value.amazonUrl} target="_blank" rel="nofollow sponsored noopener" className="z-btn amz-bg">CHECK PRICE</a>
               </div>
            </div>
          </div>
        </div>
      );
    },
    affiliateButton: ({ value }: any) => {
      const label = value.label || 'CHECK PRICE';
      const isAli = value.storeId === 'aliexpress' || label.toLowerCase().includes('ali');
      return (
        <div className="btn-stack inline">
          {isAli ? <div className="ali-logo"><span>Ali</span>Express</div> : <div className="amz-logo">amazon<div className="amz-arrow"></div></div>}
          <a href={value.url} target="_blank" rel="nofollow sponsored noopener" className={`z-btn ${isAli ? 'ali-bg' : 'amz-bg'}`}>
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
    <div className={`zaidly-wrapper ${isClient ? 'is-ready' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .zaidly-wrapper { width: 100%; color: #000; }
        
        /* WARNA LINK & QUOTE */
        .zaidly-link, .zaidly-wrapper a { color: #d97706 !important; font-weight: 800; text-decoration: underline; }
        .zaidly-quote { border-left: 5px solid #d97706; padding: 15px 20px; background: #fffcf0; margin: 2rem 0; border-radius: 0 8px 8px 0; font-style: italic; }

        /* TABEL 3 WARNA & GULIR SAMPING */
        .zaidly-table-scroller { width: 100%; overflow-x: auto; margin: 2.5rem 0; border-radius: 12px; border: 1px solid #eee; -webkit-overflow-scrolling: touch; }
        table.zaidly-3color-table, .zaidly-md-gate table { width: 100%; border-collapse: collapse; min-width: 600px; }

        /* WARNA 1: HEADER (COKELAT GELAP) */
        .zaidly-table-scroller th, .zaidly-md-gate th { background: #3C2F2F !important; color: #fff !important; padding: 16px; text-align: left; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em; }

        /* WARNA 2: BARIS GENAP (PUTIH) */
        .zaidly-table-scroller tr:nth-child(even), .zaidly-md-gate tr:nth-child(even) { background-color: #ffffff; }

        /* WARNA 3: BARIS GANJIL (KREM HALUS/GRAY-ISH) */
        .zaidly-table-scroller tr:nth-child(odd), .zaidly-md-gate tr:nth-child(odd) { background-color: #f9f7f5; }

        .zaidly-table-scroller td, .zaidly-md-gate td { padding: 14px 16px; border-bottom: 1px solid #eee; color: #4a3728; font-weight: 600; }

        /* BUTTONS & LOGOS */
        .btn-stack { display: inline-flex; flex-direction: column; align-items: center; width: 155px; margin-right: 18px; margin-bottom: 25px; vertical-align: top; }
        .btn-stack.inline { display: inline-flex !important; }
        .amz-logo { color: #000; font-weight: 900; font-size: 18px; position: relative; font-family: sans-serif; height: 35px; display: flex; align-items: center; }
        .amz-arrow { width: 100%; height: 5px; border-bottom: 2.5px solid #ff9900; border-radius: 0 0 50% 50%; margin-top: -6px; }
        .ali-logo { color: #e62e04; font-weight: 900; font-size: 14px; height: 35px; display: flex; align-items: center; }
        .ali-logo span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 3px; }
        .z-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-align: center; display: block; text-decoration: none; }
        .amz-bg { background: #ff9900; color: #000; }
        .ali-bg { background: #e62e04; color: #fff; }

        /* PRODUCT CARD */
        .zaidly-card { margin: 3rem 0; padding: 2.2rem; border: 1.5px solid #eee; border-radius: 16px; background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
        .card-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 1.2rem; color: #4a3728; }
        .card-body { display: flex; align-items: center; gap: 2rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .v-line { width: 1px; height: 55px; background: #eee; }
        .label { font-size: 10px; font-weight: 900; color: #aaa; margin-bottom: 5px; display: block; }
        .price { font-weight: 900; color: #4a3728; font-size: 1.4rem; }
        .cta-area { margin-left: auto; }

        h2, h3 { scroll-margin-top: 120px; font-weight: 900; color: #000; margin-top: 2.5rem; }
        .zaidly-img-box img { width: 100%; border-radius: 12px; border-bottom: 4px solid #4a3728; margin: 2rem 0; }

        @media (max-width: 768px) {
          .card-body { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .v-line { display: none; }
          .cta-area { width: 100%; margin-left: 0; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
