---
name: Landing page funnels to /signup
description: For Lingua Forte, landing page should drive visitors to the standalone signup page; do not embed the full form inline
type: feedback
---

For the Lingua Forte redesign: the landing page's job is to entice visitors to go to `/signup`. Do NOT embed the full signup form inline on the landing page. Every CTA on the landing page should link to `/signup`.

**Why:** User stated this directly on 2026-06-21 when adding a separate signup page to scope. A dedicated signup route is the primary conversion surface; duplicating the long form on the landing page would split conversion intent and bloat the landing experience.

**How to apply:** When designing or modifying the landing page (`src/pages/index.astro` and its blocks), use buttons/links/anchor CTAs that route to `/signup`. Reserve all form fields, `FieldSet` groups, and submit wiring for `src/pages/signup.astro`. A CTA-style block on the landing page with `id="signup"` is fine for anchor scrolling, but it contains a button, not a form.