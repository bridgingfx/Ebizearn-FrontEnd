import { useEffect } from 'react';

/**
 * Site-wide language engine powered by Google Translate element.js.
 * Unlike the old key-by-key dictionary, this translates the ENTIRE rendered
 * DOM — every page, every modal, every dynamically rendered node — so
 * "the language changes everywhere".
 *
 * There is NO visible language dropdown anymore: language is picked from the
 * LANGUAGE section of the RegionSelector (independent of region), or applied
 * as a region default via `setRegion` (RegionContext). Both paths call
 * `setGTranslateLang` / `setLang` in this module.
 *
 * This module stays engine-only: hidden `gt-engine-container` injection,
 * toolbar suppression, cookie + `lm-lang` persistence, and the programmatic
 * API below. No Google chrome is ever visible.
 *
 * Ported to TypeScript from the approved GTranslate.jsx reference with two
 * deliberate deviations (owner-notified):
 *  1. Georgian added — { code: 'ka', label: 'ქართული', flag: 'ge' }.
 *     Google supports it and the platform operates in Georgia.
 *  2. Arabic flag changed 'ae' → 'sa'. UAE flags are banned everywhere.
 */
export interface GTranslateLang {
  code: string;
  label: string;
  /** flagcdn.com country code for the flag artwork (NOT the language code). */
  flag: string;
}

export const GTRANSLATE_LANGS: GTranslateLang[] = [
  { code: 'en',    label: 'English',    flag: 'gb' },
  { code: 'ka',    label: 'ქართული',    flag: 'ge' },
  { code: 'ar',    label: 'العربية',   flag: 'sa' },
  { code: 'hi',    label: 'हिन्दी',      flag: 'in' },
  { code: 'ms',    label: 'Malay',      flag: 'my' },
  { code: 'ur',    label: 'اردو',       flag: 'pk' },
  { code: 'bn',    label: 'বাংলা',      flag: 'bd' },
  { code: 'fr',    label: 'Français',   flag: 'fr' },
  { code: 'pt',    label: 'Português',  flag: 'pt' },
  { code: 'it',    label: 'Italiano',   flag: 'it' },
  { code: 'nl',    label: 'Nederlands', flag: 'nl' },
  { code: 'de',    label: 'Deutsch',    flag: 'de' },
  { code: 'ru',    label: 'Русский',    flag: 'ru' },
  { code: 'es',    label: 'Español',    flag: 'es' },
  { code: 'zh-CN', label: '中文',       flag: 'cn' },
  { code: 'th',    label: 'ไทย',        flag: 'th' },
  { code: 'tr',    label: 'Türkçe',     flag: 'tr' },
];

