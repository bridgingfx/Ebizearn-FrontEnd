# eBizEarn Frontend — Coding Rules

## Standing (owner, always)
- **Stack rule:** any backend work = MySQL + PHP only (cPanel rule). This repo is frontend-only — do not add a Supabase/Postgres/serverless backend here.
- **Fonts:** Apple system stack only — `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif`. Never Roboto/Titillium/Montserrat/Open Sans as primary.
- **UI:** no emojis in UI; icons = Heroicons inline SVG (current code uses lucide-react — migrate opportunistically, don't mix); logos used raw, never on cards/boxes; follow apple-design + web-animations standards for any UI work.
- **Git:** always `git fetch origin` + pull latest `main` before work; never force-push; never `git reset --hard`; never commit other people's uncommitted changes (`git add docs/`-style scoped adds only).
- **Verify before claiming:** after edits run `npm run build`, `npm run lint` (oxlint), `git diff --check`; report safe-to-deploy only after green.

## Repo conventions
- TypeScript strict-ish (`tsc -b` in build); fix type errors, don't loosen config.
- Role-based code: pages under `src/pages/<public|auth|contributor|business|admin>`; shared pieces in `src/components/common` or domain folders — don't cross-import admin internals into public pages (chunking + security).
- API access only through `src/api/` modules via the shared `api` axios instance — never raw `fetch` to the API, never hardcode URLs.
- Secrets: `.env*` files are gitignored except examples; `VITE_GOOGLE_CLIENT_ID` in `.env.production` is intentionally public (safe in client bundle). Never commit real secrets.
- Blog: follow `src/blog/README.md` contract exactly (title 50–60, excerpt 140–160, one of the 9 categories, no fabricated stats, no earnings promises). One export per file: `export const post: BlogPost`. No index file in `posts/`.
- Money: store/display in cents via `useMoney`/`utils/currency`; backend enforces withdrawal minimums — UI values are hints, never authoritative.
- i18n: English is the only source locale; user-facing strings go through `t()` in `src/i18n/dictionaries.ts` so they survive GTranslate DOM translation.

## Must NOT do
- Invent features, stats, payouts, or user counts anywhere user-visible (owner rejects fabricated content).
- Add analytics/tracking scripts or chat widgets without instruction (CSP and privacy posture are deliberate — see commit `7a4f006`).
- Touch `dist/` (build artifact, deployed by CI) or `frontend/public` (legacy dir, root `public/` is live).
- Reword legal pages casually — `src/legal/*.ts` feeds generated PDFs; changes there need care.
- Push anything to `main` without `git diff --check` — every push redeploys ebizearn.com via FTPS.
