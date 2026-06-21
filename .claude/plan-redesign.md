# Lingua Forte Landing Page Redesign — Resume State

> Source plan: `~/.claude/plans/effervescent-hugging-stearns.md` (full design read, dials, section table, file lists). This file is the project-local copy so future sessions can pick up where we stopped.

**Last active:** 2026-06-20

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

1. **Rewrite `src/styles/global.css`** — replace oklch default palette with forest+bone+amber (light + dark), drop `--radius` to `0.5rem`, add `--font-display` / `--font-sans` tokens, wire body + `.font-display` utility. Tokens to use:
   - Light: bg `#F7F5EF`, fg `#1C2A1E`, primary `#1F4D3A`, accent `#C68C24`, border `#E0DCD0`, muted `#7A7163`, input `#FFFFFF`
   - Dark: bg `#0F1813`, fg `#E8E4D8`, primary `#2E6B4F`, accent `#D9A03E`, border `#2A3530`, muted `#9B9483`

2. **Update `src/layouts/Layout.astro`** — import the two Fontsource CSS files, update `<title>` to "Lingua Forte — English classes and tutoring" (note: that title contains an em-dash; swap to a colon or hyphen per the skill's em-dash ban, e.g. "Lingua Forte — English classes and tutoring" → "Lingua Forte: English classes and tutoring"), pass updated header/footer props.

3. **Customize existing blocks:**
   - `src/components/blocks/hero-8.astro` — wire `.font-display` onto the `<h1>`, swap copy to remove the em-dash in current description ("for every level — from first words" → restructure)
   - `src/components/blocks/faqs-4.astro` — replace 4 SaaS FAQs with 4 language-school FAQs (levels, class size, certification, scheduling)
   - `src/components/blocks/steps.astro` — replace generic 3 steps with 4-step intake: Tell us your goal → Take a placement check → Get matched with a teacher → Start your first class

4. **Create new blocks under `src/components/blocks/`:**
   - `trust-strip.astro` — 4 stats, `font-display` numbers, no logos
   - `programs.astro` — 4-cell asymmetric bento, 1 tile with hero image, others tinted forest
   - `testimonials.astro` — 1 large pull quote + 2 supporting quotes
   - `signup.astro` — split layout, left context column with "what happens next", right multi-field form with two `FieldSet` groups (Contact + Learning goals). Use native `<select>` styled to match Input (no Select primitive exists). Form `id="signup"` so header CTA anchors to it. Leave `action`/`method` as TODO comments.

5. **Wire `src/pages/index.astro`** — section order: header (in Layout) → hero → trust-strip → programs → steps → testimonials → signup → faqs → footer (in Layout). Remove `contact-1` import, add new imports. Pass fresh copy without em-dashes.

6. **Verify** — `bun run dev`, visual sweep at 375/768/1280px, theme toggle both modes, run:
   ```bash
   grep -rn '—' src/components/blocks/ src/pages/index.astro  # must be zero
   grep -rn 'uppercase tracking' src/components/blocks/        # must be ≤ 3
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
