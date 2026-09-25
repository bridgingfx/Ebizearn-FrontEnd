import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileText, Lock, Cookie, AlertTriangle, Mail, Gavel } from 'lucide-react';

export type LegalDocKey = 'terms' | 'privacy' | 'cookies' | 'disclaimer';

const DOCS: { key: LegalDocKey; label: string; path: string; icon: React.ElementType }[] = [
  { key: 'terms', label: 'Terms of Service', path: '/terms', icon: FileText },
  { key: 'privacy', label: 'Privacy Policy', path: '/privacy', icon: Lock },
  { key: 'cookies', label: 'Cookie Policy', path: '/cookies', icon: Cookie },
  { key: 'disclaimer', label: 'Disclaimer', path: '/disclaimer', icon: AlertTriangle },
];

interface LegalShellProps {
  doc: LegalDocKey;
  badge: string;
  title: string;
  tagline: string;
  updated: string;
  children: React.ReactNode;
}

/** Numbered section block used inside legal documents. */
export const LegalSection: React.FC<{ n: string; title: string; children: React.ReactNode }> = ({
  n,
  title,
  children,
}) => (
  <div className="space-y-2">
    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
      {n}. {title}
    </h2>
    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2.5">
      {children}
    </div>
  </div>
);

/**
 * Shared layout shell for the full legal documents.
 * Matches the site's design system: dark-navy hero band, white card on light
 * background / glass-dark card in dark mode, Apple system font stack.
 */
export const LegalShell: React.FC<LegalShellProps> = ({
  doc,
  badge,
  title,
  tagline,
  updated,
  children,
}) => {
  return (
    <div className="font-sans">
      {/* Hero band */}
      <section className="bg-[#07182F] text-white pt-24 pb-12 sm:pt-28 sm:pb-14 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#20C4E8]">
            <Scale className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">{tagline}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300">
              <Gavel className="w-3 h-3 text-[#20C4E8]" />
              Governed by Georgian law
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300">
              Last updated: {updated}
            </span>
          </div>
        </div>
      </section>

      {/* Document body */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-10 border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-8">
            {children}
          </div>

          {/* Cross-links to the other legal documents */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DOCS.filter((d) => d.key !== doc).map((d) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.key}
                  to={d.path}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 hover:border-[#168BFF]/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#07182F]/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#168BFF]" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#168BFF] transition-colors">
                    {d.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Legal-advice & contact note */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This document is provided for transparency and is not legal advice. Questions about how
              these policies apply to you should be directed to{' '}
              <a
                href="mailto:support@ebizearn.com"
                className="font-bold text-[#168BFF] hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3 h-3" /> support@ebizearn.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
