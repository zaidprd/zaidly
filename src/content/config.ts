// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Gunakan 'any' pada parameter image untuk menghilangkan error TS 7031
const articleSchema = ({ image }: { image: any }) => z.object({ 
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
  // Astro akan mengoptimasi gambar melalui fungsi image() ini
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