import { z } from "astro/zod";

export const heroBlockFields = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  image: z.enum(["calder-1", "calder-2"]).optional(),
  text: z.string().optional(),
  buttons: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(["primary", "secondary", "outline", "ghost"]).default("primary"),
    })
  ).optional(),
  headingLevel: z.enum(["h1", "h2", "h3"]).default("h1"),
  textAlignment: z.enum(["left", "center", "right"]).default("left"),
  variant: z.enum(["flex", "1-3", "3-1"]).optional(),
  imagePosition: z.enum(["left", "right"]).default("left"),

});

export const stepsBlockFields = z.object({
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    
    }),
   
  ),
  title: z.string().optional(),
  description: z.string().optional(),
  buttons: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(["primary", "secondary", "outline", "ghost"]).default("primary"),
    })
  ).optional(),
  headingLevel: z.enum(["h1", "h2", "h3"]).default("h2"),
    
});

export type HeroBlockFields = z.infer<typeof heroBlockFields>;
export type StepsBlockFields = z.infer<typeof stepsBlockFields>;