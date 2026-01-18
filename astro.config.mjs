import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  output: 'server',

  adapter: cloudflare({
    // Tetap gunakan nodeCompat agar library Turso & S3 berjalan lancar
    nodeCompat: true, 
    platformProxy: {
      enabled: true,
    },
  }),

  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },

  integrations: [
    tailwind({ applyBaseStyles: true }),
    sitemap(),
    mdx(),
    react(),
  ],

  vite: {
    ssr: {
      // Bersihkan daftar external, sisakan yang memang perlu saja
      external: [
        'node:events',
        'node:fs',
        'node:util',
        'node:stream',
        'node:path',
        'node:url'
      ],
    },
  },
});
