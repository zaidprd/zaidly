/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

renderer.link = ({ href, text }: any) => {
  return `<a href="${href}" rel="nofollow sponsored noopener" target="_blank" class="zaidly-link">${text}</a>`;
};

renderer.table = ({ header, body }: any) => {
  return `<div class="zaidly-table-scroller"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
};

// --- FUNGSI SAPU JAGAT: Bongkar Double Array & Nested Object Turso ---
const parseZaidlyCell = (cell: any): string => {
  if (!cell) return "";
  if (typeof cell === "string") return cell;
  
  // 1. Handle Array (Sanity sering kirim sel sebagai array di dalam array)
  if (Array.isArray(cell)) {
    return cell.map((item) => parseZaidlyCell(item)).join("");
  }

  // 2. Handle Object (Cari text atau gali children)
  if (typeof cell === "object") {
    if (cell.text) return cell.text;
    if (cell.children) return parseZaidlyCell(cell.children);
    // Fallback jika ada format lain
    if (cell._type === 'span' && cell.text) return cell.text;
  }

  return "";
};

const RenderSanityTable = ({ value }: any) => {
  if (!value || !value.rows) return null;
  return (
    <div className="zaidly-table-scroller">
      <table className="zaidly-3tone-table">
        <thead>
          <tr>
            {value.rows[0]?.cells?.map((cell: any, i: number) => (
              <th key={i}>{parseZaidlyCell(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.rows.slice(1).map((row: any, i: number) => (
            <tr key={i} className={i % 2 === 0 ? "even" : "odd"}>
              {row.cells?.map((cell: any, j: number) => (
                <td key={j}>{parseZaidlyCell(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join("") || "";
      if (rawText.includes("{%")) return <>{children}</>;

      const isMarkdown = rawText.includes("|") || /^#{1,6}\s/m.test(rawText) || rawText.includes("**");
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-md-gate" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-p">{children}</p>;
    },
    h2: ({ children }: any) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }: any) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
      return <h3 id={id}>{children}</h3>;
    },
    blockquote: ({ children }: any) => <blockquote className="zaidly-quote">{children}</blockquote>,
  },
  types: {
    table: RenderSanityTable,
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      return imageUrl ? <div className="zaidly-img-box"><img src={imageUrl} loading="lazy" /></div> : null;
    },
    productReviewCard: ({ value }: any) => {
      const stars = [1, 2, 3, 4, 5];
      return (
        <div className="zaidly-card">
          <h3 className="card-title">{value.productName}</h3>
          <div className="card-body">
            <div className="stat-box">
              <span className="label">EXPERT SCORE</span>
              <div className="stars-row">
                {stars.map((n) => <span key={n} style={{ color: n <= Math.floor(value.itemRating) ? "#ff9900" : "#ddd" }}>★</span>)}
                <span className="num">({value.itemRating})</span>
              </div>
            </div>
            <div className="v-line"></div>
            <div className="stat-box">
              <span className="label">PRICE POINT</span>
              <span className="price">{value.itemPrice}</span>
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
      const isAli = value.storeId === "aliexpress" || (value.label || "").toLowerCase().includes("ali");
      return (
        <div className="btn-stack inline">
          {isAli ? <div className="ali-logo"><span>Ali</span>Express</div> : <div className="amz-logo">amazon<div className="amz-arrow"></div></div>}
          <a href={value.url} target="_blank" rel="nofollow sponsored noopener" className={`z-btn ${isAli ? "ali-bg" : "amz-bg"}`}>{(value.label || "CHECK PRICE").toUpperCase()}</a>
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
    <div className={`zaidly-master-wrapper ${isClient ? "is-ready" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .zaidly-master-wrapper { width: 100%; color: #000; }
        .zaidly-link { color: #d97706 !important; font-weight: 800; text-decoration: underline; }
        .zaidly-quote { border-left: 5px solid #d97706; padding: 15px 25px; background: #fffcf0; margin: 2rem 0; border-radius: 0 10px 10px 0; font-style: italic; }

        /* TABEL 3-WARNA KLIMAKS */
        .zaidly-table-scroller { width: 100%; overflow-x: auto; margin: 2.5rem 0; border-radius: 12px; border: 1px solid #eee; -webkit-overflow-scrolling: touch; background: #fff; }
        .zaidly-table-scroller table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .zaidly-table-scroller th { background: #3C2F2F !important; color: #fff !important; padding: 14px 16px; text-align: left; text-transform: uppercase; font-size: 13px; }
        .zaidly-table-scroller td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #4a3728; font-weight: 600; }
        
        /* ZEBRA STRIPES */
        .even { background-color: #ffffff; }
        .odd { background-color: #f9f7f5; }

        /* BUTTONS & LOGO */
        .btn-stack { display: inline-flex; flex-direction: column; align-items: center; width: 155px; margin-right: 18px; margin-bottom: 25px; vertical-align: top; }
        .amz-logo { color: #000; font-weight: 900; font-size: 18px; position: relative; height: 35px; display: flex; align-items: center; }
        .amz-arrow { width: 100%; height: 5px; border-bottom: 2.5px solid #ff9900; border-radius: 0 0 50% 50%; margin-top: -6px; }
        .ali-logo { color: #e62e04; font-weight: 900; font-size: 14px; height: 35px; display: flex; align-items: center; }
        .ali-logo span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 3px; }
        .z-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-align: center; display: block; text-decoration: none; }
        .amz-bg { background: #ff9900; color: #000; }
        .ali-bg { background: #e62e04; color: #fff; }

        .zaidly-card { margin: 3rem 0; padding: 2.2rem; border: 1.5px solid #eee; border-radius: 16px; background: #fff; }
        .card-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 1.2rem; color: #4a3728; }
        .card-body { display: flex; align-items: center; gap: 2rem; border-top: 1px solid #f5f5f5; padding-top: 1.5rem; }
        .v-line { width: 1px; height: 50px; background: #eee; }
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
