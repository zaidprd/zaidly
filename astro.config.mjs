// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare'; // Tambahkan ini lagi

export default defineConfig({
  site: 'https://zaidly.com',
  
  // Tetap SSG (Static) agar aman dan kencang
  output: 'static', 

  // Adapter tetap butuh Cloudflare untuk proses build yang benar
  adapter: cloudflare(),

  image: {
    service: {
      // Noop agar build tidak berat dan tidak butuh Sharp di Cloudflare
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
