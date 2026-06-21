---
name: design-color-and-rhythm
description: Lingua Forte section background rhythm, wordmark brand color, and the lean-on-brand-color directive
metadata:
  type: feedback
---

The landing page must NOT read as one monotone wash of the bone background (user flagged "background of each section is beige too monotone" 2026-06-21). Rhythm comes from value contrast, not from tinted bands:

- Most sections sit on default bone (`bg-background`), getting rhythm from content, hairline dividers, and type — NOT from alternating grey tints (that stripey alternation is its own AI tell).
- Exactly ONE section goes full-bleed forest (`bg-primary`, cream `text-primary-foreground`, amber `text-accent` for the big serif numerals): the **Steps / "Three Steps to Fluency"** section (done 2026-06-21). On forest: swap `border-border`→`border-white/15` and `text-muted-foreground`→`text-primary-foreground/75`. Works in dark mode too (#2E6B4F panel on near-black).
- Planned remaining blocks + their surface: trust-strip = bone (hairline dividers); programs = bone (asymmetric, no card tint); about = bone (editorial + image); **testimonials = bone with a large serif pull-quote** (NOT dark — steps already owns the dark slot); signup-cta = bone background with a forest "card" panel inside (split layout), so there's a second dark moment without two full-bleed darks back-to-back.

**Brand wordmark** (color split, user-directed 2026-06-21): "Lingua" = `text-primary` forest (with `dark:text-[#6FB389]` sage, since primary green is ~2.9:1 on near-black dark bg); "Forte" = `text-accent` amber. BOTH weighted `font-semibold` so the serif italic "Forte" reads as a peer to the sans "Lingua", not fragile/thin beside it (earlier Forte was regular-weight and looked weak). Amber on bone fails text contrast, but the wordmark is a logotype, which is WCAG-exempt — so amber is fine there.

**Color in general** (user directive 2026-06-21): lean on primary forest + the single amber accent throughout; don't default to generic neutral greys. This is what fixes the bland/template feel.

**Why:** monotone beige + generic-neutral UI reads as template-y and untrustworthy; the forest brand color + one deliberate dark interlude give the page identity. **How to apply:** when adding any block, reach for foreground/primary/accent tokens before raw greys; reserve full-bleed `bg-primary` for the steps section only so future dark surfaces (the signup card) stay a single deliberate contrast. See [[lingua-forte-site-scope]].
