/** @jsxImportSource react */
import { PortableText } from '@portabletext/react';
import { marked } from 'marked';

// Renderer Baru untuk Marked v17+
const renderer = new marked.Renderer();

// FIX: Di versi baru, parameternya adalah object { text, depth }
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  // Membersihkan tag HTML dari teks heading untuk ID
  const cleanText = text.replace(/<[^>]*>/g, '');
  const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  
  if (depth === 1) return ''; // Judul utama biasanya di luar portable text
  return `<h${depth} id="${id}" class="zaidly-h${depth}">${text}</h${depth}>`;
};

const components = {
  block: {
    normal: ({ node }: any) => {
      const rawText = node.children.map((c: any) => c.text).join('');
      // Render Markdown (Bold, Italics, Table, dll)
      const html = marked.parse(rawText, { renderer }) as string;
      return <div className="zaidly-p-container" dangerouslySetInnerHTML={{ __html: html }} />;
    }
  },
  types: {
    image: ({ value }: any) => {
      // Prioritas 1: Ambil URL R2 hasil ingest (Field 'url' di root object)
      // Prioritas 2: Cek di value.asset.url (beberapa versi ingest naro di sini)
      const r2Url = value.url || value.asset?.url || value.asset?.r2Url;

      if (!r2Url) {
        // Fallback terakhir: Jika belum di-sync, tebak URL R2 dari ref
        const ref = value.asset?._ref;
        if (!ref) return null;
        const cleanId = ref.replace(/^image-/, "").replace(/-([^-]+)$/, ".$1");
        const fallbackUrl = `https://r2.zaidly.com/blog/${cleanId}`;
        
        return (
          <div className="zaidly-body-img">
            <img src={fallbackUrl} alt={value.alt || "Zaidly Coffee"} loading="lazy" />
          </div>
        );
      }

      return (
        <div className="zaidly-body-img">
          <img 
            src={r2Url} 
            alt={value.alt || "Zaidly Coffee"} 
            loading="lazy" 
          />
          {value.alt && (
            <p className="text-center text-[10px] uppercase mt-2 opacity-50 font-bold tracking-widest">
              {value.alt}
            </p>
          )}
        </div>
      );
    },
    affiliateButton: ({ value }: any) => {
      const label = value.label?.toLowerCase() || '';
      const isAli = label.includes('ali') || label.includes('aliexpress');
      return (
        <div className="zaidly-btn-group">
          <a 
            href={value.url} 
            target="_blank" 
            className={isAli ? "btn-ali" : "btn-amazon"}
          >
             {isAli ? '🚀' : '🛒'} {value.label?.toUpperCase() || 'CHECK PRICE'}
          </a>
        </div>
      );
    }
  }
};

export default function PortableVisualBlocks({ value }: { value: any }) {
  if (!value) return null;
  return (
    <div className="portable-text-wrapper">
      <PortableText value={value} components={components} />
    </div>
  );
}