// astro.config.mjs

import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap'; // <-- Import Sitemap
import mdx from '@astrojs/mdx';
// https://astro.build/config
export default defineConfig({
  // WAJIB: Tentukan domain utama situs Anda untuk Sitemap
  site: 'https://www.zaidly.com', 
  
  integrations: [
    tailwind(),
    sitemap(), // <-- Tambahkan Sitemap
    mdx(),
  ],
});