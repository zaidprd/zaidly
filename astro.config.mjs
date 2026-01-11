import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // GANTI INI JADI 'server' ATAU 'hybrid'
  // Kalau 'static', API sync abang GAK BAKAL JALAN
  output: 'server', 

  adapter: cloudflare({
    // Biarkan default (smart mode) biar variabel runtime kebaca
    platformProxy: {
      enabled: true,
    },
  }),

  image: {
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  },

  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    react(),
  ],
});