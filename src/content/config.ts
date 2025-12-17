import { defineCollection, z } from 'astro:content';

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  // author TETAP WAJIB untuk kredibilitas E-E-A-T (Sangat penting untuk market US)
  author: z.string(), 
  
  // Transformasi tanggal agar otomatis terdeteksi sebagai objek Date
  pubDate: z.coerce.date(), 
  
  // Kategori Baru yang lebih "Authority" & Menarik
  category: z.enum([
    'gear-lab',      // Untuk review alat teknis
    'bean-roastery',  // Untuk review biji kopi
    'brew-mastery',   // Untuk panduan teknik seduh
    'barista-life',   // Untuk budaya & lifestyle
    'buying-guides'   // Untuk artikel "Best of..." / Rekomendasi belanja
  ]),
  
  image: z.string().optional(),
  layout: z.string().optional(),
  tags: z.array(z.string()).optional(), // Tambahan agar bisa pakai tags (opsional)
});

const blogCollection = defineCollection({
  type: 'content',
  schema: articleSchema,
});

// Mengekspor koleksi blog yang sudah bersih
export const collections = {
  blog: blogCollection,
};