// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Tetap SSR sesuai request abang
  output: 'server', 
  
  adapter: cloudflare({
    mode: 'directory',
    runtime: { mode: 'complete' } 
  }),

  // FIX UTAMA: Matikan image service bawaan agar tidak crash 1101
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
