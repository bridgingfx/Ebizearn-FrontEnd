# eBizEarn Frontend — Tasks

Derived from git log + repo state (2026-10-08). Status: ✅ done · 🔄 in-progress · ⏳ open/TODO.

## ✅ Done (recent, verified in log)
- Mobile responsive fixes across 9 pages (`b1315ef`) + merge-marker fix in TaskDetailPage (`c54597c`) — last deploy
- Daily blog machine: 3 articles/day publishing here; 52 posts total (`6c7e1ed` 2026-10-08 batch)
- Security: 2026-09-30 dropper payload cleaned (`dff9d66`); local QR codes, CSP headers, error-leak filtering (`7a4f006`)
- Login-as: clear message when backend not yet deployed (`c335585`)
- Payment gateway test UI: green-working / red-failed status + real message (`024dab3`)
- Traffic dashboard: live visitors, login feed, journey drilldown, real flags (`e446083`)
- Mandatory phone: blocking modal for accounts without phone (`3ac8d15`); contributor profile fixes; country-change KYC warning + task lock UI (`3374614`)
- Contributor ranks: premium badges + Super Admin management (`ff51d77`); admin user detail inline phone/email editing (`2594891`)
- Task proof: guided flow, pre-filled link, required screenshot (`5da2fd9`)
- Campaign wizard: multi-country geo targeting, 'ALL' for worldwide (`1e9948b`, `15cea5c`); AI content generation in wizard (`44608c2`)
- Sidebar: language menu opens upward, sign out on same line; jelly theme toggle (`efdafba`, `a29aebf`, `f666aa6`)
- Session-timeout + doubled-/v1 tracking fixes (`b0e2096`)

## 🔄 In progress
- None tracked in repo right now (working tree was clean; last commit 2026-10-08 mobile fixes). Owner's adjacent backend items live in the Laravel repo, not here.

## ⏳ TODO (from repo state / pending dependencies)
1. Verify the `c54597c` deploy renders correctly on live ebizearn.com (mobile pages fixed).
2. Login-as full flow needs the **backend batch deployed** (frontend shows the "backend not yet deployed" message until Kailash deploys).
3. Real payment-gateway tests: UI done (`024dab3`); actual gateway verification still needs backend deploy + owner confirmation.
4. Icon migration: 131 files use lucide-react; owner standard is Heroicons inline SVG — migrate opportunistically (TODO, no deadline set).
5. Blog prerender smoke check: confirm new daily posts appear in generated `sitemap.xml` and prerendered HTML after each CI build.
6. Public marketing pages: confirm copy/placeholders (address, phone) are real — some may still be placeholders from the rebrand. TODO: owner to confirm.
7. Demo metrics block (`SHOW_DEMO_METRICS = true` in brand.ts) — confirm with owner whether these aggregate figures should stay on the public site.
8. `frontend/public/` legacy directory — confirm it's unused and can be removed (root `public/` is the live one).
9. **Search Console (owner-UI action, not repo work):** the GSC HTML verification file is deployed (`public/f6d8623d0af2587029827261961637a7.txt` → served at `https://ebizearn.com/f6d8623d0af2587029827261961637a7.txt`); confirm the property is verified in Search Console, submit `https://ebizearn.com/sitemap.xml`, and check Coverage/Core Web Vitals after the 2026-10-08 SEO sweep deploy.
10. **Blog prerender smoke check** after each deploy: confirm new daily posts appear in `sitemap.xml` and as prerendered `dist/blog/<slug>/index.html` (the build does both automatically; verify on live once).
11. **Backlink strategy — earned via content only (never buy/spam links):**
    - The daily blog engine (3 posts/day) is the link magnet: keep publishing honest, citable guides (scam-awareness, payout-method explainers, platform-policy changes) that other sites naturally reference.
    - Digital PR angle: trust & safety (fraud prevention, escrowed budgets, AI-verified proof) is the newsworthy differentiator for creator-economy/fintech press.
    - Legitimate listings only: real startup/marketplace directories with editorial review.
    - Partner links: businesses running campaigns and contributors sharing referral pages link back organically.
    - Forbidden: paid links, link farms, PBNs, spam comments, fake reviews/ratings — never.
