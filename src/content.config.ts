import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  // Use the glob loader to find files in src/content/lessons/
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/lessons" }),
  schema: z.object({
    chapterNumber: z.number(),
    title: z.string(),
    description: z.string(),
    isDraft: z.boolean().default(false),
    prerequisite: z.number().optional(),
    pages: z.array(z.object({
      title: z.string(),
      sections: z.array(z.object({
        id: z.string(),
        title: z.string()
      })).optional()
    })).optional()
  })
});

export const collections = {
  'lessons': lessons,
};
