import { TERMS_VERSION } from '../legal/terms';

/**
 * Proof-of-consent record. `acceptedAt` is the client-side timestamp;
 * the backend records its own server-side timestamp on top of it.
 */
export interface TermsConsent {
  version: string;
  acceptedAt: string;
}

const STORAGE_KEY = 'ebizearn_terms_consent_v1';

export const buildConsent = (): TermsConsent => ({
  version: TERMS_VERSION,
  acceptedAt: new Date().toISOString(),
});

/** Persist acceptance for this browser session so later signup steps (e.g. the
 *  post-Google phone step) can pick it up instead of asking twice. */
export function storeConsent(c: TermsConsent): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable — the in-memory state still gates the form */
  }
}

export function readStoredConsent(): TermsConsent | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TermsConsent;
    // A stored acceptance is only reusable if it matches the CURRENT terms
    // version — if the legal text changed, the user must accept again.
    if (parsed && parsed.version === TERMS_VERSION && typeof parsed.acceptedAt === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearStoredConsent(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
