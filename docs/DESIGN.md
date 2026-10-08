# eBizEarn Frontend — Design System

> Source of truth: `src/index.css` + `src/config/brand.ts` + Tailwind v4 `@theme` tokens. Anything here that contradicts those files is stale.

## Brand
- Name: **eBizEarn** · Tagline: "Verified Tasks. Global Opportunities." · Domain: ebizearn.com · Support: support@ebizearn.com
- Official socials (in `brand.ts`): facebook.com/ebizearn, instagram.com/ebizearn, linkedin.com/company/ebizearn, x.com/ebizearn, youtube.com/@ebizearn
- Logo: used raw, never on a card/box behind it.

## Color tokens (`:root` in index.css)
| Token | Value | Use |
|---|---|---|
| `--brand-navy` / `-dark` / `-secondary` | #07182F / #040F1E / #0D2342 | brand surfaces, headers, admin |
| `--brand-blue` | #3478F6 | primary actions |
| `--brand-bright-blue` | #168BFF | accents, links |
| `--brand-purple` | #7257FF | secondary brand accent |
| `--brand-cyan` | #20C4E8 | highlights, info |
| `--brand-success` | #16B364 | success states |
| `--brand-warning` | #F79009 | warnings |
| `--brand-danger` | #F04438 | errors, destructive |

Light theme: page bg `#F7F9FC`, text `#101828`. Dark theme (`.dark` class): bg `#0B0F19`, text `#E8ECF3`. Native controls follow theme via `color-scheme`.

## Typography
Apple system stack only (see RULES.md); base `letter-spacing: -0.011em`, antialiased rendering, optical sizing on. **One family** — hierarchy comes from weight/size/letter-spacing, never a second font. No webfont downloads (SF Pro resolves on Apple devices, falls back to Helvetica/Arial elsewhere).

## UI patterns in the codebase
- Role portals with dedicated layouts (Public / Contributor / Business / Admin) — sidebar + topbar inside apps, marketing navbar + footer on public pages.
- Blog: gradient hero when no `heroImage` set (never a broken image); FAQ blocks render as accordions + FAQPage schema; reading-time + TOC anchors from `h2` blocks.
- Mobile-first: recent commits focus on 320–430px (no side-scroll, responsive forms); auth forms tighten on short desktop viewports via the `short` Tailwind variant.
- Buttons: solid brand-blue primaries; destructive = danger token; status pills (KYC, payout, gateway test) use success/warning/danger tokens — green working / red failed convention from the gateway test UI.
- No emojis anywhere in UI; icons via lucide-react currently (owner standard: Heroicons inline SVG — TODO migrate).
- Motion: framer-motion for UI transitions; apple-design standard applies to all new UI work (respond on pointer-down, critically-damped springs, interruptible animations), web-animations patterns for the marketing site.
- Spacing/type scale: Tailwind defaults; radius skews `rounded-xl`/`2xl`; cards float on page bg, no heavy borders.
