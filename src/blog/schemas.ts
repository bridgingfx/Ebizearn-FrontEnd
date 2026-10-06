/**
 * eBizEarn Blog — JSON-LD schema builders.
 *
 * Honest schemas only: no ratings, reviews, or invented statistics.
 * FAQPage is built from the same FAQ blocks rendered in the article body.
 */
import { SITE_URL, faqPageSchema } from '../seo/seo';
import type { BlogPost } from './types';

export function articleSchema(post: BlogPost): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'eBizEarn',
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/ebiz-logo.png` },
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    ...(post.heroImage
      ? { image: `${SITE_URL}${post.heroImage}` }
      : {}),
  };
}

/** BreadcrumbList schema for article pages (matches the visible breadcrumb). */
export function breadcrumbSchema(post: BlogPost): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}

export function articleSchemas(post: BlogPost): Record<string, unknown>[] {
  const faqs = post.content.flatMap((b) => (b.type === 'faq' ? b.items : []));
  const schemas: Record<string, unknown>[] = [articleSchema(post), breadcrumbSchema(post)];
  if (faqs.length > 0) schemas.push(faqPageSchema(faqs));
  return schemas;
}
