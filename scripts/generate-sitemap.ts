/**
 * Generates public/sitemap.xml from the static public routes + every post in
 * src/blog/posts/*.ts (slug + publishedAt/updatedAt extracted with a regex —
 * no import.meta.glob, so plain tsx can run it and the daily content machine
 * never needs to hand-edit the sitemap). Run: npm run sitemap
 * (also runs automatically via `prebuild`, before vite copies public/ → dist/).
 *
 * Executed with tsx (devDependency); not part of `tsc -b`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(REPO, 'src/blog/posts');
const OUT = path.join(REPO, 'public/sitemap.xml');
const SITE = 'https://ebizearn.com';

export interface BlogPostMeta {
  slug: string;
  publishedAt: string;
  updatedAt: string;
}

/**
 * Discovers blog posts by scanning src/blog/posts/*.ts for the top-level
 * `slug:` / `publishedAt:` / `updatedAt:` fields. Shared with the prerender
 * script so both always agree on the post list.
 */
export function discoverBlogPosts(postsDir: string = POSTS_DIR): BlogPostMeta[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.ts')).sort();
  const posts: BlogPostMeta[] = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(postsDir, f), 'utf8');
    // Anchor on line starts so content blocks (e.g. callout titles) can't match.
    const pick = (key: string): string | null => {
      const m = src.match(new RegExp(`^\\s*${key}:\\s*['"]([^'"]+)['"]`, 'm'));
      return m ? m[1] : null;
    };
    const slug = pick('slug');
    const publishedAt = pick('publishedAt');
    if (!slug || !publishedAt) {
      console.warn(`[sitemap] skipping ${f}: missing slug or publishedAt`);
      continue;
    }
    posts.push({ slug, publishedAt, updatedAt: pick('updatedAt') ?? publishedAt });
  }
  return posts;
}

interface StaticRoute {
  path: string;
  changefreq: string;
  priority: string;
}

/** Public, indexable routes. Alias routes (/pricing, /payments) canonicalize
 *  elsewhere and are intentionally excluded. */
const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/tasks', changefreq: 'daily', priority: '0.9' },
  { path: '/earn', changefreq: 'weekly', priority: '0.9' },
  { path: '/for-businesses', changefreq: 'weekly', priority: '0.9' },
  { path: '/how-it-works', changefreq: 'monthly', priority: '0.8' },
  { path: '/faq', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/trust-safety', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/terms', changefreq: 'yearly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.5' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.5' },
  { path: '/cookies', changefreq: 'yearly', priority: '0.5' },
  { path: '/legal/task-policy', changefreq: 'yearly', priority: '0.5' },
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return (
    `  <url>\n` +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

export function buildSitemapXml(today: string): string {
  const entries: string[] = STATIC_ROUTES.map((r) =>
    urlEntry(`${SITE}${r.path}`, today, r.changefreq, r.priority),
  );
  for (const p of discoverBlogPosts()) {
    entries.push(urlEntry(`${SITE}/blog/${p.slug}`, p.updatedAt, 'monthly', '0.6'));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

function main(): void {
  const today = new Date().toISOString().slice(0, 10);
  const xml = buildSitemapXml(today);
  fs.writeFileSync(OUT, xml, 'utf8');
  const count = (xml.match(/<url>/g) ?? []).length;
  console.log(`[sitemap] wrote ${OUT} with ${count} URLs`);
}

// Only run when executed directly (`npm run sitemap`), not when imported
// (the prerender script reuses discoverBlogPosts).
const invokedDirectly =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