const STORAGE_KEY = 'lm-lang';
const ENGINE_CONTAINER_ID = 'gt-engine-container';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string,
        ) => unknown;
      };
    };
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
function setGoogTransCookie(langCode: string): void {
  const val = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
  const host = window.location.hostname;
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; path=/; domain=${host}`;
  document.cookie = `googtrans=${val}; path=/; domain=.${host}`;
}

function clearGoogTransCookie(): void {
  const exp = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
  const host = window.location.hostname;
  document.cookie = `googtrans=; ${exp}; path=/`;
  document.cookie = `googtrans=; ${exp}; path=/; domain=${host}`;
  document.cookie = `googtrans=; ${exp}; path=/; domain=.${host}`;
}

// ── Persistence helpers ───────────────────────────────────────────────────────
function saveLang(code: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* storage unavailable */
  }
}

function loadSavedCode(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

function findLang(code: string): GTranslateLang {
  return GTRANSLATE_LANGS.find((l) => l.code === code) || GTRANSLATE_LANGS[0];
}

// ── Module-level state: the active language code for the whole page ──────────
let _activeLang: GTranslateLang = findLang(
  typeof window === 'undefined' ? 'en' : loadSavedCode(),
);

/** Current Google language code for the whole page (e.g. 'ka', 'ar', 'en'). */
export function getGTranslateLangCode(): string {
  return _activeLang.code;
}

/**
 * Bulletproof Google toolbar suppression. element.js shows its top toolbar by
 * (a) un-hiding a `body > div.skiptranslate` wrapper and (b) pushing the page
 * down via `body.style.top = "40px"`. The CSS in index.css already hides the
 * wrapper, but this observer guarantees it STAYS hidden no matter how Google
 * toggles it (inline styles, re-insertion, future markup tweaks): it re-hides
 * the wrapper and neutralises the 40px page push on every relevant mutation.
 * Translation itself is unaffected — the toolbar is purely informational UI
 * ("Translated to: X" / "Show original"); switching back to English is done
 * programmatically via `setGTranslateLang('en')` (e.g. by picking a
 * region whose locale is 'en').
 */
function suppressGoogleChrome(): void {
  const kill = (): void => {
    document.querySelectorAll('body > div.skiptranslate').forEach((el) => {
      const node = el as HTMLElement;
      if (node.id === ENGINE_CONTAINER_ID) return; // never hide our engine
      if (node.style.display !== 'none') node.style.display = 'none';
    });
    const top = document.body.style.top;
    if (top && top !== '0px') document.body.style.top = '0px';
  };
  kill(); // banner may already exist (auto-translate on load via cookie)
  const obs = new MutationObserver(kill);
  obs.observe(document.body, {
    childList: true,
    attributes: true,
    attributeFilter: ['style'],
    subtree: false,
  });
}

// ── Google Translate engine (injected once) ───────────────────────────────────
let gtInjected = false;

function injectGoogleTranslate(): void {
  if (gtInjected || typeof window === 'undefined') return;
  gtInjected = true;

  // Start the toolbar suppression before Google's script even loads
  suppressGoogleChrome();

  // Set the cookie BEFORE the script loads so Google auto-translates on init
  const savedCode = loadSavedCode();
  if (savedCode !== 'en') {
    setGoogTransCookie(savedCode);
  }

  window.googleTranslateElementInit = function () {
    const TranslateElement = window.google?.translate?.TranslateElement;
    if (TranslateElement) {
      // eslint-disable-next-line no-new
      new TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        ENGINE_CONTAINER_ID,
      );
    }
  };

  if (!document.getElementById(ENGINE_CONTAINER_ID)) {
    const div = document.createElement('div');
    div.id = ENGINE_CONTAINER_ID;
    // Off-screen but NOT display:none — Google needs it in the render tree
    div.style.cssText =
      'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none';
    document.body.appendChild(div);
  }

  const s = document.createElement('script');
  s.src = 'https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit';
  s.async = true;
  document.body.appendChild(s);
}

// ── Trigger translation via Google's injected combo element ───────────────────
function applyLang(langCode: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (!combo) return false;
  combo.value = langCode;
  combo.dispatchEvent(new Event('change'));
  combo.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/** Run fn() until it returns true: 200ms retry loop, 10s cap. */
function retryUntil(fn: () => boolean): void {
  if (fn()) return;
  const id = window.setInterval(() => {
    if (fn()) window.clearInterval(id);
  }, 200);
  window.setTimeout(() => window.clearInterval(id), 10_000);
}

/**
 * Programmatic language change — used by RegionContext (region → language
 * wiring) and by the route-change hook. Same path as a manual menu pick:
 * broadcast + persist + cookie + in-page apply with retry.
 */
export function setGTranslateLang(code: string): void {
  const lang = findLang(code);
  _activeLang = lang;
  saveLang(lang.code);
  if (lang.code === 'en') {
    clearGoogTransCookie();
  } else {
    setGoogTransCookie(lang.code);
  }
  retryUntil(() => applyLang(lang.code));
}

/**
 * Re-apply the current language — called on SPA route changes because
 * Google doesn't always translate dynamically rendered nodes.
 */
export function reapplyGTranslateLang(): void {
  const code = getGTranslateLangCode();
  if (code === 'en') return;
  retryUntil(() => applyLang(code));
}


/**
 * Invisible engine mount — renders nothing. Injects the Google Translate
 * element.js engine once (hidden container + toolbar-suppression observer)
 * so region-driven translation works on every page with zero visible
 * Google UI. Mount once near the app root (see App.tsx).
 */
export function GTranslateEngine(): null {
  useEffect(() => {
    injectGoogleTranslate();
  }, []);
  return null;
}
