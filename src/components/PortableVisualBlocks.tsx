/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';
import { useState, useEffect } from 'react';

const renderer = new marked.Renderer();
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return `<h${depth} id="${id}" class="zaidly-h${depth}">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node, children }: any) => {
      const rawText = node.children?.map((c: any) => c.text).join('') || '';
      const isMarkdown = rawText.includes('|') || /^#{1,6}\s/m.test(rawText) || /^\s*[-*+]\s+/m.test(rawText);

      if (isMarkdown) {
        const html = marked.parse(rawText, { renderer }) as string;
        return <section className="zaidly-markdown-area" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <p className="zaidly-normal-p">{children}</p>;
    },
    h2: ({ children }: any) => {
      const text = Array.isArray(children) ? children.join('') : children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h2 id={id} className="zaidly-h2">{children}</h2>;
    },
    h3: ({ children }: any) => {
      const text = Array.isArray(children) ? children.join('') : children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
      return <h3 id={id} className="zaidly-h3">{children}</h3>;
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
              <div className="ali-logo"><span>Ali</span>Express</div>
            ) : (
              <div className="amz-logo">amazon<div className="smile"></div></div>
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
      // Prioritas URL R2 dari script sync, jika tidak ada fallback ke format body-key
      const imageUrl = value.url || `https://r2.zaidly.com/blog/body-${value._key}.webp`;
      return (
        <div className="zaidly-img-box">
          <img src={imageUrl} alt={value.alt || 'Zaidly Coffee Review'} loading="lazy" />
        </div>
      );
    },
  },
};

export default function PortableVisualBlocks({ value }: { value: any }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!value) return null;

  return (
    <div className={`portable-text-wrapper ${isClient ? 'is-hydrated' : ''}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.portable-text-wrapper { display: block; width: 100%; }
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
.zaidly-btn {
  width: 100%;
  padding: 12px 5px;
  border-radius: 6px;
  font-weight: 900;
  font-size: 11px;
  text-decoration: none;
  text-align: center;
  display: block;
}
.ali { background: #e62e04; color: white; }
.amz { background: #ff9900; color: black; }
.ali-logo span { background: #e62e04; color: white; padding: 2px 5px; border-radius: 4px; margin-right: 4px; }
.ali-logo { color: #e62e04; font-family: sans-serif; font-size: 14px; }
.amz-logo { color: #000; font-family: sans-serif; font-size: 17px; }
.smile { width: 35px; height: 3px; border-bottom: 2.5px solid #ff9900; border-radius: 50%; margin: -6px auto 0; }
.zaidly-normal-p, .zaidly-markdown-area p {
  width: 100%;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  font-size: 1.125rem;
  display: block;
}
.zaidly-h2, .zaidly-h3 { width: 100%; display: block; margin: 2rem 0 1rem; }
.zaidly-img-box img {
  width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: 8px;
}
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
