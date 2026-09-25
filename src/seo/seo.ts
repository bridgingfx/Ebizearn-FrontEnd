/**
 * Central SEO configuration for eBizEarn (ebizearn.com).
 *
 * SPA head management: `RouteSeo` (components/common/Seo.tsx) reads this map
 * on every route change and updates document title, meta description,
 * canonical, Open Graph, Twitter Card, robots, and JSON-LD.
 *
 * Rules:
 * - One entry per public/auth route. Private portals (/app/*, /business/*,
 *   /admin/*) fall back to noindex via `isPrivatePath`.
 * - Alias routes carry a canonical pointing at the primary route.
 * - JSON-LD is honest: no ratings, reviews, or invented statistics.
 */
import { earnFaqs, homeFaqs, faqPageFaqs, type FaqItem } from './faqData';
import { blogPosts } from '../blog/loader';

export const SITE_URL = 'https://ebizearn.com';
export const SITE_NAME = 'eBizEarn';
export const OG_IMAGE = `${SITE_URL}/images/og-image.png`;
export const OG_IMAGE_ALT = 'eBizEarn — Complete tasks. Earn rewards. Free to join.';

export interface PageSeo {
  title: string;
  description: string;
  /** Canonical path (defaults to the route path itself). */
  canonical?: string;
  ogType?: 'website' | 'article';
  /** Override the default og:image / twitter:image (absolute URL). */
  ogImage?: string;
  /** Alt text for a custom og:image. */
  ogImageAlt?: string;
  /** When true: robots noindex,nofollow (auth + private portals). */
  noindex?: boolean;
  /** JSON-LD schema objects injected for this route. */
  jsonLd?: Record<string, unknown>[];
}

const BASE_DESCRIPTION =
  'eBizEarn is a social-media task marketplace. Complete verified tasks for real brands, earn cash rewards, and withdraw from $50. 100% free to join.';

