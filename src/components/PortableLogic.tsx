/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';

export default function PortableLogic({ value }: { value: any }) {
  const components = {
    block: {
      h1: ({ children }: any) => <h1 className="zaidly-h1">{children}</h1>,
      // TAMBAHKAN ID DISINI UNTUK TOC
      h2: ({ children }: any) => {
        const id = children.toString().toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return <h2 id={id} className="zaidly-h2">{children}</h2>;
      },
      h3: ({ children }: any) => {
        const id = children.toString().toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return <h3 id={id} className="zaidly-h3">{children}</h3>;
      },
      normal: ({ children, value: node }: any) => {
        const text = node.children.map((c: any) => c.text).join('');
        if (text.includes('|')) {
          const html = marked.parse(text) as string;
          return (
            <div className="zaidly-table-wrapper">
              <div className="zaidly-table-content" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          );
        }
        return <p className="zaidly-p">{children}</p>;
      },
    },
    types: {
      image: ({ value }: any) => {
        const id = value.asset?._ref;
        if (!id) return null;
        // Logic Gambar Sanity CDC
        const imageUrl = `https://cdn.sanity.io/images/6ocswb4i/production/${id.replace('image-', '').replace(/-([^-]+)$/, ".$1")}`;
        return (
          <div className="zaidly-body-img">
            <img src={imageUrl} alt={value.alt || "Zaidly Coffee"} />
          </div>
        );
      },
      affiliateButton: ({ value }: any) => {
        if (!value.url) return null;
        const isAli = value.label?.toLowerCase().includes('aliexpress');
        return (
          <div className="zaidly-btn-group">
            <a href={value.url} target="_blank" className={isAli ? "btn-ali" : "btn-amazon"}>
              {isAli ? 'ðŸš€' : 'ðŸ›’'} {value.label?.toUpperCase() || 'CHECK PRICE'}
            </a>
          </div>
        );
      }
    }
  };
  return <PortableText value={value} components={components} />;
}