import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EBizLogo } from '../common/EBizLogo';
import { AppFooter } from '../common/AppFooter';
import type { UserRole } from '../../types';
import { toast } from '../../utils/toast';
import { useHideChatWidget } from '../../utils/useHideChatWidget';
import { prefetchWhenIdle, preloadAuthPages } from '../../routes/prefetch';

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
  const [imgLoaded, setImgLoaded] = useState(false);

  // The floating live-chat launcher would sit on top of the form buttons.
  useHideChatWidget(true);

  // Warm every auth page chunk + artwork so login ⇄ register switches are
  // instant — no route loader overlay, no late image pop.
  useEffect(() => {
    prefetchWhenIdle(preloadAuthPages);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col lg:h-screen lg:grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_1fr] lg:overflow-hidden dark:bg-[#0B0F19]">
      {/* ── Artwork side ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[260px] sm:min-h-[300px] lg:min-h-0 lg:h-screen bg-[#07182F]">
        <img
          src={image}
          alt={imageAlt}
          // Fades in over the brand navy once decoded — never a white flash.
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0 && !imgLoaded) setImgLoaded(true);
          }}
          onLoad={() => setImgLoaded(true)}
          fetchPriority="high"
          decoding="async"
          className={`auth-art-img ${imgLoaded ? 'is-loaded' : ''} absolute inset-0 w-full h-full object-cover ${midnight ? 'brightness-[0.62] contrast-[1.08] saturate-[0.85]' : ''}`}
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

        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-8 xl:p-10 min-h-[inherit]">
          <Link to="/" aria-label="eBizEarn home" className="inline-flex w-fit">
            <EBizLogo variant="dark" size="md" subtitleText="ebizearn.com" />
          </Link>

          <div className="mt-8 lg:mt-0 max-w-xl">
            <div className="mb-3 xl:mb-4">{badge}</div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.4rem] xl:text-[2.85rem] font-black tracking-tight text-white leading-[1.08]">
              {headline}
            </h1>
            <p className="mt-3 text-[15px] xl:text-base text-slate-200 leading-relaxed max-w-lg">{subtext}</p>

            <ul className="mt-5 xl:mt-6 hidden sm:grid sm:grid-cols-3 gap-3">
              {bullets.map((b) => {
                const Icon = b.icon;
                return (
                  <li
                    key={b.title}
                    className={`rounded-2xl backdrop-blur-md border p-3 xl:p-4 ${
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
      {/* Scroll container starts at the top; the form is centred with auto
          margins (not justify-center), so a form taller than the screen can
          never be pushed above the visible area and clipped. */}
      <div className="flex-1 flex flex-col items-center bg-white dark:bg-[#0B0F19] px-5 sm:px-8 py-6 lg:h-screen lg:py-4 short:py-2 lg:overflow-y-auto transition-colors">
        <div className="w-full max-w-[440px] my-auto min-w-0 py-2 short:py-1">{children}</div>
        {/* On short laptop screens the footer is dropped so the whole form
            fits one screen (legal links stay reachable from the form). */}
        <div className="w-full max-w-[440px] pt-3 short:hidden">
          <AppFooter compact />
        </div>
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

/** Small labeled divider (e.g. "Continue with email") matching the "OR" divider style. */
export const AuthMethodDivider: React.FC<{ label: string; className?: string }> = ({
  label,
  className = '',
}) => (
  <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
    <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 whitespace-nowrap">
      {label}
    </span>
    <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
  </div>
);

interface AuthFieldProps {
  id: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
}

/** Compact form field wrapper: visible label, input, inline hint / error. */
export const AuthField: React.FC<AuthFieldProps> = ({ id, label, error, children, hint, action }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-700 dark:text-gray-300">
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && !error && <p className="mt-1 text-[11px] text-slate-500 dark:text-gray-400">{hint}</p>}
    {error && (
      <p className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
      </p>
    )}
  </div>
);

/** 44px tall (still a comfortable touch target), 15px text. */
export const authInputClass =
  'w-full h-11 px-3.5 text-[15px] text-slate-900 dark:text-gray-100 bg-slate-50/60 dark:bg-[#0C1322] border border-slate-200 dark:border-white/10 rounded-xl placeholder:text-slate-400 dark:placeholder:text-gray-500 placeholder:text-[14px] focus:outline-none focus:bg-white dark:focus:bg-[#0C1322] focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/12 transition-all';

/**
 * Page-level error → top toast (no inline banner pushing the form down).
 * Fires whenever a new message is shown.
 */
export const AuthError: React.FC<{ message: string }> = ({ message }) => {
  useEffect(() => {
    if (message) toast.error(message);
  }, [message]);
  return null;
};

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
    className={`w-full h-11 px-6 text-white font-bold text-[15px] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait ${className}`}
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
