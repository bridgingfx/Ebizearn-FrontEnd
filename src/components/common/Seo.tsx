import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE,
  OG_IMAGE_ALT,
  SEO_BY_PATH,
  PRIVATE_SEO,
  isPrivatePath,
  type PageSeo,
} from '../../seo/seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(schemas: Record<string, unknown>[]): void {
  const id = 'seo-jsonld';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (schemas.length === 0) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

/**
 * Route-aware head manager for the SPA. Mounted once inside the router in
 * App.tsx; on every navigation it applies the per-route SEO config:
 * document title, meta description, canonical, Open Graph, Twitter Card,
 * robots, and JSON-LD structured data.
 */
export const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    const page: PageSeo | undefined =
      SEO_BY_PATH[path] ?? (isPrivatePath(path) ? PRIVATE_SEO : undefined);
    if (!page) return; // unknown route: leave head untouched

    const canonicalPath = page.canonical ?? path;
    const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;
    const ogUrl = `${SITE_URL}${path === '/' ? '/' : path}`;

    document.title = page.title;
    upsertMeta('name', 'description', page.description);
    upsertMeta('name', 'robots', page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertCanonical(canonicalUrl);

    // Open Graph
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_US');
    upsertMeta('property', 'og:type', page.ogType ?? 'website');
    upsertMeta('property', 'og:title', page.title);
    upsertMeta('property', 'og:description', page.description);
    upsertMeta('property', 'og:url', ogUrl);
    upsertMeta('property', 'og:image', OG_IMAGE);
    upsertMeta('property', 'og:image:alt', OG_IMAGE_ALT);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');

    // Twitter Card
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', page.title);
    upsertMeta('name', 'twitter:description', page.description);
    upsertMeta('name', 'twitter:image', OG_IMAGE);
    upsertMeta('name', 'twitter:image:alt', OG_IMAGE_ALT);

    upsertJsonLd(page.jsonLd ?? []);
  }, [pathname]);

  return null;
};
