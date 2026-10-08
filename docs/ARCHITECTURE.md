# eBizEarn Frontend — Architecture

## Stack
- **React 19.2** + **TypeScript (~6)** + **Vite 8** + **Tailwind CSS 4** (`@tailwindcss/vite` plugin, `@theme` tokens in `src/index.css`)
- State: React Context (Auth, PlatformData, Region, Theme) + **TanStack React Query 5** for server state; `axios` for HTTP
- Routing: `react-router-dom` v7; lazy pages in `src/routes/lazy.tsx` with prefetch hints (`src/routes/prefetch.ts`)
- Icons: **lucide-react** (131 files) — owner standard is Heroicons inline SVG; migration is a TODO, not done
- Animation: `framer-motion` v13; charts: `recharts`; QR codes: `qrcode.react`

## Folder map
```
src/
  pages/        public/ auth/ contributor/ business/ admin/ (role-split; see below)
  components/   account/ admin/ auth/ business/ campaign/ common/ support/ task/
  api/          one module per domain: auth, business, campaigns? (admin, tasks,
                wallet, deposits, payouts via admin.ts, profile, support, email,
                socialChannels, platforms, ops, taskTemplates, authProviders)
  layouts/      PublicLayout, ContributorLayout, BusinessLayout, AdminLayout
  context/      AuthContext, PlatformDataContext, RegionContext, ThemeContext
  hooks/        useMoney, usePageTracking, useSessionTimeout
  i18n/         English-only dictionary (GTranslate does the rest)
  blog/         posts/*.ts (52 as of 2026-10-08) + loader/schemas/types; README = writer contract
  utils/        currency, phone, countries, toast, apiMappers, auditLabels, can (permissions) ...
  lib/          campaignDrafts
  seo/          seo.ts, faqData.ts
  legal/        terms.ts, privacy.ts (rendered + exported to PDF at build)
  config/       brand.ts (name/domain/socials/min-withdrawal/demo metrics), geoLocations, consent
index.html      public/ assets, images, legal PDFs, robots.txt, sitemap.xml
scripts/        generate-terms-pdf.ts, generate-sitemap.ts, prerender-blog.ts
```

## Code splitting
`vite.config.ts` `manualChunks` groups lazy pages per role: `admin`, `contributor-app`, `business-app`, `auth`, `blog`; public/auth pages stay small per-page chunks so first paint stays light.

## Data flow
Browser → axios singleton (`src/api/client.ts`, token `ebizearn_token` in localStorage, 401 fires `ebizearn:session-expired`) → `VITE_API_URL` + `/api/v1`:
- local: `http://127.0.0.1:8013/api/v1` · prod (`frontend/.env.production` baked at build): `https://api.ebizearn.com/api/v1`
- Google OAuth client ID is public-safe and baked into the bundle.

## Build & deploy pipeline
`npm run build` = `tsc -b` → `vite build` → `prerender-blog` (SSR HTML for blog posts so Google indexes them). `prebuild` = `legal:pdf` (terms/privacy PDFs) + `sitemap`. GitHub Actions (`deploy.yml`) on `main`: `npm ci` → copy `.env.production` → build → **FTPS upload of `dist/` to cPanel root of ebizearn.com**. Docs-only pushes also redeploy — expected and safe.

## Notable conventions in code
- Blog posts never share an index file (parallel writers must not touch shared files).
- Money in cents (`minWithdrawalCents`); display via `useMoney`.
- Permission checks via `utils/can.ts` + `permissionGroups.ts`; audit labels centralized (`auditLabels.ts`).
- Dark mode via `.dark` class + Tailwind `@custom-variant`; short desktop viewports get a `short` variant for auth forms.
