import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiError, type LoginPortal } from '../../api';
import { GoogleLogo, AppleLogo } from '../common/PlatformIcons';
import { navigateAfterLogin } from './EmailVerification';

/* ------------------------------------------------------------------ */
/* Script loading                                                      */
/* ------------------------------------------------------------------ */

const loadedScripts = new Map<string, Promise<void>>();

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

type BusyProvider = 'google' | 'apple' | null;

/* ------------------------------------------------------------------ */
/* Minimal vendor-SDK typings (no `any` so lint stays clean)           */
/* ------------------------------------------------------------------ */

interface GsiMomentNotification {
  isNotDisplayedMoment?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
}

interface GoogleGsiSdk {
  accounts: {
    id: {
      initialize(opts: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }): void;
      prompt(cb: (notification: GsiMomentNotification) => void): void;
    };
  };
}

interface AppleIdSdk {
  auth: {
    init(opts: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }): void;
    signIn(): Promise<{ authorization?: { id_token?: string } }>;
  };
}

/**
 * Official-look Google (white) + Apple (black) sign-in buttons.
 *
 * Flow: provider JS SDK → ID token → POST /api/v1/auth/social/{provider}
 * { id_token } → Sanctum token stored exactly like a password login →
 * redirect to the role dashboard.
 *
 * Every failure mode (SDK not configured, popup blocked, user cancelled,
 * backend 4xx/5xx, network down) surfaces a clear inline message —
 * the buttons never crash and never leave the page in a dead state.
 */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  portal,
  mode = 'login',
}) => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<BusyProvider>(null);
  const [message, setMessage] = useState<string | null>(null);
  const credentialReceived = useRef(false);

  const finish = useCallback(
    async (provider: 'google' | 'apple', idToken: string) => {
      try {
        const role = await socialLogin(provider, idToken, portal);
        if (role) {
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
        setBusy(null);
      }
    },
    [socialLogin, portal, navigate]
  );

  const handleGoogle = useCallback(async () => {
    if (busy) return;
    setMessage(null);
    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
    if (!clientId) {
      setMessage(
        'Google sign-in is not enabled for this environment yet. Please continue with your email and password.'
      );
      return;
    }
    setBusy('google');
    credentialReceived.current = false;
    try {
      await loadScript('https://accounts.google.com/gsi/client');
      const google = (window as unknown as { google?: GoogleGsiSdk }).google;
      if (!google?.accounts?.id) throw new Error('Google SDK unavailable');

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          credentialReceived.current = true;
          if (response?.credential) {
            void finish('google', response.credential);
          } else {
            setBusy(null);
            setMessage('Google did not return a sign-in token. Please try again.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // One Tap prompt (not a popup, so it cannot be "popup-blocked";
      // suppression/cancellation is reported via the moment callback).
      google.accounts.id.prompt((notification: GsiMomentNotification) => {
        try {
          if (notification?.isNotDisplayedMoment?.() || notification?.isSkippedMoment?.()) {
            if (!credentialReceived.current) {
              setBusy(null);
              setMessage(
                'Google sign-in could not start in this browser (it may block third-party sign-in prompts). Please use email sign-in instead.'
              );
            }
          } else if (notification?.isDismissedMoment?.()) {
            if (!credentialReceived.current) {
              setBusy(null);
              setMessage('Google sign-in was closed before completing. Tap the button to try again.');
            }
          }
        } catch {
          /* notification API shape varies; ignore */
        }
      });

      // Safety net: if nothing happens within 60s, release the spinner.
      window.setTimeout(() => {
        if (!credentialReceived.current) {
          setBusy((b) => (b === 'google' ? null : b));
        }
      }, 60000);
    } catch (err) {
      setBusy(null);
      setMessage(
        `Google sign-in failed to start (${getApiError(err, 'network error')}). Please try again or use email sign-in.`
      );
    }
  }, [busy, finish]);

  const handleApple = useCallback(async () => {
    if (busy) return;
    setMessage(null);
    const clientId = (import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined)?.trim();
    if (!clientId) {
      setMessage(
        'Apple sign-in is not enabled for this environment yet. Please continue with your email and password.'
      );
      return;
    }
    setBusy('apple');
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
      const AppleID = (window as unknown as { AppleID?: AppleIdSdk }).AppleID;
      if (!AppleID?.auth) throw new Error('Apple SDK unavailable');

      AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      });

      const response = await AppleID.auth.signIn();
      const idToken: string | undefined = response?.authorization?.id_token;
      if (!idToken) {
        setBusy(null);
        setMessage('Apple did not return a sign-in token. Please try again.');
        return;
      }
      await finish('apple', idToken);
    } catch (err) {
      setBusy(null);
      const code = (err as { error?: string; code?: string })?.error
        || (err as { error?: string; code?: string })?.code
        || '';
      if (code === 'popup_closed_by_user' || /cancel/i.test(String(code))) {
        setMessage('Apple sign-in was cancelled. Tap the button to try again.');
      } else if (code === 'popup_blocked_by_browser' || /popup|block/i.test(String(code))) {
        setMessage(
          'Your browser blocked the Apple sign-in window. Please allow popups for this site and try again.'
        );
      } else {
        setMessage(
          `Apple sign-in could not start (${getApiError(err, 'network error')}). Please try again or use email sign-in.`
        );
      }
    }
  }, [busy, finish]);

  const verb = mode === 'register' ? 'Sign up' : 'Continue';

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Google — official white button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy !== null}
          className="min-h-[52px] px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          aria-label={`${verb} with Google`}
        >
          {busy === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <GoogleLogo className="w-5 h-5 shrink-0" />
          )}
          <span className="text-base font-semibold text-slate-700">{verb} with Google</span>
        </button>

        {/* Apple — official black button */}
        <button
          type="button"
          onClick={handleApple}
          disabled={busy !== null}
          className="min-h-[52px] px-4 rounded-2xl bg-black hover:bg-[#1d1d1f] active:bg-[#2d2d2f] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          aria-label={`${verb} with Apple`}
        >
          {busy === 'apple' ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <AppleLogo className="w-5 h-5 shrink-0 text-white" />
          )}
          <span className="text-base font-semibold text-white">{verb} with Apple</span>
        </button>
      </div>

      {message && (
        <div
          className="mt-3 p-3.5 bg-amber-50 border-2 border-amber-200 text-amber-800 text-sm rounded-2xl flex items-start gap-2.5"
          role="status"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};
