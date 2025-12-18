import { defineCollection, z } from 'astro:content';

const articleSchema = ({ image }) => z.object({ // Tambahkan ({ image }) di sini
  title: z.string(),
  description: z.string(),
  author: z.string(), 
  
  pubDate: z.coerce.date(), 
  
  category: z.enum([
    'gear-lab',      
    'bean-roastery', 
    'brew-mastery',  
    'barista-life',  
    'buying-guides'  
  ]),
  
  // UBAH INI: Agar Astro bisa mengoptimasi gambar di assets
  image: image().optional(), 
  
  layout: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: articleSchema,
});

export const collections = {
  blog: blogCollection,
};