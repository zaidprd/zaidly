// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://zaidly.com',
  output: 'static',

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
