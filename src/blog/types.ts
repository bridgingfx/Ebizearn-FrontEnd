/**
 * eBizEarn Blog — post data contract.
 *
 * Writers: each post lives in its own file under `src/blog/posts/*.ts`
 * exporting `export const post: BlogPost`. Files are auto-discovered via
 * `import.meta.glob('./posts/*.ts')` — NO shared index file (avoids merge
 * conflicts when writers work in parallel). See `src/blog/README.md`.
 *
 * CONTENT RULES (hard):
 * - No fabricated statistics, earnings claims, or ranking promises.
 * - Honest tone: earnings vary, are never guaranteed, tasks are verified.
 */

export type ContentBlock =
  | { type: 'intro'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'callout'; title: string; text: string }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'cta'; heading: string; text: string; buttonText: string; buttonHref: string };

export type BlogCategory =
  | 'Getting Started'
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'Facebook'
  | 'Referrals'
  | 'Payments & Withdrawals'
  | 'Safety'
  | 'UAE';

export interface BlogPost {
  /** kebab-case, unique across all posts — used in /blog/:slug and canonicals. */
  slug: string;
  /** 50–60 characters. */
  title: string;
  /** 140–160 characters. Used as the meta description + OG/Twitter description. */
  excerpt: string;
  category: BlogCategory;
  /** 3–6 lowercase tags, e.g. ['instagram', 'tasks', 'beginners']. */
  tags: string[];
  /** Author display name. */
  author: string;
  /** ISO date YYYY-MM-DD. */
  publishedAt: string;
  /** ISO date YYYY-MM-DD. */
  updatedAt: string;
  /** Whole minutes of reading time. */
  readingMinutes: number;
  /** Shown in the index hero. Omit unless this is THE lead post. */
  featured?: boolean;
  /**
   * Optional hero image path under /images/blog/ (e.g. '/images/blog/slug.jpg').
   * When absent, a premium gradient/glass hero is rendered — never a broken image.
   */
  heroImage?: string;
  content: ContentBlock[];
}
