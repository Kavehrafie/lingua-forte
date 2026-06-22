# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Lingua Forte** — marketing site for a language testing and learning organization. Primary CTA is getting visitors to fill out a signup form for classes and tutoring. Backend (form handling, course catalog, scheduling) comes later; current focus is design.

## Commands

Package manager: **bun** (`bun.lock` is canonical; `package-lock.json` is stale and tracked by accident — prefer bun).

```bash
bun install              # install deps
bun run dev              # astro dev server on :4321
bun run build            # production build → dist/
bun run preview          # build + wrangler pages dev (local Cloudflare runtime)
bun run generate-types   # wrangler types → regenerates worker-configuration.d.ts (the Env interface)
```

Type check: `bunx astro check`.

### Drizzle migrations (D1 via remote HTTP)

Requires `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` in env. Schema source is `src/lib/server/db/schema.ts` (which re-exports `auth-schema.ts`).

```bash
bunx drizzle-kit generate   # create new SQL migration in drizzle/
bunx drizzle-kit migrate    # apply migrations to remote D1
```

## Architecture

### Runtime model (Astro + Cloudflare Workers, not Pages)

Adapter is `@astrojs/cloudflare` with `platformProxy.enabled: true`, so in dev the Cloudflare bindings are available via `wrangler` proxy. Bindings declared in `wrangler.jsonc`:

- `db` — D1 database `lingua-forte-db`
- `EMAIL` — Cloudflare Email Service `send_email` binding
- `ASSETS` — static assets

Bindings reach request handlers through `Astro.locals.runtime.env` (typed via `App.Locals extends Runtime<Env>` in `src/env.d.ts`). When you need D1 or email in a route, read it off `Astro.locals.runtime.env.*` — never import a global.

### Auth (better-auth + magic link + Drizzle)

- `src/lib/server/auth.ts` exports a **factory** `createAuth(d1: D1Database)` that builds a per-request better-auth instance bound to the request's D1. Call this inside server code where you have the D1 binding.
- The bare `export const auth = createAuth(null!)` exists ONLY so the `better-auth` CLI can generate schema. It is marked DO NOT USE — never import it at runtime. Always rebuild auth from `Astro.locals.runtime.env.db`.
- `sendMagicLink` is currently a `console.log` stub. Wiring it to the `EMAIL` binding is pending.
- Client SDK is in `src/lib/auth-client.ts` (`magicLinkClient` plugin).
- DB schema in `src/lib/server/db/auth-schema.ts` is better-auth's generated shape (user / session / account / verification). Don't hand-edit; regenerate via better-auth CLI after auth config changes.

### Frontend stack

- **Tailwind v4** via `@tailwindcss/vite` (no PostCSS plugin, no `tailwind.config.*`). Theme tokens live as CSS variables in `src/styles/global.css` (oklch palette, `@theme inline` block).
- **UI components** are shadcn-style `.astro` files. Two registries configured in `components.json`:
  - Default shadcn registry (`base-vega` style, `neutral` base color)
  - `@fulldev` registry → `https://ui.full.dev/r/{name}.json` (source for marketing blocks)
- **Path alias**: `@/*` → `./src/*`.
- Primitives live in `src/components/ui/` (button, dialog, header, sheet, navigation-menu, theme-toggle, etc.). Page-level marketing sections live in `src/components/blocks/` (hero-8, contact-1, faqs-4, header-2, footer-3, steps).
- `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge).
- Image service is Cloudflare's (set in the adapter), so `astro:assets` `<Image>` routes through CF image resizing at runtime.

### Skills layer

`skills-lock.json` + `.agents/skills/` is how this repo vendors agent skills. The currently installed skill is **`design-taste-frontend`** (anti-slop frontend brief inference, dial system, pre-flight check). When asked to redesign or polish the UI, prefer invoking it via the Skill tool rather than improvising — it carries the design discipline this project should ship against.

## Known configuration issues

These are real, easy to trip on:

1. **`wrangler.jsonc` points at SvelteKit paths** (`"main": ".svelte-kit/cloudflare/_worker.js"`, `"directory": ".svelte-kit/cloudflare"`). The actual Astro Cloudflare output goes to `dist/client/` + `dist/server/`. Recent commit message says assets dir was set to `./dist/client/`, but the file currently shows SvelteKit paths. Fix before deploying.
2. **`package.json` scripts still use `wrangler pages dev/deploy`** even though the project migrated to Workers. `bun run preview` and `bun run deploy` will fail or do the wrong thing until updated to `wrangler dev` / `wrangler deploy`.
3. **`README.md` is the default Astro starter template**, no project-specific content.

## Implementation gotchas

### Scroll-driven parallax on a footer (`src/components/blocks/footer-3.astro`)

The footer uses CSS scroll-driven animations (`animation-timeline: view()`) to parallax the Calder SVG behind the footer content. Three things trip this up:

1. **`animation-range` must be reachable.** For a bottom-of-page element you can only scroll from `entry 0%` (footer top enters viewport) to ~`contain 0%` (footer fully visible). Ranges like `entry 0% contain 100%` or `entry 0% exit 100%` never reach their endpoint because the page ends first, so the animation stalls partway. Use `animation-range: entry` (= `entry 0% entry 100%`) — that maps the animation onto the scroll range you can actually reach.
2. **`translateY(<percentage>)` is relative to the SVG's own height, not the footer's.** With `height: 100% !important` on `.parallax-layer-back` they match, but `±6%` is only ~12% of footer height of total travel — too subtle. `±20%` reads as parallax.
3. **Buffer the layer height or you get gaps.** The SVG is anchored `top: 0; bottom: 0; height: 100%`, so translating it inside `overflow: hidden` reveals empty footer background on the opposite edge. Make the layer taller than its container (e.g. `height: 140%`, shift `top` to center) so it has room to move within the mask.

Scroll-driven animations are Chrome/Edge 115+, Safari 26+, Firefox 135+ (sometimes flagged). Outside those, the parallax silently no-ops.

## Design intent

The site currently uses generic full.dev blocks as a placeholder. The goal is to give Lingua Forte a distinct visual identity (not the default shadcn/full.dev look). The signup form for classes and tutoring is the conversion target — design decisions should funnel toward it. When doing design work, invoke the `design-taste-frontend` skill first; it carries the brief-inference and pre-flight rules that govern this project's aesthetic.
