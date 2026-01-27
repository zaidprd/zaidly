/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// 1. LINK ORANYE ZAIDLY
renderer.link = ({ href, text }: any) => {
  return `<a href="${href}" rel="nofollow sponsored noopener" target="_blank" class="zaidly-link">${text}</a>`;
};

// 2. TABEL MARKDOWN (DIPAKSA 3-WARNA)
renderer.table = ({ header, body }: any) => {
  return `
    <div class="zaidly-table-scroller">
      <table class="zaidly-3tone-table">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
};

// 3. HEADING MARKDOWN (SUPAYA TOC JALAN)
renderer.heading = ({ text, depth }: any) => {
  const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      // Ambil teks mentah dari children Sanity
      const rawText = node.children?.map((c: any) => c.text).join('') || '';

      if (!rawText) return null;

      // Proteksi Shortcode Artikel Lama
      if (rawText.includes('{%')) return <>{children}</>;

      // DETEKSI APAKAH INI MARKDOWN (Tabel atau Heading manual)
      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || rawText.includes('**');

      if (isMarkdown) {
        // Render Markdown ke HTML
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-gate" dangerouslySetInnerHTML={{ __html: html }} />;
      }

      return <p className="zaidly-p">{children}</p>;
    },
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
    image: ({ value }: any) => {
      const url = value.asset?.url || value.url;
      return url ? <div className="zaidly-img-box"><img src={url} alt={value.alt || ''} loading="lazy" /></div> : null;
    }
  }
};

export default function PortableVisualBlocks({ value }: { value: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!value) return null;

  return (
    <div className={`zaidly-master-wrapper ${isClient ? 'is-ready' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .zaidly-master-wrapper { width: 100%; color: #000; line-height: 1.8; }
        .zaidly-link { color: #d97706 !important; font-weight: 800; text-decoration: underline; }
        
        /* DESAIN TABEL 3-WARNA (HEADER COKELAT, ZEBRA KREM) */
        .zaidly-table-scroller { width: 100%; overflow-x: auto; margin: 2.5rem 0; border-radius: 12px; border: 1px solid #eee; background: #fff; }
        .zaidly-table-scroller table { width: 100%; border-collapse: collapse; min-width: 600px; }
        
        .zaidly-table-scroller th { background: #3C2F2F !important; color: #fff !important; padding: 14px 16px; text-align: left; text-transform: uppercase; font-size: 13px; border: none; }
        .zaidly-table-scroller td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #4a3728; font-weight: 600; }
        
        /* LOGIKA ZEBRA */
        .zaidly-table-scroller tr:nth-child(even) { background-color: #ffffff; }
        .zaidly-table-scroller tr:nth-child(odd) { background-color: #f9f7f5; }

        .zaidly-quote { border-left: 5px solid #d97706; padding: 15px 25px; background: #fffcf0; margin: 2rem 0; border-radius: 0 10px 10px 0; font-style: italic; }
        h2, h3 { scroll-margin-top: 120px; font-weight: 900; color: #000; margin-top: 2.5rem; }
        .zaidly-img-box img { width: 100%; border-radius: 12px; border-bottom: 4px solid #4a3728; margin: 2rem 0; }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
