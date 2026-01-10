import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Fungsi bantuan untuk membuat ID yang SAMA dengan logic di Astro [...slug].astro [cite: 2026-01-10]
const generateId = (children) => {
  const text = Array.isArray(children) 
    ? children.join("") 
    : typeof children === 'string' 
      ? children 
      : children?.props?.children || "";
      
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Hapus simbol
    .replace(/[\s_-]+/g, '-') // Ganti spasi jadi tanda hubung
    .trim();
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-coffee max-w-none prose-headings:font-black prose-img:rounded-2xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // HEADING DENGAN ID YANG SINKRON DENGAN DAFTAR ISI [cite: 2026-01-10]
          h1: ({node, children, ...props}) => (
            <h1 id={generateId(children)} className="text-3xl md:text-4xl font-black mt-10 mb-6 text-coffee-dark uppercase italic border-b-2 border-coffee-dark/10 pb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({node, children, ...props}) => (
            <h2 id={generateId(children)} className="text-2xl font-black mt-8 mb-4 text-coffee-dark uppercase tracking-tight" {...props}>
              {children}
            </h2>
          ),
          h3: ({node, children, ...props}) => (
            <h3 id={generateId(children)} className="text-xl font-bold mt-6 mb-3 text-coffee-dark" {...props}>
              {children}
            </h3>
          ),
          // WARNA TEKS DISESUAIKAN KE TEMA KOPI [cite: 2026-01-10]
          p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-coffee-brown text-lg" {...props} />,
          
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-coffee-brown" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-coffee-brown" {...props} />,
          
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-accent-primary pl-6 italic my-8 text-coffee-brown/80 bg-cream-latte/30 p-6 rounded-r-xl shadow-sm" {...props} />
          ),
          
          // GAMBAR DENGAN SHADOW AGAR LEBIH CAKEP [cite: 2026-01-10]
          img: ({node, ...props}) => (
            <img className="w-full h-auto rounded-2xl shadow-lg my-10 object-cover max-h-[600px] border border-slate-100" {...props} />
          ),
          
          a: ({node, ...props}) => <a className="text-accent-primary hover:underline font-bold decoration-accent-primary/30" {...props} />,
          
          // TABEL UNTUK SPEK BIJI KOPI [cite: 2026-01-10]
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-10 rounded-2xl border border-coffee-brown/10 shadow-sm">
              <table className="w-full text-left border-collapse bg-white" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-coffee-light/50" {...props} />,
          th: ({node, ...props}) => <th className="p-4 font-black text-xs uppercase tracking-widest text-coffee-dark border-b border-coffee-brown/10" {...props} />,
          td: ({node, ...props}) => <td className="p-4 text-sm text-coffee-brown border-b border-coffee-brown/5" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;