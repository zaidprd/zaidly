import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Tetap 'server' agar Webhook Sanity -> Turso abang bisa diproses secara dinamis
  output: 'server', 

  adapter: cloudflare({
    // AKTIFKAN INI: Agar library Google (Node.js) bisa jalan di Cloudflare
    node_compat: true,
    platformProxy: {
      enabled: true,
    },
  }),

  image: {
    // Pakai noop karena abang pakai R2/Cloudflare untuk handle gambar eksternal
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  },

  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    sitemap(),
    mdx(),
    react(),
  ],

  // TAMBAHKAN INI: Agar Vite tidak bingung saat memproses library googleapis
  vite: {
    ssr: {
      external: ['node:events', 'node:fs', 'node:util', 'node:stream', 'node:path', 'node:url'],
    },
    optimizeDeps: {
      exclude: ['googleapis']
    }
  },
});