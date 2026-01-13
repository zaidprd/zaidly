/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';

const renderer = new marked.Renderer();

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  if (depth === 1) return ''; 
  return `<h${depth} id="${id}" class="zaidly-h${depth}">${text}</h${depth}>`;
};

// --- KOMPONEN DAFTAR ISI INLINE (Gaya Rumahweb) ---
const InlineToC = ({ headings }: { headings: any[] }) => {
  const filtered = headings?.filter(h => h.depth > 1 && h.depth < 4) || [];
  if (filtered.length === 0) return null;

  return (
    <nav style={{ 
      backgroundColor: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      padding: '20px', 
      margin: '30px 0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
    }}>
      <div style={{ 
        fontWeight: 900, 
        fontSize: '13px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.1em', 
        marginBottom: '15px', 
        color: '#3C2F2F',
        borderBottom: '1px solid rgba(60, 47, 47, 0.1)',
        paddingBottom: '10px'
      }}>
        Daftar Isi
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filtered.map((h, i) => (
          <li key={i} style={{ 
            marginBottom: '8px', 
            paddingLeft: h.depth === 3 ? '20px' : '0' 
          }}>
            <a href={`#${h.slug}`} style={{ 
              textDecoration: 'none', 
              color: '#6F4E37', 
              fontSize: '14px', 
              fontWeight: h.depth === 2 ? '700' : '500',
              display: 'inline-block'
            }}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const components = (headings: any[]) => ({
  block: {
    normal: ({ node, index }: any) => {
      const rawText = node.children.map((c: any) => c.text).join('');
      const html = marked.parse(rawText, { renderer }) as string;
      return (
        <>
          <div className="zaidly-p-container" dangerouslySetInnerHTML={{ __html: html }} />
          {/* SEO: Masuk setelah paragraf pertama (index 0) */}
          {index === 0 && <InlineToC headings={headings} />}
        </>
      );
    }
  },
  types: {
    image: ({ value }: any) => {
      const r2Url = value.url || value.asset?.url || value.asset?.r2Url;
      const renderPureImage = (src: string) => (
        <div style={{ border: 'none', boxShadow: 'none', marginBottom: '2.5rem', marginTop: '2.5rem' }}>
          <img 
            src={src} 
            alt={value.alt || "Zaidly Coffee"} 
            loading="lazy" 
            style={{ 
              display: 'block',
              width: '100%', 
              border: 'none', 
              outline: 'none', 
              boxShadow: 'none',
              borderRadius: '0.75rem'
            }} 
          />
          {value.alt && (
            <p style={{ textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', marginTop: '0.75rem', opacity: 0.5, fontWeight: 'bold', letterSpacing: '0.1em' }}>
              {value.alt}
            </p>
          )}
        </div>
      );

      if (!r2Url) {
        const ref = value.asset?._ref;
        if (!ref) return null;
        const cleanId = ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
        const fallbackUrl = `https://r2.zaidly.com/blog/${cleanId}`;
        return renderPureImage(fallbackUrl);
      }
      return renderPureImage(r2Url);
    },
    affiliateButton: ({ value }: any) => {
      const label = value.label?.toLowerCase() || '';
      const isAli = label.includes('ali') || label.includes('aliexpress');
      return (
        <div className="zaidly-btn-group">
          <a href={value.url} target="_blank" className={isAli ? "btn-ali" : "btn-amazon"}>
             {isAli ? '🚀' : '🛒'} {value.label?.toUpperCase() || 'CHECK PRICE'}
          </a>
        </div>
      );
    }
  }
});

// Tambahkan prop 'headings' di sini
export default function PortableVisualBlocks({ value, headings }: { value: any, headings: any[] }) {
  if (!value) return null;
  return (
    <div className="portable-text-wrapper" style={{ border: 'none' }}>
      <PortableText value={value} components={components(headings)} />
    </div>
  );
}