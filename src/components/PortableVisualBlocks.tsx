/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// Renderer untuk Link agar warna CERAH menyala (#d97706)
renderer.link = ({ href, title, text }: any) => {
  return `<a href="${href}" title="${title || ''}" class="zaidly-inline-link">${text}</a>`;
};

// Renderer untuk Heading agar TOC di [slug].astro bisa sinkron
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  return `<h${depth} id="${id}" class="zaidly-h${depth}" style="scroll-margin-top: 120px;">${text}</h${depth}>`;
};

const components = {
  block: {
    // Handling Heading Sanity resmi
    h2: ({ children, value }: any) => {
      const text = value.children.map((c: any) => c.text).join('');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      return <h2 id={id} className="zaidly-h2" style={{scrollMarginTop: '120px'}}>{children}</h2>;
    },
    h3: ({ children, value }: any) => {
      const text = value.children.map((c: any) => c.text).join('');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      return <h3 id={id} className="zaidly-h3" style={{scrollMarginTop: '120px'}}>{children}</h3>;
    },
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      
      // Proteksi tag legacy {% %}
      const isLegacyTag = rawText.includes('{%');
      const isMarkdown = !isLegacyTag && (rawText.includes('|') || /^#{1,6}\s/m.test(rawText));

      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
  },
  types: {
    // LOGIKA GAMBAR R2 YANG SUDAH BENAR (MENGGUNAKAN _KEY)
    image: ({ value }: any) => {
      const imageUrl = value.asset?.url || value.url || (value._key ? `https://r2.zaidly.com/blog/body-${value._key}.webp` : null);
      if (!imageUrl) return null;
      return (
        <div className="zaidly-body-image-container">
          <img src={imageUrl} alt={value.alt || 'Zaidly Review'} className="zaidly-main-img" loading="lazy" />
          {value.alt && <p className="zaidly-alt-caption">{value.alt}</p>}
        </div>
      );
    },
    // Affiliate Button (Desain Kit Bos)
    affiliateButton: ({ value }: any) => {
      const label = (value.label || '').toLowerCase();
      const isAli = value.storeId === 'aliexpress' || label.includes('ali');
      return (
        <div className="zaidly-btn-standalone-inline my-8">
            <a href={value.url} target="_blank" rel="nofollow" className={`zaidly-btn-kit ${isAli ? 'ali' : 'amz'}`}>
                {(value.label || 'CHECK PRICE').toUpperCase()}
            </a>
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
        /* Link Warna Cerah Menyala */
        .zaidly-inline-link, .zaidly-markdown-area a { 
          color: #d97706 !important; 
          text-decoration: underline; 
          font-weight: 800; 
        }
        .zaidly-inline-link:hover { color: #92400e !important; }

        .zaidly-btn-kit { padding: 12px 24px; border-radius: 8px; font-weight: 900; text-decoration: none; display: inline-block; transition: 0.3s; }
        .amz { background: #ff9900; color: #000; }
        .ali { background: #e62e04; color: #fff; }

        .zaidly-body-image-container { width: 100%; margin: 2rem 0; }
        .zaidly-main-img { width: 100%; height: auto; border-radius: 12px; border-bottom: 4px solid #4a3728; }
        .zaidly-alt-caption { font-size: 13px; color: #6b7280; font-style: italic; margin-top: 8px; }

        .zaidly-markdown-area table { width: 100%; border-collapse: collapse; margin: 2rem 0; border: 1px solid #eee; }
        .zaidly-markdown-area th { background: #3C2F2F; color: #fff; padding: 12px; text-align: left; }
        .zaidly-markdown-area td { padding: 12px; border-bottom: 1px solid #eee; }
        
        .zaidly-normal-p { margin-bottom: 1.5rem; line-height: 1.8; }
      ` }} />
      <PortableText value={value} components={components} />
    </div>
  );
}
