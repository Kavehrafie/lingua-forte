import { z } from "astro/zod";

export const heroBlockFields = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  image: z.enum(["calder-1", "calder-2"]).optional(),
  text: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  headingLevel: z.enum(["h1", "h2", "h3"]).default("h1"),
  textAlignment: z.enum(["left", "center", "right"]).default("left"),
  layout: z.enum(["flex", "1-3", "3-1"]).optional(),
  imagePosition: z.enum(["left", "right"]).default("left"),
});
