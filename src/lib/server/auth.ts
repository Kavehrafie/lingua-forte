import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { magicLink } from "better-auth/plugins";
const config = {
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url, metadata }, ctx) => {
        // send email to user
        console.log(`Send magic link to ${email}: ${url}`);
      },
    }),
  ],
};

export const createAuth = (d1: D1Database) => {
  return betterAuth({
    ...config,
    database: drizzleAdapter(getDb(d1), { provider: "sqlite" }),
  });
};

/**
 * DO NOT USE!
 *
 * This instance is used by the `better-auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
