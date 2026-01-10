export const parseLexicalToMarkdown = (node: any): string => {
  if (!node) return '';

  // DEFINISI URL RENDER [cite: 2026-01-10]
  const PAYLOAD_URL = 'https://zaidlycms.onrender.com';

  if (node.type === 'text') {
    return node.text;
  }

  if (node.type === 'linebreak') return '\n';

  if (node.type === 'upload') {
    // FIX: Ganti localhost ke PAYLOAD_URL agar gambar R2 muncul di Cloudflare [cite: 2026-01-10]
    const url = node.value?.url
      ? `${PAYLOAD_URL}${node.value.url}`
      : '';
    const alt = node.value?.alt || 'image';
    return `\n\n![${alt}](${url})\n\n`;
  }

  if (!node.children) return '';

  const children = node.children
    .map((child: any) => parseLexicalToMarkdown(child))
    .join('');

  switch (node.type) {
    case 'root':
      return children.trim();

    case 'heading': {
      const level = Number(node.tag.replace('h', ''));
      return `\n${'#'.repeat(level)} ${children.trim()}\n`;
    }

    case 'paragraph': {
      const text = children.trim();
      if (!text) return '';
      if (text.startsWith('|')) return `${text}\n`; // khusus tabel
      return `\n${text}\n`;
    }

    case 'list':
      return `\n${children}`;

    case 'listitem':
      return `- ${children.trim()}\n`;

    default:
      return children;
  }
};