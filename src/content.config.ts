import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/collections/insights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    ogImageSrc: z.string(),
    isDraft: z.boolean(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/collections/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    ogImageSrc: z.string(),
    isDraft: z.boolean(),
    videoUrl: z.string().optional(),
  }),
});

export const collections = {
  insights,
  guides,
};
