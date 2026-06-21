/**
 * CLI-only entry point for `better-auth` schema generation.
 *
 * Usage: npx @better-auth/cli generate --config src/lib/server/auth-cli.ts
 *
 * This file is NEVER imported by the runtime (middleware, routes, etc.) —
 * only by the CLI tool running in plain Node.js. `createAuth(null!)` is safe
 * here because the null-guard in createAuth returns a schema-only instance
 * that the CLI can introspect without a real database connection.
 */
import { createAuth } from "./auth";

export const auth = createAuth(null!);
