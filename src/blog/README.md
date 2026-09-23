# eBizEarn Blog — Writer's Guide

## How to add a post

1. Create a new file in `src/blog/posts/`, e.g. `how-to-earn-on-instagram.ts`.
2. Export exactly one thing: `export const post: BlogPost = { ... };`
3. That's it — the file is auto-discovered by `import.meta.glob('./posts/*.ts')`.
   **Do not create an index file**; parallel writers must never touch a shared file.

## The contract (`src/blog/types.ts`)

```ts
import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'how-to-earn-on-instagram',            // kebab-case, UNIQUE across all posts
  title: 'How to Earn on Instagram With Verified Social Tasks (58 chars)',
  excerpt: 'Learn how verified Instagram tasks work on eBizEarn: what brands ask for, how proof is checked, and how rewards reach your wallet. (156 chars)',
  category: 'Instagram',                      // one of the 9 allowed categories below
  tags: ['instagram', 'tasks', 'beginners'],  // 3–6 lowercase tags
  author: 'eBizEarn Team',
  publishedAt: '2026-09-23',                  // YYYY-MM-DD
  updatedAt: '2026-09-23',                   // YYYY-MM-DD — bump when you edit
  readingMinutes: 6,
  featured: true,                             // OPTIONAL — at most one post should be featured
  heroImage: '/images/blog/how-to-earn-on-instagram.jpg', // OPTIONAL, under /images/blog/
  content: [
    { type: 'intro', text: '...' },            // lead paragraph (larger type)
    { type: 'h2', text: 'How tasks work' },    // becomes a TOC entry (anchor-linked)
    { type: 'h3', text: 'Step details' },
    { type: 'p', text: '...' },
    { type: 'list', items: ['one', 'two'] },   // bulleted list
    { type: 'steps', items: ['one', 'two'] },  // numbered steps
    { type: 'quote', text: '...', cite: '...' }, // cite is optional
    { type: 'callout', title: 'Note', text: '...' },
    { type: 'faq', items: [{ q: '...', a: '...' }] }, // rendered as accordion + FAQPage schema
    { type: 'cta', heading: '...', text: '...', buttonText: 'Start earning', buttonHref: '/signup' },
  ],
};
```

## Allowed categories

`'Getting Started'` · `'Instagram'` · `'TikTok'` · `'YouTube'` · `'Facebook'` ·
`'Referrals'` · `'Payments & Withdrawals'` · `'Safety'` · `'UAE'`

## Field rules

| Field | Rule |
|---|---|
| `slug` | kebab-case, unique — it becomes the URL `/blog/<slug>` and the canonical |
| `title` | 50–60 characters |
| `excerpt` | 140–160 characters; used as the meta description (keep it honest) |
| `tags` | 3–6 lowercase tags; used for related posts |
| `heroImage` | Optional. Path under `/images/blog/`. If omitted, a premium gradient hero renders automatically — never a broken image |

## Honest-content rules (non-negotiable)

- **No fabricated statistics** — no invented user counts, payout totals, or "X% of users earn…".
- **No earnings claims** — describe *how* rewards and payouts work; never promise amounts,
  rankings, or that anyone "will" earn anything.
- **No "rank #1" / "best" promises** about Google, app stores, or competitors.
- Earnings are never guaranteed — say so plainly where rewards are discussed.

## In-post CTAs

Point internal CTA buttons at real routes only: `/earn`, `/how-it-works`,
`/faq`, `/signup` (redirects to the contributor registration flow).
