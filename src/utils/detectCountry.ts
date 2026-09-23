/**
 * Lightweight client-side country detection from the visitor's IP, used
 * only to pre-select the phone field's country-code picker.
 *
 * - Uses https://ipwho.is/ — free, no API key, CORS-enabled.
 * - Country-level only: we read just `country_code` (ISO-3166) and discard
 *   everything else. No tracking, no storage.
 * - Non-blocking: resolves asynchronously; callers must render with a
 *   default first and update only if/when this resolves.
 * - Silent failure: returns `null` on timeout (default 3s), HTTP error, or
 *   malformed payload — callers fall back to the default dial code.
 */

const GEO_URL = 'https://ipwho.is/';

interface IpWhoResponse {
  success?: boolean;
  country_code?: string;
}

export async function detectCountryIso(timeoutMs = 3000): Promise<string | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(GEO_URL, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoResponse;
    const iso = data?.country_code;
    if (typeof iso === 'string' && /^[A-Za-z]{2}$/.test(iso)) {
      return iso.toUpperCase();
    }
    return null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
