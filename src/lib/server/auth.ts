import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";

export const createAuth = (env: Cloudflare.Env | null) => {
  // CLI path (env is null): minimal instance for `better-auth` schema generation.
  // drizzle(null!) is safe because the CLI never executes queries — it only
  // reads table definitions from the schema.
  if (!env) {
    return betterAuth({
      baseURL: env!.BETTER_AUTH_URL,
      database: drizzleAdapter(getDb(null!), { provider: "sqlite" }),
      plugins: [magicLink({ sendMagicLink: async () => {} })],
    });
  }

  const resend = new Resend(env.RESEND_API_KEY);

  return betterAuth({
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await resend.emails.send({
            from: `Lingua Forte <${env.NOREPLY_EMAIL}>`,
            to: email,
            subject: "Sign in to Lingua Forte",
            html: `<p>Click the link below to sign in to your Lingua Forte account. If you didn't request this, you can safely ignore this email.</p><p><a href="${url}">${url}</a></p>`,
          });
        },
      }),
    ],
    database: drizzleAdapter(getDb(env.db), { provider: "sqlite" }),
  });
};

/**
 * DO NOT USE AT RUNTIME — module-level eval of this would crash Vite SSR.
 *
 * This export is a stub for type compatibility ONLY.
 * The `better-auth` CLI uses `src/lib/server/auth-cli.ts` which calls
 * `createAuth(null!)` safely in a Node.js context.
 * At runtime, always call `createAuth(env)` from middleware/routes.
 */
export const auth = undefined as any;
