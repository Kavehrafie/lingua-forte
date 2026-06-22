import { defineAction, ActionError } from "astro:actions";
import { createAuth } from "@/lib/server/auth";
import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import {
  createPageInput,
  updatePageInput,
  addBlockInput,
  updateBlockInput,
  deleteBlockInput,
  deletePageInput,
  reorderBlocksInput,
  signupStage1Input,
  signupStage2Input,
  signupStage3Input,
  signupCompleteInput,
  addInterviewSlotInput,
  removeInterviewSlotInput,
  cancelSignupInput,
} from "./schema";
import { getDb } from "@/lib/server/db";
import { page, pageBlock } from "@/lib/server/db/schema";
import { getBlockById, nextBlockPosition } from "@/lib/server/page";
import { heroBlockFields, stepsBlockFields } from "@/lib/block-fields";
import { findCourseById } from "@/lib/courses";
import {
  readDraft,
  writeDraft,
  clearDraft,
} from "@/lib/server/signup-draft";
import {
  completeSignup,
  addInterviewSlot,
  removeInterviewSlot,
  cancelSignup,
  getInterviewSlot,
  SlotTakenError,
} from "@/lib/server/signup";

export const server = {
  createPage: defineAction({
    input: createPageInput,
    accept: "form",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a page.",
        });
      }

      const db = getDb(env.db);

      const { title, path, abstract, keywords } = formData;

      return Promise.try(() =>
        db
          .insert(page)
          .values({ title, path, abstract, keywords })
          .returning({ id: page.id }),
      )
        .then(([created]) => ({ id: created.id }))
        .catch((err: unknown) => {
          if (err instanceof ActionError) throw err;
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("UNIQUE constraint failed")) {
            throw new ActionError({
              code: "CONFLICT",
              message: "A page with this path already exists.",
            });
          }
          // Keep the real cause server-side; surface a safe message to the client.
          console.error("[createPage] database error:", err);
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create the page. Please try again.",
          });
        });
    },
  }),

  updatePage: defineAction({
    input: updatePageInput,
    accept: "form",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to edit a page.",
        });
      }

      const db = getDb(env.db);
      const { id, title, path, abstract, keywords, isPublished } = formData;
      // isPublished is now always a real boolean (transform in schema).

      return Promise.try(() =>
        db
          .update(page)
          .set({ title, path, abstract, keywords, isPublished })
          .where(eq(page.id, id))
          .returning({ id: page.id }),
      )
        .then(([updated]) => {
          if (!updated) {
            throw new ActionError({
              code: "NOT_FOUND",
              message: "Page not found.",
            });
          }
          return { id: updated.id };
        })
        .catch((err: unknown) => {
          if (err instanceof ActionError) throw err;
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("UNIQUE constraint failed")) {
            throw new ActionError({
              code: "CONFLICT",
              message: "A page with this path already exists.",
            });
          }
          throw err;
        });
    },
  }),

  addBlock: defineAction({
    input: addBlockInput,
    accept: "form",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add a block.",
        });
      }

      const db = getDb(env.db);
      const { pageId, type } = formData;
      const position = await nextBlockPosition(pageId);

      return Promise.try(() =>
        db
          .insert(pageBlock)
          .values({ pageId, type, position, content: {} })
          .returning({ id: pageBlock.id, pageId: pageBlock.pageId }),
      ).then(([created]) => ({
        id: created.id,
        pageId: created.pageId,
      }));
    },
  }),

  updateBlock: defineAction({
    input: updateBlockInput,
    accept: "form",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to edit a block.",
        });
      }

      const db = getDb(env.db);
      const { id, content, isVisible } = formData;

      const existing = await getBlockById(id);
      if (!existing) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Block not found.",
        });
      }

      // Editors send content as a string. Shape it into the right object form
      // based on the block's type: markdown wraps the raw text, everything else
      // expects a JSON string the editor serialized. Empty content clears the
      // field instead of throwing on JSON.parse("").
      let contentObj: unknown = undefined;
      if (content !== undefined) {
        if (content === "") {
          contentObj = null;
        } else if (existing.type === "markdown") {
          contentObj = { markdown: content };
        } else {
          try {
            if (existing.type === "hero") {
              contentObj = heroBlockFields.parse(JSON.parse(content));
            } else if (existing.type === "steps") {
              contentObj = stepsBlockFields.parse(JSON.parse(content));
            }
          } catch {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Block content was not valid JSON.",
            });
          }
        }
      }

      return Promise.try(() =>
        db
          .update(pageBlock)
          .set({
            ...(contentObj !== undefined && { content: contentObj }),
            isVisible, // always defined now (transform in schema)
          })
          .where(eq(pageBlock.id, id))
          .returning({ id: pageBlock.id, pageId: pageBlock.pageId }),
      ).then(([updated]) => ({
        id: updated.id,
        pageId: updated.pageId,
      }));
    },
  }),

  deleteBlock: defineAction({
    input: deleteBlockInput,
    accept: "form",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a block.",
        });
      }

      const db = getDb(env.db);
      const { id } = formData;

      const existing = await getBlockById(id);
      if (!existing) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Block not found.",
        });
      }

      return Promise.try(() =>
        db
          .delete(pageBlock)
          .where(eq(pageBlock.id, id))
          .returning({ pageId: pageBlock.pageId }),
      ).then(([deleted]) => ({ pageId: deleted.pageId }));
    },
  }),

  deletePage: defineAction({
    input: deletePageInput,
    handler: async ({ id }, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a page.",
        });
      }

      const db = getDb(env.db);

      // No separate existence check — returning() will be empty if the row
      // is already gone, which we surface as NOT_FOUND. pageBlock rows are
      // cascaded by the schema, so one delete cleans up the tree.
      return Promise.try(() =>
        db.delete(page).where(eq(page.id, id)).returning({ id: page.id }),
      ).then(([deleted]) => {
        if (!deleted) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Page not found.",
          });
        }
        return { id: deleted.id };
      });
    },
  }),

  reorderBlocks: defineAction({
    input: reorderBlocksInput,
    accept: "json",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to reorder blocks.",
        });
      }

      const db = getDb(env.db);
      const { pageId, blockIds } = formData;

      await Promise.all(
        blockIds.map((blockId, index) =>
          db
            .update(pageBlock)
            .set({ position: index })
            .where(
              sql`${pageBlock.id} = ${blockId} and ${pageBlock.pageId} = ${pageId}`,
            ),
        ),
      );
      return { success: true };
    },
  }),

  sendMagicLink: defineAction({
    handler: async (_, ctx) => {
      const auth = createAuth(env);

      await auth.api.signInMagicLink({
        body: {
          email: "noreply@linguaforte.com",
          callbackURL: "/admin",
          newUserCallbackURL: "/admin/welcome",
          errorCallbackURL: "/error",
        },
        headers: ctx.request.headers,
      });

      return { success: true };
    },
  }),

  // ── Signup flow ──
  // Each stage action reads the prior draft from the cookie, validates the
  // current stage's input against the current DB/YAML state, and writes the
  // merged draft back. Pages handle the redirect on success.

  signupStage1: defineAction({
    input: signupStage1Input,
    accept: "form",
    handler: async ({ name, email }, ctx) => {
      const draft = readDraft(ctx.cookies);
      writeDraft(ctx.cookies, { ...draft, name, email });
      return { ok: true };
    },
  }),

  signupStage2: defineAction({
    input: signupStage2Input,
    accept: "form",
    handler: async ({ courseId }, ctx) => {
      const draft = readDraft(ctx.cookies);
      if (!draft.name || !draft.email) {
        throw new ActionError({
          code: "PRECONDITION_FAILED",
          message: "Please start from step 1.",
        });
      }

      const course = await findCourseById(courseId);
      if (!course) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Please pick a valid course.",
        });
      }

      writeDraft(ctx.cookies, {
        ...draft,
        courseId: course.id,
        courseTitle: course.title,
      });
      return { ok: true };
    },
  }),

  signupStage3: defineAction({
    input: signupStage3Input,
    accept: "form",
    handler: async ({ slotId }, ctx) => {
      const draft = readDraft(ctx.cookies);
      if (!draft.name || !draft.email || !draft.courseId) {
        throw new ActionError({
          code: "PRECONDITION_FAILED",
          message: "Please start from step 1.",
        });
      }

      const slot = await getInterviewSlot(slotId);
      if (!slot) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Please pick an available date.",
        });
      }

      writeDraft(ctx.cookies, {
        ...draft,
        slotId: slot.id,
        bookedFor: slot.startsAt.getTime(),
      });
      return { ok: true };
    },
  }),

  signupComplete: defineAction({
    input: signupCompleteInput,
    accept: "form",
    handler: async ({ note }, ctx) => {
      const draft = readDraft(ctx.cookies);
      if (
        !draft.name ||
        !draft.email ||
        !draft.courseTitle ||
        !draft.slotId ||
        typeof draft.bookedFor !== "number"
      ) {
        throw new ActionError({
          code: "PRECONDITION_FAILED",
          message: "Please complete the previous steps.",
        });
      }

      try {
        const result = await completeSignup({
          fullName: draft.name,
          email: draft.email,
          courseTitle: draft.courseTitle,
          bookedFor: new Date(draft.bookedFor),
          note: note?.trim() || undefined,
          slotId: draft.slotId,
        });
        clearDraft(ctx.cookies);
        return { id: result.id };
      } catch (err: unknown) {
        if (err instanceof SlotTakenError) {
          throw new ActionError({
            code: "CONFLICT",
            message:
              "This date was just taken by someone else. Please pick another.",
          });
        }
        throw err;
      }
    },
  }),

  // ── Admin: interview slots ──

  addInterviewSlot: defineAction({
    input: addInterviewSlotInput,
    accept: "form",
    handler: async ({ startsAt }, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to manage interview slots.",
        });
      }

      return Promise.try(() => addInterviewSlot(startsAt)).catch(
        (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("UNIQUE constraint failed")) {
            throw new ActionError({
              code: "CONFLICT",
              message: "A slot at that date and time already exists.",
            });
          }
          throw err;
        },
      );
    },
  }),

  removeInterviewSlot: defineAction({
    input: removeInterviewSlotInput,
    handler: async ({ id }, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to remove interview slots.",
        });
      }
      await removeInterviewSlot(id);
      return { ok: true };
    },
  }),

  cancelSignup: defineAction({
    input: cancelSignupInput,
    handler: async ({ id }, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to cancel a signup.",
        });
      }

      const result = await cancelSignup(id);
      if (!result) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Signup not found.",
        });
      }
      return { ok: true };
    },
  }),
};
