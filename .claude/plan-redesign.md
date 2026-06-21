# Lingua Forte Landing Page Redesign — Resume State

> Source plan: `~/.claude/plans/effervescent-hugging-stearns.md` (full design read, dials, section table, file lists). This file is the project-local copy so future sessions can pick up where we stopped.

**Last active:** 2026-06-21

> **2026-06-21 update:** User supplied real business copy (email, Montreal/Griffintown location, EDT hours, dialog-based philosophy, About Us, 3 FAQs, "Three Steps to Fluency" intake). Two scope changes: (a) standalone `/signup` page is now in scope as the primary conversion surface; (b) landing page funnels to `/signup` via CTAs, no inline form. "Next up" below reflects both.

## Goal

Replace the default `@fulldev` blocks on the landing page with a distinct identity for a language testing & learning org whose primary conversion is adult learners + professionals signing up for classes and tutoring. Design-only pass; backend wiring comes later.

**Direction locked:** forest + bone + amber palette, Newsreader display serif + Inter Tight body, dual-theme defaulting to system, full-page redesign + dedicated signup section.

## Progress

### Done

- [x] `CLAUDE.md` created at repo root with project architecture, commands, known config issues
- [x] Design read + dials + section structure approved (see source plan)
- [x] Fonts installed: `@fontsource-variable/newsreader`, `@fontsource-variable/inter-tight` (via bun)
- [x] Read every existing block I'll be customizing: `hero-8`, `header-2`, `footer-3`, `steps`, `faqs-4`, `contact-1`

### Next up (in order)

Content source of truth: see memory `project_business_facts.md` (email, Montreal/Griffintown, EDT hours, dialog-based philosophy, actual 3-step intake, actual 3 FAQs, About Us copy).

1. **Rewrite `src/styles/global.css`** — replace oklch default palette with forest+bone+amber (light + dark), drop `--radius` to `0.5rem`, add `--font-display` / `--font-sans` tokens, wire body + `.font-display` utility. Tokens to use:
   - Light: bg `#F7F5EF`, fg `#1C2A1E`, primary `#1F4D3A`, accent `#C68C24`, border `#E0DCD0`, muted `#7A7163`, input `#FFFFFF`
   - Dark: bg `#0F1813`, fg `#E8E4D8`, primary `#2E6B4F`, accent `#D9A03E`, border `#2A3530`, muted `#9B9483`

2. **Update `src/layouts/Layout.astro`** — import the two Fontsource CSS files, set `<title>` to "Lingua Forte: English classes and tutoring" (colon, not em-dash). Update header nav (About / Programs / How it works) and header CTA `href="/signup"`. Replace placeholder footer copy: description = real differentiator line, contact uses real email `linguforte@protonmail.com`, real location Griffintown Montreal QC, real hours weekdays 8am-4pm EDT. Drop the GitHub/Discord/X socials unless real accounts exist.

3. **Customize existing blocks:**
   - `src/components/blocks/hero-8.astro` — wire `.font-display` onto `<h1>`. Hero CTA button `href="/signup"` (was `/docs/`). Rewrite description using real differentiator copy (personalized, not test-specific; ready for any exam AND everyday/professional communication). Strip the em-dash from current "every level — from first words" copy.
   - `src/components/blocks/faqs-4.astro` — replace 4 SaaS FAQs with the 3 real FAQs (see memory): "How many hours do I need?" / "Is it general or tailored and specific?" / "What about the time and frequency of the classes?"
   - `src/components/blocks/steps.astro` — replace generic 3 steps with the actual "Three Steps to Fluency": 1) Book a free placement session. 2) Select the plan that best fits your needs. 3) We start this journey together.

4. **Create new landing-page blocks under `src/components/blocks/`** (these exist to entice → `/signup`; NO inline form fields anywhere):
   - `trust-strip.astro` — 4 stats, `font-display` numbers, no logos
   - `programs.astro` — 4-cell asymmetric bento, 1 tile with hero image, others tinted forest
   - `about.astro` — NEW. Renders the "About Us" copy (fresh company, dialog-based learning philosophy, experienced teachers across all learner levels). Ends with CTA → `/signup`.
   - `testimonials.astro` — 1 large pull quote + 2 supporting quotes (copy is placeholder until real testimonials are supplied; flag this)
   - `signup-cta.astro` — NEW. Replaces the originally-planned embedded signup block. Split layout: left = "What happens next" reassurance (the 3 steps condensed), right = single forest primary button → `/signup`. Keep `id="signup"` on the section so header CTA can anchor-scroll here.

5. **Build the standalone signup page** `src/pages/signup.astro` — primary conversion surface. Same `Layout.astro` shell but with a stripped header (logo + back-to-home only) so visitors stay focused on the form. Split layout: left context column = placement-session explanation + "what happens next"; right = multi-field form with two `FieldSet` groups (Contact: name, email, phone optional; Learning goals: current level, target, preferred schedule). Use native `<select>` styled to match Input. Leave `action`/`method` as TODO comments. No submit wiring.

6. **Wire `src/pages/index.astro`** — section order: header (in Layout) → hero → trust-strip → programs → steps → about → testimonials → signup-cta → faqs → footer (in Layout). Remove `contact-1` import, remove the commented-out `hero-5` import. Every CTA → `href="/signup"`. Fresh copy throughout, zero em-dashes.

7. **Verify** — `bun run dev`, visual sweep at 375/768/1280px on BOTH `/` and `/signup`, theme toggle both modes, run:
   ```bash
   grep -rn '—' src/components/blocks/ src/pages/  # must be zero
   grep -rn 'uppercase tracking' src/components/blocks/  # must be ≤ 3
   ```

## Key constraints to keep in mind while resuming

- **ZERO em-dashes (`—` or `–`) in any user-visible copy.** Includes titles, descriptions, button labels, FAQs, footer text. Use periods, commas, colons, or hyphens instead.
- **Eyebrow count ≤ 3 across all 9 sections** (max 1 per 3 sections). Hero counts as 1.
- **8+ distinct layout families** on the rendered page (table in source plan).
- **Forest = primary CTA color.** Amber = single accent (italic emphasis words, focus rings, eyebrow text). Never both on same element.
- **Don't touch** `src/components/ui/theme-toggle/*` — already wires `.dark` class with system default + localStorage.
- **Form is static** (no submit wiring) — backend comes later. Leave `action`/`method` as TODO.
- **No Card/Badge/Tabs primitives exist** — compose inline with `border` + `rounded-lg` or use `Field`/`Section` primitives.

## Useful file paths for resume

- Plan source: `~/.claude/plans/effervescent-hugging-stearns.md`
- Project memory: `CLAUDE.md` (repo root)
- Existing blocks: `src/components/blocks/{hero-8,header-2,footer-3,steps,faqs-4,contact-1}.astro`
- UI primitives to compose: `src/components/ui/{button,field,input,label,textarea,section,icon,separator}/*`
- `cn()` helper: `src/lib/utils.ts`
- Existing images to reuse: `src/assets/{naassom-azevedo-Q_Sei-TqSlc-unsplash.jpg,joel-frank-Nwo3kck3zMI-unsplash.jpg}`
