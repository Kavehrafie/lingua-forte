import * as z from "astro/zod";

export const createPageInput = z.object({
  title: z.string().min(4, "Title is required"),
  path: z
    .string()
    .min(1, "Path is required")
    .transform((val) => {
      const trimmed = val.trim();
      if (trimmed === "/") return "/";

      return trimmed
        .replace(/^\/+|\/+$/g, "") // strip leading/trailing slashes
        .toLowerCase()
        .split("/")
        .map((seg) =>
          seg
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        )
        .filter(Boolean)
        .join("/");
    })
    .refine((val) => val.length >= 1, "Path must not be empty"),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
});

export const updatePageInput = z.object({
  title: z.string().min(4, "Title is required"),
  path: z
    .string()
    .min(1, "Path is required")
    .transform((val) => {
      const trimmed = val.trim();
      if (trimmed === "/") return "/";

      return trimmed
        .replace(/^\/+|\/+$/g, "") // strip leading/trailing slashes
        .toLowerCase()
        .split("/")
        .map((seg) =>
          seg
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        )
        .filter(Boolean)
        .join("/");
    })
    .refine((val) => val.length >= 1, "Path must not be empty"),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  // showInNavigation: z.coerce.boolean().optional(),
});

//    type: z.enum(["hero", "steps", "signup-form", "faq", "markdown"]),

export type PageCreateInput = z.infer<typeof createPageInput>;
export type PageUpdateInput = z.infer<typeof updatePageInput>;
