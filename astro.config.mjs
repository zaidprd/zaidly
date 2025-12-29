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
  
  // WAJIB: Balik ke static agar daftar blog tidak 404
  output: 'static', 
  adapter: cloudflare(),

  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    react(),
    // ✨ INI BAGIAN YANG HARUS LU PERHATIKAN
    markdoc({
      tags: {
        AffiliateButton: {
          render: 'AffiliateLink', 
          attributes: {
            // Mendaftarkan url dan label agar build sukses
            url: { type: String, required: true },
            label: { type: String },
          },
        },
      },
    }),
    keystatic(),
  ],
});