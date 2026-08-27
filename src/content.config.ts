import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const journal = defineCollection({
  loader: glob({ base: "./src/content/journal", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      hero: image(),
      heroAlt: z.string(),
      tags: z.array(z.string()).default([]),
      author: z.enum(["Mariah Dolenc", "Luka Dolenc"]),
      archive: z.boolean().default(false),
    }),
});

export const collections = { journal };
