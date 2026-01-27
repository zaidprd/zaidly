/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();

// FIX WARNA LINK: Pakai warna Amber/Emas yang cerah (#d97706)
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
      if (rawText.includes('{%')) return <>{children}</>;

      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || /^\s*[-*+]\s+/m.test(rawText);

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
    affiliateButton: ({ value }: any) => {
      const label = (value.label || '').toLowerCase();
      const isAli = value.storeId === 'aliexpress' || label.includes('ali');

      return (
        <div className="zaidly-btn-container">
          <div className="zaidly-logo-box">
            {isAli ? (
              <div className="ali-logo">
                <span>Ali</span>Express
              </div>
            ) : (
              <div className="amz-logo">
                amazon<div className="smile"></div>
              </div>
            )}
          </div>
          <a
            href={value.url}
            target="_blank"
            rel="nofollow"
            className={`zaidly-btn ${isAli ? 'ali' : 'amz'}`}
          >
            {(value.label || 'CHECK PRICE').toUpperCase()}
          </a>
        </div>
      );
    },
    image: ({ value }: any) => {
      const ref = value.asset?._ref || '';
      const cleanId = ref.replace('image-', '').replace(/-([^-]+)$/, '.$1');
      const imageUrl = value.url || `https://r2.zaidly.com/blog/${cleanId}`;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || ''} loading="lazy" />
        </div>
      );
    },
    video: ({ value }: any) => {
      const videoUrl = value.asset?.url || value.url;
      if (!videoUrl) return null;
      return (
        <div className="zaidly-img-box">
          <video controls style={{ width: '100%', borderRadius: '12px' }}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      );
    }
  },
};

export default function PortableVisualBlocks({ value }: { value: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!value) return null;

  return (
    <div className={`portable-text-wrapper ${isClient ? 'is-hydrated' : ''}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.portable-text-wrapper { display: block; width: 100%; }

/* WARNA LINK CERAH & MENYALA (Amber/Golden Brown) */
.zaidly-inline-link, .zaidly-markdown-area a { 
  color: #d97706 !important; 
  text-decoration: underline; 
  font-weight: 800; 
  transition: color 0.2s ease;
}

.zaidly-inline-link:hover, .zaidly-markdown-area a:hover { 
  color: #92400e !important; 
}

.zaidly-btn-container {
  display: inline-flex !important;
  flex-direction: column;
  align-items: center;
  width: 155px;
  margin-right: 18px;
  margin-bottom: 30px;
  vertical-align: top;
  text-align: center;
}

.zaidly-logo-box { height: 35px; display: flex; align-items: center; margin-bottom: 8px; font-weight: 900; }
.zaidly-btn { width: 100%; padding: 12px 5px; border-radius: 6px; font-weight: 900; font-size: 11px; text-decoration: none; text-align: center; display: block; }

.ali { background: #e62e04; color: white; }
.amz { background: #ff9900; color: black; }
.ali-logo span { background: #e62e04; color: white; padding: 2px 5px; border-radius: 4px; margin-right: 4px; }
.ali-logo { color: #e62e04; font-family: sans-serif; font-size: 14px; }
.amz-logo { color: #000; font-family: sans-serif; font-size: 17px; }
.smile { width: 35px; height: 3px; border-bottom: 2.5px solid #ff9900; border-radius: 50%; margin: -6px auto 0; }

.zaidly-normal-p, .zaidly-markdown-area p { width: 100%; margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.125rem; display: block; }
.zaidly-h2, .zaidly-h3 { width: 100%; display: block; scroll-margin-top: 120px; }

.zaidly-img-box img { width: 100%; height: auto; margin: 2rem 0; border-bottom: 4px solid #4a3728; }

.zaidly-markdown-area table { width: 100%; border-collapse: collapse; margin: 2rem 0; border: 1px solid #eee; }
.zaidly-markdown-area th { background: #3C2F2F; color: #fff; padding: 12px; text-align: left; }
.zaidly-markdown-area td { padding: 12px; border-bottom: 1px solid #eee; }

@media (max-width: 480px) {
  .zaidly-btn-container { width: 140px; margin-right: 10px; }
}
`,
        }}
      />
      <PortableText value={value} components={components} />
    </div>
  );
}
