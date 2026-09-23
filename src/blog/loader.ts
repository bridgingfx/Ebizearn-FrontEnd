/**
 * eBizEarn Blog — post discovery + helpers.
 *
 * Posts are auto-discovered from `src/blog/posts/*.ts` (each exporting
 * `export const post: BlogPost`) via Vite's import.meta.glob. Adding a file
 * is all it takes — no index to update. With zero post files, every helper
 * below degrades gracefully to empty results.
 */
import type { BlogPost } from './types';

const modules = import.meta.glob<{ post: BlogPost }>('./posts/*.ts', { eager: true });

/** All posts, newest first. */
export const blogPosts: BlogPost[] = Object.values(modules)
  .map((m) => m.post)
  .filter((p): p is BlogPost => !!p && typeof p.slug === 'string')
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** Post shown in the index hero: first `featured` post, else the newest. */
export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find((p) => p.featured) ?? blogPosts[0];
}

export function getAllCategories(): string[] {
  const set = new Set<string>();
  for (const p of blogPosts) set.add(p.category);
  return [...set];
}

export function getAllTags(): string[] {
  const counts = new Map<string, number>();
  for (const p of blogPosts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/**
 * Related posts: score by shared tags (2 pts each) + same category (1 pt),
 * excluding the post itself. Top 3.
 */
export function getRelatedPosts(post: BlogPost, count = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => post.tags.includes(t)).length;
      const score = sharedTags * 2 + (p.category === post.category ? 1 : 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.p);
}

export function getAdjacentPosts(post: BlogPost): { prev: BlogPost | undefined; next: BlogPost | undefined } {
  const idx = blogPosts.findIndex((p) => p.slug === post.slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  // blogPosts is newest-first: next = older, prev = newer.
  return { prev: blogPosts[idx - 1], next: blogPosts[idx + 1] };
}

/** "Sep 23, 2026" */
export function formatBlogDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** URL-safe anchor id for h2 blocks (used by the table of contents). */
export function blockAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
