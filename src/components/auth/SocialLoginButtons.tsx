import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { LoginPortal } from '../../api';
import { authApi } from '../../api';
import { GoogleLogo } from '../common/PlatformIcons';
import { navigateAfterLogin } from './EmailVerification';
import { setPendingPhoneRole } from '../../utils/pendingAuth';

/* ------------------------------------------------------------------ */
/* Script loading                                                      */
/* ------------------------------------------------------------------ */

const loadedScripts = new Map<string, Promise<void>>();

/** GIS must be initialize()d once per page; the callback forwards here. */
let initializedClientId: string | null = null;
let activeCredentialHandler: ((response: GsiCredentialResponse) => void) | null = null;

function loadScript(src: string): Promise<void> {
  if (!loadedScripts.has(src)) {
    loadedScripts.set(
      src,
      new Promise<void>((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.defer = true;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Could not load ${src}`));
        document.head.appendChild(el);
      })
    );
  }
  return loadedScripts.get(src)!;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface SocialLoginButtonsProps {
  portal?: LoginPortal;
  /** Slight copy tweak for registration pages. */
  mode?: 'login' | 'register';
}

/* ------------------------------------------------------------------ */
/* Minimal vendor-SDK typings (no `any` so lint stays clean)           */
/* ------------------------------------------------------------------ */

interface GsiCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GsiIdConfiguration {
  client_id: string;
  callback: (response: GsiCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  /** UX flow of the rendered Sign In With Google button. Default is 'popup'. */
  ux_mode?: 'popup' | 'redirect';
  /** Use the browser-native FedCM account chooser on Chrome (no popup window). */
  use_fedcm_for_button?: boolean;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
  click_listener?: () => void;
}

interface GoogleGsiSdk {
  accounts: {
    id: {
      initialize(opts: GsiIdConfiguration): void;
      renderButton(parent: HTMLElement, opts: GsiButtonConfiguration): void;
    };
  };
}

/**
 * Official Google sign-in button (single social option).
 *
 * Flow: GIS rendered button (ux_mode 'popup') → compact "Choose an account"
 * chooser (browser-native FedCM dialog on Chrome, small popup window
 * elsewhere) → ID token → POST /api/v1/auth/social/google { id_token } →
 * Sanctum token stored exactly like a password login → redirect to the
 * role dashboard.
 *
 * The previous implementation called `google.accounts.id.prompt()` (One Tap)
 * on click. One Tap is unaffected by `ux_mode`, and when it cannot render
 * inline Google falls back to opening the chooser in a popup window — which
 * surfaces as a new tab on mobile Chrome. The rendered button with popup UX
 * is the standard flow and never leaves the page.
 *
 * Every failure mode (SDK not configured, script failed to load, backend
 * 4xx/5xx, network down) surfaces a clear inline message — the button never
 * crashes and never leaves the page in a dead state.
 */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  portal,
  mode = 'login',
}) => {
  const { socialLogin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  /** True once Google's button iframe has painted — until then a
   *  same-size placeholder shows, so nothing flashes or jumps. */
  const [gisReady, setGisReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(0);
  const setMessage = (m: string | null) => {
    if (m) toast.error(m);
  };

  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();

  /* finish() via ref so the GIS callback never captures stale state. */
  const finishRef = useRef<(idToken: string) => Promise<void>>(async () => {});
  useEffect(() => {
    finishRef.current = async (idToken: string) => {
      setSigningIn(true);
      try {
        const role = await socialLogin('google', idToken, portal);
        if (role) {
          // Registration flow only: if the fresh Google account has no phone
          // on file, show the ONE required phone step before continuing.
          // (Google already verified the email — no email OTP here.)
          if (mode === 'register') {
            const me = await authApi.me().catch(() => null);
            const latestUser = me?.data?.user;
            // users.phone is the source of truth (E.164); profile.phone is a
            // legacy mirror — check both so the gate never misfires.
            const hasPhone = !!(latestUser?.phone || latestUser?.profile?.phone);
            if (latestUser && !hasPhone) {
              setPendingPhoneRole(role);
              navigate('/setup-phone', { replace: true });
              return;
            }
          }
          // Same post-auth routing as password login: unverified accounts
          // land on the email-verification gate, verified users on the dashboard.
          await navigateAfterLogin(navigate, role);
        } else {
          setMessage('Sign-in did not complete. Please try again.');
        }
      } catch (err) {
        setMessage(
          err instanceof Error
            ? err.message
            : 'Social sign-in failed. Please try again or use email instead.'
        );
      } finally {
        setSigningIn(false);
      }
    };
  }, [socialLogin, portal, navigate, mode]);

  const handleCredential = useCallback((response: GsiCredentialResponse) => {
    if (response?.credential) {
      void finishRef.current(response.credential);
    } else {
      setMessage('Google did not return a sign-in token. Please try again.');
    }
  }, []);

  /* Route the (once-registered) GIS callback to this instance's handler. */
  useEffect(() => {
    activeCredentialHandler = handleCredential;
  }, [handleCredential]);

  /* Render (and re-render on theme/mode/width change) the GIS button. */
  useEffect(() => {
    if (!clientId) return;
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let resizeTimer: number | undefined;
    let revealTimer: number | undefined;

    const measure = () => Math.min(400, Math.max(200, Math.floor(container.clientWidth) || 320));
    // Record the width we'll render at BEFORE the async script load, so the
    // ResizeObserver's initial callback doesn't see 0 and render a second
    // time (that double render was the visible Google-button flash).
    lastWidthRef.current = measure();

    const render = async () => {
      try {
        await loadScript('https://accounts.google.com/gsi/client');
        if (cancelled) return;
        const google = (window as unknown as { google?: GoogleGsiSdk }).google;
        if (!google?.accounts?.id) throw new Error('Google SDK unavailable');

        // initialize() once per page load; the callback forwards to whichever
        // button instance is mounted (GIS warns on repeated initialize).
        if (initializedClientId !== clientId) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: GsiCredentialResponse) => activeCredentialHandler?.(response),
            // Popup UX: compact "Choose an account" chooser, never a new tab.
            // (ux_mode has no effect on One Tap — this is why we use the
            // rendered button instead of accounts.id.prompt().)
            ux_mode: 'popup',
            auto_select: false,
            cancel_on_tap_outside: true,
            context: mode === 'register' ? 'signup' : 'signin',
            // Browser-native chooser dialog on Chrome (desktop M125+, Android
            // M128+): no popup window involved, so it cannot be popup-blocked.
            use_fedcm_for_button: true,
          });
          initializedClientId = clientId;
        }

        const width = measure();
        lastWidthRef.current = width;
        // Placeholder covers the swap on re-render (theme / width change).
        setGisReady(false);
        window.clearTimeout(revealTimer);
        // renderButton appends; clear first so re-renders don't duplicate.
        container.innerHTML = '';
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width,
          // Match the site language instead of the browser's (otherwise the
          // button can render in e.g. Arabic on an English page).
          locale: 'en',
        });

        // Reveal once Google's iframe has loaded (fallback after 1.5s).
        const iframe = container.querySelector('iframe');
        const reveal = () => !cancelled && setGisReady(true);
        if (iframe) iframe.addEventListener('load', () => window.setTimeout(reveal, 60), { once: true });
        revealTimer = window.setTimeout(reveal, 1500);
      } catch {
        if (!cancelled) {
          setMessage('Google sign-in could not be loaded. Please check your connection or use email sign-in.');
        }
      }
    };

    void render();

    // Re-render only when the container width actually changes (orientation
    // change etc.), debounced; the fixed pixel width we pass GIS means the
    // render itself never triggers the observer.
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (cancelled || !containerRef.current) return;
        if (Math.abs(measure() - lastWidthRef.current) > 8) void render();
      }, 250);
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      window.clearTimeout(revealTimer);
      observer.disconnect();
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, theme, mode]);

  const verb = mode === 'register' ? 'Sign up' : 'Continue';

  /** Same look/size as Google's pill button (44px). */
  const placeholder = (
    <span
      className={`w-full h-11 rounded-full border flex items-center justify-center gap-2.5 ${
        theme === 'dark' ? 'bg-[#202124] border-[#202124] text-white' : 'bg-white border-[#dadce0] text-[#3c4043]'
      }`}
    >
      <GoogleLogo className="w-[18px] h-[18px] shrink-0" />
      <span className="text-[14px] font-medium whitespace-nowrap">{verb} with Google</span>
    </span>
  );

  /* Fail-closed placeholder when no client ID is configured (dev only). */
  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() =>
          setMessage('Google sign-in is not enabled for this environment yet. Please continue with your email and password.')
        }
        className="w-full rounded-full hover:brightness-[0.98] transition"
        aria-label={`${verb} with Google`}
      >
        {placeholder}
      </button>
    );
  }

  return (
    <div>
      {/* Fixed 44px slot: a Google-styled placeholder shows until the real
          GIS button iframe has painted, then the two crossfade — no blank
          gap, no layout jump, no double render. Clicking the real button
          opens the compact "Choose an account" chooser — never a new tab. */}
      <div className="relative w-full h-11" role="group" aria-label={`${verb} with Google`}>
        {/* Google caps its button at 400px — size the placeholder the same
            so the crossfade is seamless. */}
        <div
          aria-hidden="true"
          className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] transition-opacity duration-200 ${gisReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {placeholder}
        </div>
        <div
          ref={containerRef}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${gisReady ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      {signingIn && (
        <div className="mt-2 flex items-center justify-center gap-2 text-[13px] text-slate-500 dark:text-gray-400" role="status">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Signing you in…</span>
        </div>
      )}
    </div>
  );
};
