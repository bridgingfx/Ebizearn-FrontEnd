import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EBizLogo } from '../common/EBizLogo';
import type { UserRole } from '../../types';

/** Post-login landing per role — shared by every portal auth page. */
export const roleRoute: Record<UserRole, string> = {
  contributor: '/app',
  business: '/business',
  moderator: '/admin',
  admin: '/admin',
  superadmin: '/admin/super',
};export interface AuthBullet {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}

interface AuthSplitLayoutProps {
  image: string;
  imageAlt: string;
  /** Portal label above the headline — pass a <PortalBanner/> for the prominent glass banner, or an <AuthBadge/> pill. */
  badge: React.ReactNode;
  headline: React.ReactNode;
  subtext: string;
  bullets: AuthBullet[];
  /** Accent color used for bullets / highlights on the image side. */
  accentClass?: string;
  /**
   * Artwork treatment: 'default' is the standard photographic panel;
   * 'midnight' is a deeper, moodier dark treatment with a gold glow —
   * used to visually distinguish the business signup portal.
   */
  artworkTheme?: 'default' | 'midnight';
  children: React.ReactNode;
}

/**
 * Apple-caliber split-screen auth shell: HD photographic artwork on one
 * side, a clean white form column on the other. Readable for all ages —
 * 16px+ body text, explicit labels, 44px+ touch targets.
 */
export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  image,
  imageAlt,
  badge,
  headline,
  subtext,
  bullets,
  accentClass = 'text-[#20C4E8]',
  artworkTheme = 'default',
  children,
}) => {
  const midnight = artworkTheme === 'midnight';
  return (
    <div className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr] dark:bg-[#0B0F19]">
      {/* ── Artwork side ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[300px] sm:min-h-[340px] lg:min-h-screen">
        <img
          src={image}
          alt={imageAlt}
          className={`absolute inset-0 w-full h-full object-cover ${midnight ? 'brightness-[0.62] contrast-[1.08] saturate-[0.85]' : ''}`}
          draggable={false}
        />
        {/* Readability gradient */}
        {midnight ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#040F1E] via-[#040F1E]/85 to-[#040F1E]/35" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/12 via-transparent to-[#7257FF]/15" />
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-[#07182F]/95 via-[#07182F]/45 to-[#07182F]/10 lg:bg-gradient-to-t lg:from-[#07182F]/95 lg:via-[#07182F]/40 lg:to-transparent" />
        )}

        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-[inherit]">
          <Link to="/" aria-label="eBizEarn home" className="inline-flex w-fit">
            <EBizLogo variant="dark" size="md" subtitleText="ebizearn.com" />
          </Link>

          <div className="mt-10 lg:mt-0 max-w-xl">
            <div className="mb-6">{badge}</div>
            <h1 className="text-3xl sm:text-4xl xl:text-[3.4rem] font-black tracking-tight text-white leading-[1.08]">
              {headline}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-lg">{subtext}</p>

            <ul className="mt-8 hidden sm:grid sm:grid-cols-3 gap-4">
              {bullets.map((b) => {
                const Icon = b.icon;
                return (
                  <li
                    key={b.title}
                    className={`rounded-2xl backdrop-blur-md border p-4 ${
                      midnight
                        ? 'bg-black/45 border-[#D4AF37]/25 shadow-[0_8px_28px_rgba(0,0,0,0.45)]'
                        : 'bg-white/10 border-white/15'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${accentClass}`} />
                    <p className="mt-2 text-sm font-extrabold text-white">{b.title}</p>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">{b.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0B0F19] px-5 sm:px-10 py-10 lg:py-14 transition-colors">
        <div className="w-full max-w-[430px]">{children}</div>
      </div>
    </div>
  );
};

/** AI neural-network glyph — the portal banner's signature icon (inline SVG, not an emoji). */
const PortalAIIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="4.5" cy="5.5" r="1.9" />
    <circle cx="19.5" cy="5.5" r="1.9" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" opacity="0.95" />
    <circle cx="4.5" cy="18.5" r="1.9" />
    <circle cx="19.5" cy="18.5" r="1.9" />
    <path d="M6.1 6.5 10 10.4M17.9 6.5 14 10.4M6.1 17.5 10 13.6M17.9 17.5 14 13.6" />
  </svg>
);

/**
 * Prominent full-width glassmorphism portal banner for the photographic
 * login pages, replacing the old subtle pill. Wide translucent band with a
 * slow shimmer sweep, an AI-style neural-network icon, and wide-tracked
 * uppercase typography. Shimmer animation is disabled under
 * prefers-reduced-motion (see index.css).
 */
export const PortalBanner: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <div
    className={`relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/25 bg-white/10 px-5 py-4 backdrop-blur-xl shadow-[0_10px_36px_rgba(0,0,0,0.28)] ${className}`}
    role="presentation"
  >
    <span aria-hidden="true" className="portal-banner-shimmer" />
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] text-white shadow-lg shadow-blue-500/30">
      <PortalAIIcon className="h-5 w-5" />
    </span>
    <span className="relative text-sm sm:text-[0.95rem] font-extrabold uppercase tracking-[0.3em] text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">
      {label}
    </span>
    <span
      aria-hidden="true"
      className="relative ml-auto hidden h-px w-24 shrink-0 bg-gradient-to-r from-transparent via-white/50 to-transparent sm:block"
    />
  </div>
);

/** Pill badge used above the auth headline. */
export const AuthBadge: React.FC<{ icon: React.ReactNode; label: string; className?: string }> = ({
  icon,
  label,
  className = 'bg-white/10 border-white/20 text-white',
}) => (
  <span
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-extrabold uppercase tracking-widest backdrop-blur-md ${className}`}
  >
    {icon}
    {label}
  </span>
);

interface AuthFieldProps {
  id: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
}

/** Big, obvious form field wrapper: visible label, roomy input, inline error. */
export const AuthField: React.FC<AuthFieldProps> = ({ id, label, error, children, hint, action }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label htmlFor={id} className="block text-sm font-bold text-slate-800 dark:text-gray-200">
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-400">{hint}</p>}
    {error && (
      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1" role="alert">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
      </p>
    )}
  </div>
);

export const authInputClass =
  'w-full min-h-[52px] px-4 text-base text-slate-900 dark:text-gray-100 bg-white dark:bg-[#0C1322] border-2 border-slate-200 dark:border-white/10 rounded-2xl placeholder:text-slate-400 dark:placeholder:text-gray-500 placeholder:text-base focus:outline-none focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/15 transition-all';

export const AuthError: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium rounded-2xl flex items-start gap-2.5"
    role="alert"
  >
    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

interface AuthSubmitButtonProps {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  loading,
  loadingLabel,
  children,
  className = 'bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 shadow-lg shadow-blue-500/25',
}) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full min-h-[54px] px-6 text-white font-extrabold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait ${className}`}
  >
    {loading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{loadingLabel}</span>
      </>
    ) : (
      children
    )}
  </button>
);
