import React from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  /** When omitted (or on the last crumb) the label renders as plain text. */
  to?: string;
}

interface PageBreadcrumbProps {
  trail: Crumb[];
  tone?: 'onDark' | 'onLight';
  align?: 'left' | 'center';
}

/**
 * Subtle visible breadcrumb trail (e.g. Home / Tasks).
 *
 * This is the on-page counterpart of the BreadcrumbList JSON-LD attached to
 * public pages in SEO_BY_PATH (src/seo/seo.ts) — the schema mirrors exactly
 * what a visitor sees, nothing invented.
 */
export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  trail,
  tone = 'onLight',
  align = 'center',
}) => {
  const text = tone === 'onDark' ? 'text-white/55' : 'text-gray-400 dark:text-gray-500';
  const sep = tone === 'onDark' ? 'text-white/25' : 'text-gray-300 dark:text-gray-600';
  const linkCls =
    tone === 'onDark'
      ? 'hover:text-white'
      : 'hover:text-[#168BFF] dark:hover:text-blue-300';
  const current =
    tone === 'onDark' ? 'text-white/85' : 'text-gray-600 dark:text-gray-300';

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex ${align === 'center' ? 'justify-center' : 'justify-start'}`}
    >
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium ${text}`}>
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <React.Fragment key={crumb.label}>
              {i > 0 && (
                <li aria-hidden="true" className={sep}>
                  /
                </li>
              )}
              <li>
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className={`transition-colors ${linkCls}`}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className={current}>
                    {crumb.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
