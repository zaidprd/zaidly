import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Fungsi bantuan untuk membuat ID/Slug dari teks judul [cite: 2026-01-10]
const generateId = (children) => {
  const text = Array.isArray(children) 
    ? children.join("") 
    : typeof children === 'string' 
      ? children 
      : children?.props?.children || "";
      
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .trim();
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-orange-600 prose-img:rounded-xl prose-pre:bg-slate-900 prose-pre:text-slate-50">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // TAMBAHKAN ID PADA SETIAP HEADING [cite: 2026-01-10]
          h1: ({node, children, ...props}) => (
            <h1 id={generateId(children)} className="text-3xl md:text-4xl font-bold mt-8 mb-4 text-slate-900 uppercase italic" {...props}>
              {children}
            </h1>
          ),
          h2: ({node, children, ...props}) => (
            <h2 id={generateId(children)} className="text-2xl font-bold mt-6 mb-3 text-slate-800" {...props}>
              {children}
            </h2>
          ),
          h3: ({node, children, ...props}) => (
            <h3 id={generateId(children)} className="text-xl font-semibold mt-4 mb-2 text-slate-800" {...props}>
              {children}
            </h3>
          ),
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-700 text-lg" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-700" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-orange-500 pl-4 italic my-6 text-slate-600 bg-slate-50 p-4 rounded-r" {...props} />,
          code: ({node, className, children, ...props}) => {
             const match = /language-(\w+)/.exec(className || '');
             const isInline = !match && !String(children).includes('\n');
             return isInline 
               ? <code className="bg-slate-200 text-pink-600 rounded px-1 py-0.5 font-mono text-sm" {...props}>{children}</code>
               : <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-6 font-mono text-sm"><code {...props}>{children}</code></div>
          },
          img: ({node, ...props}) => <img className="w-full h-auto rounded-xl shadow-md my-6 object-cover max-h-[500px]" {...props} />,
          a: ({node, ...props}) => <a className="text-orange-600 hover:underline font-medium" {...props} />,
          
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-slate-200 shadow-md">
              <table className="w-full text-left border-collapse bg-white" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
          th: ({node, ...props}) => <th className="p-4 font-bold text-sm text-slate-900 border-b border-slate-200 bg-slate-100" {...props} />,
          td: ({node, ...props}) => <td className="p-4 text-sm text-slate-600 border-b border-slate-100 align-top" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-slate-50 transition-colors" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;