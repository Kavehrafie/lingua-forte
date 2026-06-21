import { defineAction } from "astro:actions";
import { createAuth } from "@/lib/server/auth";
import { env } from "cloudflare:workers";

export const server = {
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
