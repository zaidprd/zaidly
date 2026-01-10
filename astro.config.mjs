import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Ganti ke hybrid agar API Sync bisa jalan [cite: 2026-01-11]
  output: 'static', 
  
  adapter: cloudflare({
    mode: 'directory',
    runtime: { mode: 'complete' } 
  }),

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