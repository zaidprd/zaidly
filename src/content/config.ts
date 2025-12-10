// src/content/config.ts

import { defineCollection, z } from 'astro:content'; 

// Skema Konten Dasar yang Ditingkatkan
const articleSchema = z.object({
  title: z.string(),
  pubDate: z.date(),
  description: z.string(),
  // >>> TAMBAHKAN PROPERTI CATEGORY DI SINI <<<
  category: z.enum(['beans', 'gear', 'culture', 'methods']), // Wajib ada untuk filter di index.astro
  // Opsi tambahan yang mungkin Anda perlukan
  image: z.string().optional(), 
  layout: z.string().optional(), 
});

const blogCollection = defineCollection({
  type: 'content',
  schema: articleSchema,
});

const guidesCollection = defineCollection({
  type: 'content',
  schema: articleSchema,
});

const picksCollection = defineCollection({
  type: 'content',
  schema: articleSchema,
});

export const collections = {
  'blog': blogCollection,
  'guides': guidesCollection,
  'picks': picksCollection,
};