/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

// --- FIX TABEL: Handle baik Markdown murni maupun Object Sanity ---
const RenderTable = ({ rows }: { rows: any[] }) => {
  if (!rows || !Array.isArray(rows)) return null;
  return (
    <div className="zaidly-table-wrapper">
      <table className="zaidly-main-table">
        <thead>
          <tr>
            {rows[0]?.cells?.map((cell: string, i: number) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row: any, i: number) => (
            <tr key={i}>
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

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      
      // FIX TOMBOL LAMA: Jangan blokir render kalau ada {%
      if (rawText.includes('{%')) {
        return <p className="zaidly-normal-p">{children}</p>;
      }

      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || rawText.includes('**');
      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
  },
  types: {
    // FIX GAMBAR: Gunakan pola asset ID Sanity yang benar
    image: ({ value }: any) => {
      const ref = value.asset?._ref || '';
      const cleanId = ref.replace('image-', '').replace(/-([^-]+)$/, '.$1');
      const imageUrl = `https://r2.zaidly.com/blog/${cleanId}`;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || ''} loading="lazy" onError={(e) => {
            (e.target as HTMLImageElement).src = `https://cdn.sanity.io/images/6ocswb4i/production/${cleanId}`;
          }} />
        </div>
      );
    },
    // FIX TABLE OBJECT: Supaya tidak muncul [object Object]
    table: ({ value }: any) => {
      return <RenderTable rows={value.rows} />;
    },
    // LOGO ASLI AMAZON (DENGAN PANAH) & ALI
    affiliateButton: ({ value }: any) => {
      const label = value.label || 'CHECK PRICE';
      const isAli = (value.storeId === 'aliexpress' || label.toLowerCase().includes('ali'));
      return (
        <div className="zaidly-btn-container">
          <div className="zaidly-logo-box">
            {isAli ? (
              <div className="ali-logo-brand"><span>Ali</span>Express</div>
            ) : (
              <div className="amz-logo-brand">amazon<div className="amz-arrow"></div></div>
            )}
          </div>
          <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn ${isAli ? 'ali' : 'amz'}`}>
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
        .zaidly-inline-link { color: #d97706 !important; font-weight: 800; text-decoration: underline; }
        .zaidly-btn-container { display: inline-flex !important; flex-direction: column; align-items: center; width: 155px; margin-right: 20px; margin-bottom: 30px; vertical-align: top; }
        .zaidly-logo-box { height: 35px; display: flex; align-items: center; margin-bottom: 8px; }
        .amz-logo-brand { color: #000; font-weight: 900; font-size: 18px; position: relative; }
        .amz-arrow { width: 100%; height: 5px; border-bottom: 2.5px solid #ff9900; border-radius: 0 0 50% 50%; margin-top: -6px; }
        .ali-logo-brand { color: #e62e04; font-weight: 900; font-size: 14px; }
        .ali-logo-brand span { background: #e62e04; color: #fff; padding: 2px 5px; border-radius: 4px; margin-right: 3px; }
        .zaidly-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-align: center; display: block; text-decoration: none; }
        .amz { background: #ff9900; color: #000; }
        .ali { background: #e62e04; color: #fff; }
        /* TABLE CSS */
        .zaidly-table-wrapper { width: 100%; overflow-x: auto; margin: 2rem 0; border-radius: 12px; border: 1px solid #eee; }
        .zaidly-main-table { width: 100%; border-collapse: collapse; }
        .zaidly-main-table th { background: #3C2F2F; color: #fff; padding: 12px; text-align: left; }
        .zaidly-main-table td { padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; }
        .zaidly-img-box img { width: 100%; border-radius: 12px; border-bottom: 4px solid #4a3728; margin: 2rem 0; }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
