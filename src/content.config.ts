import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

const courses = defineCollection({
  loader: file("src/data/courses.yaml"),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { courses };
