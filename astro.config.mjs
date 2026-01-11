import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Set ke server agar SSR dan API Sync jalan real-time
  output: 'server', 
  
  adapter: cloudflare({
    mode: 'directory',
    runtime: { mode: 'complete' } 
  }),

  // PENTING: Matikan Sharp untuk Cloudflare agar tidak Error 1101
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
