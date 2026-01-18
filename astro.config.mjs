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
    // 1. INI KUNCI UTAMA: Wajib pakai nodeCompat: true (bukan node_compat) 
    // untuk versi adapter cloudflare terbaru agar fungsi Google jalan.
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
      // 2. Tambahkan modul node internal di sini agar Vite tidak bingung
      external: [
        'googleapis',
        'google-auth-library',
        'gaxios',
        'node-fetch',
        'node:events',
        'node:fs',
        'node:util',
        'node:stream',
        'node:path',
        'node:url'
      ],
    },
    // 3. Ini membantu Cloudflare saat proses bundling
    resolve: {
      alias: {
        'node:events': 'events',
        'node:fs': 'fs',
        'node:util': 'util',
        'node:stream': 'stream',
        'node:path': 'path',
      }
    }
  },
});