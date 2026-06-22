import { defineAction, ActionError } from "astro:actions";
import { createAuth } from "@/lib/server/auth";
import { env } from "cloudflare:workers";
import { createPageInput, updatePageInput } from "./schema";
import { z } from "astro/zod";
import { getDb } from "@/lib/server/db";
import { page } from "@/lib/server/db/schema";

export const server = {
  updatePage: defineAction({
    input: updatePageInput,
    accept: "form",
    handler: async (formData, ctx) => {
      if (ctx.locals.user == null) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a page.",
        });
      }
    },
  }),

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

      // `type` is validated by the schema but not a column on the `page` table;
      // it'll be used later when the page gets an initial block.
      const { title, path, abstract, keywords } = formData;

      return Promise.try(() =>
        db
          .insert(page)
          .values({ title, path, abstract, keywords })
          .returning({ id: page.id }),
      )
        .then(([created]) => ({ id: created.id }))
        .catch((err: unknown) => {
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
};
