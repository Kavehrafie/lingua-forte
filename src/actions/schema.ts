import * as z from "astro/zod";
import { parseDateTimeLocalInTz } from "@/lib/time";

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
  id: z.string(),
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
  pageId: z.string(),
  type: z.enum(blockTypes),
});

export const updateBlockInput = z.object({
  id: z.string(),
  content: z.string().optional(),
  // See isPublished above — same checkbox pattern.
  isVisible: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const deleteBlockInput = z.object({
  id: z.string(),
});

export const deletePageInput = z.object({
  id: z.string(),
});

export const reorderBlocksInput = z.object({
  pageId: z.string(),
  blockIds: z.array(z.string()),
});

// ── Signup flow ──

export const signupStage1Input = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
});

export const signupStage2Input = z.object({
  courseId: z.string().min(1, "Please pick a course"),
});

export const signupStage3Input = z.object({
  slotId: z.string().min(1, "Please pick a date"),
});

export const signupCompleteInput = z.object({
  note: z.string().max(2000, "Note must be 2000 characters or fewer").optional(),
});

// ── Admin: interview slots ──

export const addInterviewSlotInput = z.object({
  // datetime-local input sends "YYYY-MM-DDTHH:mm" — admin enters wall-clock
  // time in Eastern (Montréal), and we convert to the matching UTC instant.
  startsAt: z
    .string()
    .min(1, "Pick a date and time")
    .transform((val, ctx) => {
      const parsed = parseDateTimeLocalInTz(val);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Pick a valid date and time",
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export const removeInterviewSlotInput = z.object({
  id: z.string(),
});

// ── Admin: cancel signup ──

export const cancelSignupInput = z.object({
  id: z.string(),
});

export type PageCreateInput = z.infer<typeof createPageInput>;
export type PageUpdateInput = z.infer<typeof updatePageInput>;
export type AddBlockInput = z.infer<typeof addBlockInput>;
export type UpdateBlockInput = z.infer<typeof updateBlockInput>;
export type DeleteBlockInput = z.infer<typeof deleteBlockInput>;
export type DeletePageInput = z.infer<typeof deletePageInput>;
export type ReorderBlocksInput = z.infer<typeof reorderBlocksInput>;
export type SignupStage1Input = z.infer<typeof signupStage1Input>;
export type SignupStage2Input = z.infer<typeof signupStage2Input>;
export type SignupStage3Input = z.infer<typeof signupStage3Input>;
export type SignupCompleteInput = z.infer<typeof signupCompleteInput>;
export type AddInterviewSlotInput = z.infer<typeof addInterviewSlotInput>;
export type RemoveInterviewSlotInput = z.infer<typeof removeInterviewSlotInput>;
export type CancelSignupInput = z.infer<typeof cancelSignupInput>;
