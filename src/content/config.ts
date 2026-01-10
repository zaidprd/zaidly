import { defineCollection, z } from 'astro:content';

// Skema artikel untuk 6 file lama di folder src/content/blog [cite: 2026-01-10]
const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    pubDate: z.coerce.date(),
    // Tetap pertahankan draft untuk kontrol postingan lokal [cite: 2026-01-10]
    draft: z.boolean().default(false),
    category: z.enum([
      'gear-lab',      
      'bean-roastery', 
      'brew-mastery',  
      'barista-life',  
      'buying-guides'  
    ]),
    // Astro akan tetap mengoptimasi gambar lokal kamu [cite: 2026-01-10]
    image: image().optional(), 
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};