# Review: `src/pages/[...path].astro`

> Reviewed 2026-06-22. Dynamic catch-all route that renders a CMS page from D1.

## Scope

`src/pages/[...path].astro` — the public page renderer. Data flow:

`Astro.params.path` → `getPageByPath()` (`src/lib/server/page.ts`) → D1 `page` + nested
`page_block` rows → mapped to block components (`hero-8.astro`).

## Verdict

The happy path works: route param → DB lookup → render `hero` blocks. The **path
convention is consistent** — `Astro.params.path` (catch-all, no leading slash) matches
how `createPageInput` stores paths (`src/actions/schema.ts:13` strips leading/trailing
slashes and lowercases). So `/getting-started` correctly finds a page stored as
`getting-started`. Static routes (`/admin`, `/login`, `/signup`) correctly shadow the
catch-all.

But there are several real gaps, ordered by severity.

## Findings

### 1. The `image` prop is dead code — DB image selection does nothing 🔴

`[...path].astro:37-40` maps `data.image` (`calder-1` / `calder-2`) to an `image` object
and passes it to `<Hero8Block image={...}>`. But **`hero-8.astro` never reads its `image`
prop** — it hardcodes `<Calder class="w-full parallax-hero-layer" />` (`hero-8.astro:44`)
and the real `<Image src={image.src}>` is commented out (`hero-8.astro:45-51`). The
`image` prop is declared in `Props`, destructured, then ignored.

**Consequence:** an editor picks "calder-2" in the admin and it has zero effect — the hero
always renders `calder.svg`. Either wire `image.src` into the component, or drop the prop
until the design settles.

### 2. No 404 handling 🔴

If no page matches, `page?.blocks.map(...)` (`[...path].astro:30`) silently renders an
empty `<Layout>` (header + footer, no body, **HTTP 200**). Unknown URLs should return 404:

```astro
const page = await getPageByPath(path);
if (!page) {
  return new Response(null, { status: 404, headers: { location: "/404" } });
  // or throw a 404 / render src/pages/error.astro
}
```

### 3. `isPublished` isn't enforced on the public route 🟠

The admin form states *"Unchecked pages are not visible to the public"*
(`PageForm.astro:155-157`), but `[...path].astro` renders any page regardless of
`page.isPublished`. Unpublished/draft pages are fully reachable. The public route should
gate on it:

```astro
if (!page || !page.isPublished) { /* 404 */ }
```

### 4. Block `isVisible` isn't respected 🟡

`getPageByPath` returns all blocks; the renderer doesn't filter `block.isVisible`. A block
hidden in the admin still renders. Filter in the query or skip in the `.map()`:

```astro
page.blocks.filter((b) => b.isVisible).map(...)
```

### 5. Several `HeroBlockFields` are editable but ignored 🟡

`src/lib/block-fields.ts` defines `subheading`, `headingLevel`, `textAlignment`,
`variant`, `imagePosition` — none are read by `[...path].astro` or `hero-8.astro`. Editors
can fill these fields to no effect. Same root cause as #1: the prop surface outran the
implementation.

### 6. `set:html` on DB content (XSS surface) 🟡

`hero-8.astro:62,67` renders `title` and `description` via `set:html`. Content comes from
the DB. Fine if only trusted admins can write it (they can — actions require
`ctx.locals.user`), but if any field ever accepts untrusted input this is an injection
point. Worth a note rather than a fix today.

## Lower-priority notes

- Only `hero` blocks render; other types return `undefined` (known, per the comment at
  `[...path].astro:50`). Pages with non-hero blocks will have gaps.
- `block.content as HeroBlockFields` is an unvalidated cast, but safe-ish because
  `updateBlock` runs `heroBlockFields.parse(...)` on write (`src/actions/index.ts:167`).

## Recommended next step

Wire the `image` prop into `hero-8.astro` (so admin image selection actually works) and
add 404 + `isPublished` / `isVisible` gating. If touching the hero's visual structure,
invoke the `design-taste-frontend` skill first.
