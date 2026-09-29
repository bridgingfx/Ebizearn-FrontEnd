/**
 * Display-layer currency conversion.
 *
 * The ledger stores and settles everything in USD (cents) — see
 * `config/platform.php` `defaultCurrency` in Ebizearn-BackEnd. This module
 * NEVER touches ledger arithmetic: it only converts USD amounts for DISPLAY
 * into the currency the user picked in the region selector.
 *
 * Converted figures are always prefixed with `≈` and must be presented as
 * estimates; exact USD amounts are shown without the prefix.
 */

export const LEDGER_CURRENCY = 'USD';

const FX_CACHE_KEY = 'ebizearn_fx_rates';
const FX_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const FX_URL = 'https://open.er-api.com/v6/latest/USD'; // free, no key
const FX_TIMEOUT_MS = 8000;

export interface FxRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

/** Intl locale per supported display currency (proper symbols: ₾ ﷼ ₹ $ € £ ₨). */
const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US',
  GEL: 'ka-GE',
  SAR: 'ar-SA',
  GBP: 'en-GB',
  EUR: 'de-DE',
  INR: 'en-IN',
  PKR: 'en-PK',
};

function localeFor(currency: string): string {
  return CURRENCY_LOCALES[currency] ?? 'en-US';
}

function isFresh(fx: FxRates): boolean {
  return Date.now() - fx.fetchedAt < FX_TTL_MS;
}

export function loadCachedFx(): FxRates | null {
  try {
    const raw = window.localStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const fx = JSON.parse(raw) as FxRates;
    if (!fx || typeof fx !== 'object' || !fx.rates || typeof fx.rates.USD !== 'number') return null;
    return fx;
  } catch {
    return null;
  }
}

function saveFx(fx: FxRates): void {
  try {
    window.localStorage.setItem(FX_CACHE_KEY, JSON.stringify(fx));
  } catch {
    /* storage unavailable */
  }
}

export async function fetchFxRates(): Promise<FxRates | null> {
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), FX_TIMEOUT_MS);
    const res = await fetch(FX_URL, { signal: ctrl.signal });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.result !== 'ok' || !data.rates || typeof data.rates !== 'object') return null;
    const fx: FxRates = { base: 'USD', rates: data.rates as Record<string, number>, fetchedAt: Date.now() };
    saveFx(fx);
    return fx;
  } catch {
    return null;
  }
}

/**
 * Cached rates when fresh, otherwise a background fetch. On failure returns
 * stale cache (any age) or null — never throws.
 */
export async function ensureFxRates(): Promise<FxRates | null> {
  const cached = loadCachedFx();
  if (cached && isFresh(cached)) return cached;
  const fresh = await fetchFxRates();
  if (fresh) return fresh;
  return cached; // stale is better than nothing for display
}

/** Convert USD cents to target currency units. Null when no rate is known. */
export function convertUsdCents(cents: number, target: string, fx: FxRates | null): number | null {
  if (target === LEDGER_CURRENCY) return cents / 100;
  if (!fx) return null;
  const rate = fx.rates[target];
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return null;
  return (cents / 100) * rate;
}

function intl(currency: string): Intl.NumberFormat {
  return new Intl.NumberFormat(localeFor(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Exact ledger amount, e.g. $12.34 — shown when display currency is USD. */
export function formatExactUsd(cents: number): string {
  return intl(LEDGER_CURRENCY).format(cents / 100);
}

/**
 * Converted display amount, e.g. `≈ 367.50 SAR` → via Intl: `≈ ‏367.50 ر.س`.
 * Null when no rate is known (caller falls back to the exact USD figure).
 */
export function formatConverted(cents: number, target: string, fx: FxRates): string | null {
  const value = convertUsdCents(cents, target, fx);
  if (value === null) return null;
  return `≈ ${intl(target).format(value)}`;
}

export interface DisplayMoney {
  text: string;
  /** True when the figure is an FX estimate (shows ≈). False = exact USD. */
  converted: boolean;
}

/**
 * The single display formatter for money across contributor + business
 * dashboards. Display layer only — ledger/API payloads are untouched.
 */
export function formatDisplayMoney(
  cents: number | null | undefined,
  displayCurrency: string,
  fx: FxRates | null,
): DisplayMoney {
  const value = Number(cents || 0);
  if (displayCurrency === LEDGER_CURRENCY || !fx) {
    return { text: formatExactUsd(value), converted: false };
  }
  const text = formatConverted(value, displayCurrency, fx);
  if (text === null) {
    return { text: formatExactUsd(value), converted: false };
  }
  return { text, converted: true };
}
