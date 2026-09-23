/**
 * Cookie-consent storage key — single source of truth shared by the consent
 * banner (main bundle) and the Cookie Policy page (lazy chunk).
 *
 * Lives in its own tiny module so the banner doesn't statically import the
 * whole policy page, which would defeat route-level code splitting.
 */
export const COOKIE_CONSENT_KEY = 'ebizearn_cookie_consent_v1';
