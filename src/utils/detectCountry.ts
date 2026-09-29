/**
 * Lightweight client-side country detection from the visitor's IP, used
 * only to pre-select the phone field's country-code picker (dial code +
 * flag together, matched by ISO code — never by rendered label text, so
 * it works under any page translation).
 *
 * Provider chain (first success wins, each with its own timeout):
 *   1. https://ipwho.is/                      → { country_code: "US" }
 *   2. https://get.geojs.io/v1/ip/country.json → { country: "US" }
 * Both are free, keyless, and CORS-enabled.
 *
 * Country-level only: we read just the 2-letter ISO code and discard
 * everything else. No tracking, no storage.
 * Non-blocking: resolves asynchronously; callers must render with a
 * default first and update only if/when this resolves.
 * Silent failure: returns `null` on timeouts, HTTP errors, or malformed
 * payloads — callers fall back to the default dial code (+995 Georgia).
 */

interface Provider {
  url: string;
  /** Extract the 2-letter ISO country code from the provider's payload. */
  pick: (data: Record<string, unknown>) => unknown;
}

const PROVIDERS: Provider[] = [
  { url: 'https://ipwho.is/', pick: (d) => d.country_code },
  { url: 'https://get.geojs.io/v1/ip/country.json', pick: (d) => d.country },
];

function normalizeIso(raw: unknown): string | null {
  if (typeof raw === 'string' && /^[A-Za-z]{2}$/.test(raw)) {
    return raw.toUpperCase();
  }
  return null;
}

async function tryProvider(provider: Provider, timeoutMs: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(provider.url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return normalizeIso(provider.pick(data));
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function detectCountryIso(timeoutMs = 3000): Promise<string | null> {
  for (const provider of PROVIDERS) {
    const iso = await tryProvider(provider, timeoutMs);
    if (iso) return iso;
  }
  return null;
}
