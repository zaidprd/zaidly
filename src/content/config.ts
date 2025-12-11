import { defineCollection, z } from 'astro:content';

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  // *** TAMBAH BARIS INI UNTUK AUTHOR ***
  author: z.string(), 
  // **********************************
  pubDate: z.date().optional(),
  category: z.enum(['beans', 'gear', 'culture', 'methods']).optional(),
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
  blog: blogCollection,
  guides: guidesCollection,
  picks: picksCollection,
};