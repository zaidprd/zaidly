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

const components = (headings: any[]) => ({
  block: {
    normal: ({ node }: any) => {
      const rawText = node.children.map((c: any) => c.text).join('');
      const html = marked.parse(rawText, { renderer }) as string;
      return <div className="zaidly-p-container text-left" dangerouslySetInnerHTML={{ __html: html }} />;
    }
  },
  types: {
    image: ({ value }: any) => {
      const ref = value.asset?._ref || '';
      const cleanId = ref.replace('image-', '').replace(/-([^-]+)$/, ".$1");
      const r2Url = value.url || `https://r2.zaidly.com/blog/${cleanId}`;
      const sanityUrl = `https://cdn.sanity.io/images/6ocswb4i/production/${cleanId}`;
      return (
        <div style={{ margin: '2.5rem 0' }}>
          <img 
            src={r2Url} 
            alt={value.alt || ""} 
            style={{ width: '100%', borderRadius: '0.75rem', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = sanityUrl; }}
          />
        </div>
      );
    },
    // --- LOGIKA TOMBOL FRONTEND (SAMA DENGAN PREVIEW SANITY) ---
    affiliateButton: ({ value }: any) => {
      const store = value.storeId || 'amazon';
      const isAli = store === 'aliexpress';

      return (
        <div style={{ 
          display: 'inline-flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: 'calc(50% - 15px)', // Biar bagi dua kiri kanan
          marginRight: '20px', 
          marginBottom: '25px',
          verticalAlign: 'top'
        }}>
          {/* LOGO AREA */}
          <div style={{ height: '35px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            {isAli ? (
              /* AliExpress Logo Style */
              <div style={{ display: 'flex', alignItems: 'center', fontWeight: '900', fontFamily: 'sans-serif' }}>
                 <span style={{ backgroundColor: '#E62E04', color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '14px' }}>Ali</span>
                 <span style={{ color: '#E62E04', fontSize: '16px' }}>Express</span>
              </div>
            ) : (
              /* Amazon Logo Style */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <span style={{ color: 'black', fontWeight: '900', fontSize: '18px', fontFamily: 'sans-serif' }}>amazon</span>
                 <div style={{ width: '45px', height: '4px', borderBottom: '2.5px solid #FF9900', borderRadius: '50%', marginTop: '-6px' }}></div>
              </div>
            )}
          </div>

          {/* BUTTON AREA */}
          <a
            href={value.url}
            target="_blank"
            rel="nofollow"
            style={{
              backgroundColor: isAli ? '#E62E04' : '#FF9900',
              color: isAli ? '#ffffff' : '#000000',
              width: '100%',
              padding: '14px 5px',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: '900',
              fontSize: '11px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            {value.label?.toUpperCase() || 'CHECK PRICE'}
          </a>
        </div>
      );
    }
  }
});

export default function PortableVisualBlocks({ value, headings }: { value: any, headings: any[] }) {
  if (!value) return null;
  return (
    <div className="portable-text-wrapper text-left">
      <PortableText value={value} components={components(headings)} />
    </div>
  );
}