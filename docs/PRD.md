# eBizEarn Frontend — PRD

## What it is
The public web frontend for **eBizEarn** (`ebizearn.com`), a two-sided marketplace: real businesses post verified digital tasks (social engagement, follows, reviews) and contributors complete them, submit proof, and earn rewards. It talks to a separate **Laravel 11 API** backend (repo is backend-agnostic UI only). Pushes to `main` auto-deploy via GitHub Actions → FTPS to cPanel.

## Users
1. **Contributors (free)** — sign up free, browse task feed, submit proof (guided flow: pre-filled link + required screenshot), track earnings/wallet, refer others, withdraw.
2. **Businesses** — create campaigns via wizard (geo targeting, multi-country, worldwide="ALL"), review submissions, manage contributors/team, view reports, manage billing.
3. **Admins / Super Admins** — oversight portal: users, KYC, businesses, campaigns, task library, wallets, payouts, deposits, payment gateways, fraud, referrals, ranks/tiers, platforms, social channels, traffic analytics, audit logs, support, system health, permissions, settings. Includes login-as and demo-request modules.

## Core features
- Task feed + task detail + guided proof submission
- Wallet / earnings / referrals with 3-level affiliate structure
- **$50 minimum withdrawal** (`minWithdrawalCents: 5000`, backend enforces); real USDT payouts are **manual admin-approved** (TRC-20 / ERC-20)
- Auth: email/OTP/Google OAuth; mandatory-phone blocking modal for accounts without phone; country-change approval flow; session timeout handling
- Contributor ranks with premium badges (Super Admin managed)
- Admin traffic dashboard: live visitors, login feed, journey drilldown
- Fraud screening, KYC verification center, gateway test UI (green working / red failed)
- Onboarding wizard, business login/signup, contributor login/signup, moderator + super-admin logins
- Public marketing site: Home, How It Works, For Businesses, Earn, Tasks, Pricing(?) — see `src/pages/public` (15 pages + legal set)
- **Blog** (`/blog`): 52 posts as of 2026-10-08; a daily content machine publishes 3 articles/day; posts are TS modules auto-discovered via `import.meta.glob`, with a strict writer's contract (`src/blog/README.md`: title 50–60 chars, excerpt 140–160, one of 9 categories, no fabricated stats, no earnings promises)
- SEO: prerendered blog HTML, generated `sitemap.xml`, FAQ JSON-LD, legal pages with generated PDFs
- Site opens **in English only** (single locale `'en'`; site-wide GTranslate widget handles other languages)

## Non-goals / unknowns (TODO)
- Backend contract details live in the separate Laravel repo — confirm endpoint changes there before building new API surfaces.
- Whether USDT/network copy in UI matches backend's current supported networks — TODO verify against live backend.
