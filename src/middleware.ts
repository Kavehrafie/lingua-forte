import { env } from "cloudflare:workers";
import { createAuth } from "@/lib/server/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const auth = createAuth(env);

  // Intercept all better-auth API routes — handle server-side, no Astro API route needed
  const url = new URL(context.request.url);
  if (url.pathname.startsWith("/api/auth")) {
    return auth.handler(context.request);
  }

  // For all other routes, hydrate session into locals
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (session) {
    context.locals.user = session.user;
    context.locals.session = session.session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
