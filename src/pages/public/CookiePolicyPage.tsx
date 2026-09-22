import React from 'react';
import { Trash2 } from 'lucide-react';
import { LegalShell, LegalSection } from '../../components/common/LegalShell';

/** Storage key used by the consent banner. Exported so the banner and this
    page share one source of truth. */
export const COOKIE_CONSENT_KEY = 'ebizearn_cookie_consent_v1';

const clearConsent = () => {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
  // Reload so the consent banner reappears and the new choice takes effect.
  window.location.reload();
};

/**
 * Full Cookie Policy — real route /cookies.
 * Honest inventory of the cookies the platform actually uses, plus a
 * one-click way to reset the consent choice.
 */
export const CookiePolicyPage: React.FC = () => {
  return (
    <LegalShell
      doc="cookies"
      badge="Cookie Policy"
      title="Cookie Policy"
      tagline="What cookies and similar technologies we use, why we use them, and how you can control them."
      updated="September 23, 2026"
    >
      <LegalSection n="1" title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device by your browser. We also use equivalent
          technologies such as browser local storage for the same purposes described below. Cookies
          help us keep you signed in, secure your session, and remember your preferences.
        </p>
      </LegalSection>

      <LegalSection n="2" title="Cookies We Use">
        <p>We use the following categories of cookies:</p>
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-[#E4EAF2] dark:border-white/10">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
              Strictly necessary
            </p>
            <p className="text-xs sm:text-sm">
              Authentication session tokens, role context, and security tokens (such as CSRF
              protection). These are required for the platform to function — you cannot sign in or use
              your account without them. They are not used for advertising.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-[#E4EAF2] dark:border-white/10">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
              Preferences
            </p>
            <p className="text-xs sm:text-sm">
              Your chosen theme (light/dark mode), region preference, and your cookie-consent choice
              itself, stored in your browser's local storage.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-[#E4EAF2] dark:border-white/10">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
              Performance and analytics
            </p>
            <p className="text-xs sm:text-sm">
              Where enabled, aggregated and anonymized telemetry (such as page-load performance and
              error rates) used to keep the platform reliable. These do not identify you personally and
              are never used to build advertising profiles.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection n="3" title="Third-Party Cookies">
        <p>
          Embedded features — such as live-chat support widgets or analytics tools we may use — can set
          their own cookies. These third parties operate under their own privacy and cookie policies,
          which we encourage you to review.
        </p>
      </LegalSection>

      <LegalSection n="4" title="Managing Your Choices">
        <p>
          <strong className="text-gray-900 dark:text-gray-100">Consent banner:</strong> on your first
          visit we show a cookie notice where you can accept or decline non-essential cookies. Strictly
          necessary cookies cannot be declined because the platform cannot function without them.
        </p>
        <p>
          <strong className="text-gray-900 dark:text-gray-100">Change your mind:</strong> you can reset
          your consent choice at any time using the button below. The banner will reappear on your next
          page load.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={clearConsent}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#07182F] dark:bg-white/10 text-white dark:text-gray-100 hover:opacity-90 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset cookie consent
          </button>
        </div>
        <p>
          <strong className="text-gray-900 dark:text-gray-100">Browser controls:</strong> most browsers
          let you block or delete cookies in their settings. Blocking strictly necessary cookies will
          prevent you from signing in and using eBizEarn.
        </p>
      </LegalSection>

      <LegalSection n="5" title="Changes to This Policy">
        <p>
          We may update this Cookie Policy to reflect changes in the technologies we use. Material
          changes will be communicated through the platform, and the "Last updated" date at the top
          shows when the policy was last revised.
        </p>
      </LegalSection>

      <LegalSection n="6" title="Contact">
        <p>
          Questions about our use of cookies? Contact us at{' '}
          <a
            href="mailto:support@ebizearn.com"
            className="font-bold text-[#168BFF] hover:underline"
          >
            support@ebizearn.com
          </a>
          . eBizEarn is operated by eBiz Network, based in Dubai, United Arab Emirates.
        </p>
      </LegalSection>
    </LegalShell>
  );
};
