import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Output static agar performa kencang di US [cite: 2026-01-10]
  output: 'static', 
  
  adapter: cloudflare({
    mode: 'directory',
    runtime: { mode: 'complete' } 
  }),

  // Tambahkan ini untuk memperbaiki warning Sharp di log abang tadi [cite: 2026-01-10]
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    react(),
  ],
});