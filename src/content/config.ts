import { defineCollection, z } from 'astro:content';

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  // *** author: z.string() TETAP WAJIB ***
  author: z.string(), // Mempertahankan 'author' sebagai wajib
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

// KOLEKSI 'guidesCollection' dan 'picksCollection' DIHAPUS DARI SINI

export const collections = {
  blog: blogCollection,
  // KOLEKSI 'guides' dan 'picks' DIHAPUS DARI SINI
};