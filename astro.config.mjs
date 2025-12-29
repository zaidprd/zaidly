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
  
  // WAJIB: Aktifkan mode server untuk Keystatic Cloud
  output: 'server',
  adapter: cloudflare(),

  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    react(),
    // Konfigurasi Markdoc agar mengenali komponen tombol dari dashboard
    markdoc({
      tags: {
        AffiliateButton: {
          // FIX: render harus merujuk ke nama file AffiliateLink.astro lu
          render: 'AffiliateLink', 
          attributes: {
            // Mendaftarkan url dan label agar build Cloudflare sukses
            url: { type: String, required: true },
            label: { type: String },
          },
        },
      },
    }),
    keystatic(),
  ],
});