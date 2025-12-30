import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zaidly.com',
  output: 'static', 
  adapter: cloudflare(),

  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    react(),
    // ✨ CUKUP PANGGIL markdoc() KOSONG
    // Astro otomatis akan membaca file markdoc.config.mjs tadi
    markdoc(), 
    keystatic(),
  ],
});