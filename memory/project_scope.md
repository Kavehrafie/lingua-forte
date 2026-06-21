---
name: Lingua Forte site scope
description: In-flight scope decisions for the Lingua Forte redesign beyond the landing page itself
type: project
---

**The `/signup` page is designed by the USER themselves** (confirmed 2026-06-21). The agent does NOT build `src/pages/signup.astro`. The user owns its design. Landing-page CTAs still target `/signup` (the agreed route).

**Landing page funnels to `/signup`; it does NOT embed the full form inline.** Landing page job is to help and entice the visitor to click through to `/signup`. Every CTA on the landing page (hero button, header button, about block, final CTA block) links to `/signup`. The landing page may have a single CTA-style "signup" block with `id="signup"` for in-page anchor scrolling, but no form fields.

**Why:** Course signup is a high-intent action that deserves a dedicated route. Dedicated pages convert better for significant commitments, and keeping the long form off the landing page lets the landing page stay fast and narrative-driven.

**How to apply:** Treat signup as a first-class route. Build the full form only there. Landing page work = copy + CTAs that drive to `/signup`, never inline form fields. Form is still static (no submit wiring) per the design-only phase.
