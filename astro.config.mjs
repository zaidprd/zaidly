import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Set ke static agar Cloudflare tidak menjalankan script berat saat web dibuka
  output: 'static', 

  adapter: cloudflare({
    // Mode directory paling stabil untuk SSG
    mode: 'directory',
  }),

  image: {
    service: {
      // WAJIB: Noop agar Cloudflare tidak mencoba menjalankan Sharp yang bikin Error 1101
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