/** Honest Organization schema — no fabricated ratings, reviews, or stats. */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'eBizEarn',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/ebiz-logo.png`,
    description: BASE_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@ebizearn.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'Arabic'],
    },
  };
}

export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'eBizEarn',
    url: `${SITE_URL}/`,
    description: BASE_DESCRIPTION,
  };
}

/** Blog (listing) schema — honest, no ratings/reviews/invented stats. */
export function blogListingSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'eBizEarn Blog',
    url: `${SITE_URL}/blog`,
    description:
      'Guides and explainers from eBizEarn: how social-media tasks work, how rewards and payouts work, and how to stay safe online.',
    blogPost: blogPosts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      author: { '@type': 'Person', name: p.author },
    })),
  };
}

/** FAQPage schema built from the same Q&A rendered on the page. */
export function faqPageSchema(faqs: FaqItem[]): Record<string, unknown> {  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export const SEO_BY_PATH: Record<string, PageSeo> = {
  /* ── Public marketing pages ─────────────────────────────────────── */
  '/': {
    title: 'eBizEarn — Complete Social Media Tasks & Earn Real Money | Free to Join',
    description: BASE_DESCRIPTION,
    jsonLd: [organizationSchema(), webSiteSchema(), faqPageSchema(homeFaqs)],
  },
  '/tasks': {
    title: 'Browse Open Tasks — Verified Social Media Gigs | eBizEarn',
    description:
      'Browse the open eBizEarn task marketplace: verified social media tasks from real businesses. Pick a task, complete it on your phone, submit proof, and get paid. Free to join.',
  },
  '/earn': {
    title: 'How Earning Works — Tasks, Rewards & $50 Payouts | eBizEarn',
    description:
      'How earning on eBizEarn works: complete verified social tasks, get rewards credited to your wallet, and withdraw from $50.00 via PayPal, Wise, bank, or mobile money. Free to join.',
    jsonLd: [faqPageSchema(earnFaqs)],
  },
  '/for-businesses': {
    title: 'For Businesses — Launch Verified Social Campaigns | eBizEarn',
    description:
      'Run verified social-media campaigns on eBizEarn: self-serve 6-step campaign wizard, escrowed budgets, AI-verified proof, and real human engagement. Create a corporate account free.',
  },
  '/pricing': {
    title: 'Pricing — Business Campaign Plans | eBizEarn',
    description:
      'eBizEarn business pricing: fund escrowed campaign budgets and pay only for verified completed tasks. See how campaign pricing works for brands.',
    canonical: '/for-businesses',
  },
  '/how-it-works': {
    title: 'How It Works — Pick a Task, Verify, Get Paid | eBizEarn',
    description:
      'How eBizEarn works in three steps: pick a verified task, complete it on your social accounts, submit proof — AI verification credits your wallet in seconds. Free to join.',
  },
  '/about': {
    title: 'About eBizEarn — The Social Task Marketplace | eBizEarn',
    description:
      'About eBizEarn: the social-media task marketplace connecting contributors who complete verified tasks with businesses running promotional campaigns. Based in the UAE, open worldwide.',
  },
  '/faq': {
    title: 'FAQ — Tasks, Earnings & Payouts | eBizEarn',
    description:
      'Frequently asked questions about eBizEarn: is it free, how tasks work, how much you can earn, the $50 withdrawal threshold, verification, and fraud prevention.',
    jsonLd: [faqPageSchema(faqPageFaqs)],
  },
  '/payments': {
    title: 'Payments & Withdrawals FAQ | eBizEarn',
    description:
      'eBizEarn payments explained: wallet crediting after proof verification, $50.00 minimum withdrawal, PayPal, Wise, bank, Revolut, USDT/USDC, and mobile money payouts.',
    canonical: '/faq',
  },
  '/blog': {
    title: 'Blog — Guides on Tasks, Rewards & Payouts | eBizEarn',
    description:
      'The eBizEarn blog: practical guides on how social-media tasks work, how rewards and payouts work, and how to stay safe online. Honest, no hype.',
    jsonLd: [blogListingSchema()],
  },
  '/trust-safety': {
    title: 'Trust & Safety — Verification, Escrow & Fraud Prevention | eBizEarn',
    description:
      'How eBizEarn keeps the marketplace fair: AI-assisted proof verification, duplicate-proof detection, escrowed brand budgets, human appeals, and a strict ban on fake reviews.',
  },
  '/contact': {
    title: 'Contact eBizEarn — Support & Business Inquiries | eBizEarn',
    description:
      'Contact eBizEarn support: contributor help, business and campaign inquiries, and compliance. Reach us at support@ebizearn.com.',
  },
  /* ── Legal ─────────────────────────────────────────────────────── */
  '/terms': {
    title: 'Terms of Service | eBizEarn',
    description:
      'eBizEarn Terms of Service: the rules governing contributors, businesses, and visitors on the eBizEarn task marketplace. Free access for contributors; earnings vary and are never guaranteed.',
  },
  '/privacy': {
    title: 'Privacy Policy | eBizEarn',
    description:
      'eBizEarn Privacy Policy: what data we collect, how we use it, and your rights. We never sell your personal information.',
  },
  '/disclaimer': {
    title: 'Disclaimer | eBizEarn',
    description:
      'eBizEarn disclaimer: what the platform is and is not. Earnings are not guaranteed; content is general information, not legal or financial advice.',
  },
  '/cookies': {
    title: 'Cookie Policy | eBizEarn',
    description:
      'eBizEarn Cookie Policy: which cookies we use, why we use them, and how to manage your cookie preferences.',
  },
  '/legal/terms': {
    title: 'Terms of Service | eBizEarn',
    description: 'eBizEarn Terms of Service: the rules governing use of the eBizEarn task marketplace.',
    canonical: '/terms',
  },
  '/legal/privacy': {
    title: 'Privacy Policy | eBizEarn',
    description: 'eBizEarn Privacy Policy: what data we collect and how we use it.',
    canonical: '/privacy',
  },
  '/legal/cookies': {
    title: 'Cookie Policy | eBizEarn',
    description: 'eBizEarn Cookie Policy: which cookies we use and how to manage them.',
    canonical: '/cookies',
  },
  '/legal/task-policy': {
    title: 'Task Compliance Policy | eBizEarn',
    description:
      'eBizEarn task compliance policy: prohibited campaign practices, including fake reviews, spam, and misleading claims.',
  },
  /* ── Auth (kept out of search indexes) ─────────────────────────── */
  '/login': {
    title: 'Sign In — Contributor Portal | eBizEarn',
    description: 'Sign in to your eBizEarn contributor account to browse tasks, track earnings, and manage withdrawals.',
    noindex: true,
  },
  '/contributor/register': {
    title: 'Create Free Contributor Account | eBizEarn',
    description: 'Create your free eBizEarn contributor account and start completing verified social media tasks for cash rewards.',
    noindex: true,
  },
  '/business/login': {
    title: 'Business Sign In | eBizEarn',
    description: 'Sign in to your eBizEarn business account to manage campaigns, review submissions, and track results.',
    noindex: true,
  },
  '/business/register': {
    title: 'Register Your Business | eBizEarn',
    description: 'Register your business on eBizEarn and launch verified social-media campaigns in minutes.',
    noindex: true,
  },
  '/moderator/login': {
    title: 'Moderator Sign In | eBizEarn',
    description: 'Moderator sign-in for the eBizEarn operations team.',
    noindex: true,
  },
  '/forgot-password': {
    title: 'Forgot Password | eBizEarn',
    description: 'Reset your eBizEarn account password.',
    noindex: true,
  },
  '/reset-password': {
    title: 'Reset Password | eBizEarn',
    description: 'Choose a new password for your eBizEarn account.',
    noindex: true,
  },
  '/verify-email': {
    title: 'Verify Your Email | eBizEarn',
    description: 'Verify your email address to activate your eBizEarn account.',
    noindex: true,
  },
  '/verify-otp': {
    title: 'Verify Your Email | eBizEarn',
    description: 'Enter the 6-digit code we emailed you to activate your eBizEarn account.',
    noindex: true,
  },
  '/setup-phone': {
    title: 'Add Your Phone Number | eBizEarn',
    description: 'Add your mobile number to finish setting up your eBizEarn account.',
    noindex: true,
  },
  '/onboarding': {
    title: 'Complete Your Profile | eBizEarn',
    description: 'Finish setting up your eBizEarn profile to start receiving tasks.',
    noindex: true,
  },
  '/secure-control-panel/login': {
    title: 'Admin Console | eBizEarn',
    description: 'Restricted administrative sign-in.',
    noindex: true,
  },
};

/** Private portals are never indexed: /app/*, /business/* (dashboard), /admin/*. */
export function isPrivatePath(path: string): boolean {
  return (
    path === '/app' ||
    path.startsWith('/app/') ||
    (path === '/business' || path.startsWith('/business/')) ||
    path === '/admin' ||
    path.startsWith('/admin/')
  );
}

export const PRIVATE_SEO: PageSeo = {
  title: 'eBizEarn',
  description: 'eBizEarn member portal.',
  noindex: true,
};
