import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { COOKIE_CONSENT_KEY } from '../../config/consent';

type ConsentState = 'accepted' | 'declined' | null;

const readConsent = (): ConsentState => {
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
};

/**
 * Cookie consent notice. Shows once until the visitor accepts or declines;
 * the choice is persisted in localStorage. Rendered globally from App.tsx so
 * it appears on every page (public, auth, and app shells).
 */
export const CookieConsent: React.FC = () => {
  const [consent, setConsent] = useState<ConsentState>(() => readConsent());
  const [dismissed, setDismissed] = useState(false);

  const choose = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      /* storage unavailable — dismiss for this session anyway */
    }
    setConsent(value);
  };

  if (consent !== null || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50"
    >
      <div className="backdrop-blur-xl bg-white/80 dark:bg-[#0C1322]/85 border border-[#E4EAF2] dark:border-white/15 rounded-2xl shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#07182F]/5 dark:bg-white/10 flex items-center justify-center shrink-0">
            <Cookie className="w-4.5 h-4.5 text-[#D4AF37]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
              We use cookies
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
              We use essential cookies to run the platform and optional ones to improve it. Read our{' '}
              <Link to="/cookies" className="font-bold text-[#168BFF] hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss cookie notice"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3.5">
          <button
            type="button"
            onClick={() => choose('declined')}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-[#E4EAF2] dark:border-white/15 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#07182F] dark:bg-[#168BFF] text-white hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
