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
      // Ini memastikan config di tailwind.config.mjs (termasuk plugin typography) 
      // terbaca dengan sempurna oleh Astro
      applyBaseStyles: true,
    }),
    sitemap(),
    mdx(),
    react(),
  ],
});