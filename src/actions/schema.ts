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
  id: z.string().uuid(),
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
  // HTML checkboxes only send the field when checked, so coerce "true" → true
  // and missing → false. Optional would silently skip unchecks.
  isPublished: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  // showInNavigation: z.coerce.boolean().optional(),
});

export const blockTypes = [
  "hero",
  "steps",
  "signup-form",
  "faq",
  "markdown",
] as const;

export const addBlockInput = z.object({
  pageId: z.string().uuid(),
  type: z.enum(blockTypes),
});

export const updateBlockInput = z.object({
  id: z.string().uuid(),
  content: z.string().optional(),
  // See isPublished above — same checkbox pattern.
  isVisible: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const deleteBlockInput = z.object({
  id: z.string().uuid(),
});

export const reorderBlocksInput = z.object({
  pageId: z.string().uuid(),
  blockIds: z.array(z.string().uuid()),
});

export type PageCreateInput = z.infer<typeof createPageInput>;
export type PageUpdateInput = z.infer<typeof updatePageInput>;
export type AddBlockInput = z.infer<typeof addBlockInput>;
export type UpdateBlockInput = z.infer<typeof updateBlockInput>;
export type DeleteBlockInput = z.infer<typeof deleteBlockInput>;
export type ReorderBlocksInput = z.infer<typeof reorderBlocksInput>;
