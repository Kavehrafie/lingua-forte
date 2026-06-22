import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { magicLink } from "better-auth/plugins";
import { cloudflareEmail } from "better-auth-cloudflare-email";

export const createAuth = (env: Cloudflare.Env | null) => {
  // CLI path (env is null): minimal instance for `better-auth` schema generation.
  // drizzle(null!) is safe because the CLI never executes queries — it only
  // reads table definitions from the schema.
  if (!env) {
    return betterAuth({
      database: drizzleAdapter(getDb(null!), { provider: "sqlite" }),
      plugins: [magicLink({ sendMagicLink: async () => {} })],
    });
  }

  const email = cloudflareEmail.workers({
    binding: env.EMAIL as any,
    from: `Lingua Forte <${env.NOREPLY_EMAIL}>`,
    appName: "Lingua Forte",
  });

  return betterAuth({
    ...email.config,
    plugins: [magicLink({ sendMagicLink: email.sendMagicLink })],
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
