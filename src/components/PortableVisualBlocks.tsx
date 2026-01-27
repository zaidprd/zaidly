/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// Link Cerah Menyala (#d97706)
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

// Heading ID untuk TOC
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      
      // Deteksi Markdown (Tabel, Heading manual, Bold, List)
      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || /^\s*[-*+]\s+/m.test(rawText);

      // Jika Rich Text murni atau ada tag legacy, jangan pakai marked
      if (rawText.includes('{%') || (!isMarkdown && !rawText.includes('**'))) {
        return <p className="zaidly-normal-p">{children}</p>;
      }

      const html = marked.parse(rawText, { renderer }) as string;
      return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
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
    // GAMBAR R2 TETAP PAKAI LOGIKA _KEY YANG SUDAH BERHASIL
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || ''} loading="lazy" />
          {value.alt && <p className="zaidly-alt-caption">{value.alt}</p>}
        </div>
      );
    },
    // PRODUCT REVIEW CARD MEWAH (DENGAN BINTANG & HARGA)
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
              {value.amazonUrl && (
                <div className="btn-wrap">
                  <div className="amz-logo-mini">amazon<div className="smile-line"></div></div>
                  <a href={value.amazonUrl} target="_blank" rel="nofollow" className="zaidly-btn amz">CHECK PRICE</a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
    // TOMBOL STANDALONE SEJAJAR DENGAN LOGO DETAIL
    affiliateButton: ({ value }: any) => {
      const label = (value.label || '').toLowerCase();
      const isAli = value.storeId === 'aliexpress' || label.includes('ali');
      return (
        <div className="zaidly-btn-container">
          <div className="zaidly-logo-box">
            {isAli ? (
              <div className="ali-logo-ui"><span>Ali</span>Express</div>
            ) : (
              <div className="amz-logo-ui">amazon<div className="smile-line"></div></div>
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
        .portable-text-wrapper { display: block; width: 100%; color: #000; }
        
        /* LINK CERAH */
        .zaidly-inline-link, .zaidly-markdown-area a { color: #d97706 !important; text-decoration: underline; font-weight: 800; }

        /* TOMBOL SEJAJAR */
        .zaidly-btn-container { display: inline-flex !important; flex-direction: column; align-items: center; width: 155px; margin-right: 20px; margin-bottom: 30px; vertical-align: top; }
        .zaidly-logo-box { height: 35px; display: flex; align-items: center; margin-bottom: 8px; }
        .zaidly-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .ali { background: #e62e04; color: #fff; }
        .amz { background: #ff9900; color: #000; }

        /* LOGO DETAIL */
        .ali-logo-ui { color: #e62e04; font-weight: 900; font-size: 14px; }
        .ali-logo-ui span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 3px; }
        .amz-logo-ui, .amz-logo-mini { color: #000; font-weight: 900; font-size: 17px; font-family: sans-serif; position: relative; }
        .smile-line { width: 100%; height: 4px; border-bottom: 2.5px solid #ff9900; border-radius: 50%; margin-top: -6px; }

        /* PRODUCT REVIEW CARD MEWAH */
        .zaidly-card-review { margin: 3rem 0; padding: 2rem; border: 1.5px solid #eee; border-radius: 16px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .zaidly-card-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 1.5rem; color: #4a3728; }
        .zaidly-card-content { display: flex; align-items: center; gap: 2.5rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .zaidly-stat { display: flex; flex-direction: column; }
        .zaidly-label { font-size: 10px; font-weight: 900; color: #aaa; margin-bottom: 5px; }
        .stars { font-size: 1.2rem; display: flex; gap: 2px; }
        .score-num { font-weight: 900; font-style: italic; color: #4a3728; }
        .price-val { font-size: 1.5rem; font-weight: 900; color: #4a3728; }
        .zaidly-divider { width: 1px; height: 50px; background: #eee; }
        .zaidly-card-btns { margin-left: auto; }
        .btn-wrap { display: flex; flex-direction: column; align-items: center; }

        /* TABEL PREMIUM (HEADER COKELAT) */
        table { width: 100%; border-collapse: collapse; margin: 2.5rem 0; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
        th { background: #3C2F2F; color: #fff; padding: 16px; text-align: left; font-size: 13px; text-transform: uppercase; }
        td { padding: 14px 16px; border-bottom: 1px solid #eee; font-weight: 600; color: #4a3728; }

        .zaidly-normal-p, .zaidly-markdown-area p { margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.125rem; }
        .zaidly-img-box img { width: 100%; border-radius: 12px; border-bottom: 4px solid #4a3728; margin: 2rem 0; }
        .zaidly-alt-caption { font-size: 13px; color: #6b7280; font-style: italic; text-align: center; margin-top: -1rem; margin-bottom: 2rem; }

        @media (max-width: 768px) {
          .zaidly-card-content { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .zaidly-divider { display: none; }
          .zaidly-card-btns { width: 100%; margin-left: 0; }
          .zaidly-btn-container { width: 140px; margin-right: 10px; }
        }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
