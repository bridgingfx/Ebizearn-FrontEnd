import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Site-wide language switcher powered by the Google Translate element.js
 * engine. Unlike the old key-by-key dictionary, this translates the ENTIRE
 * rendered DOM — every page, every modal, every dynamically rendered node —
 * so "the language changes everywhere".
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
const FLAG_BASE = 'https://flagcdn.com/16x12';
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

// ── Module-level singleton: all instances share the same selection ────────────
let _activeLang: GTranslateLang = findLang(
  typeof window === 'undefined' ? 'en' : loadSavedCode(),
);
const _listeners = new Set<(lang: GTranslateLang) => void>();

function subscribe(fn: (lang: GTranslateLang) => void): () => void {
  _listeners.add(fn);
  return () => {
    _listeners.delete(fn);
  };
}

function broadcastLang(lang: GTranslateLang): void {
  _activeLang = lang;
  _listeners.forEach((fn) => fn(lang));
}

/** Current Google language code for the whole page (e.g. 'ka', 'ar', 'en'). */
export function getGTranslateLangCode(): string {
  return _activeLang.code;
}

// ── Google Translate engine (injected once) ───────────────────────────────────
let gtInjected = false;

function injectGoogleTranslate(): void {
  if (gtInjected || typeof window === 'undefined') return;
  gtInjected = true;

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
  broadcastLang(lang);
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

interface GTranslateProps {
  /** 'dark' for navy headers, 'light' for white headers. */
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Language dropdown. Styled to match the region/currency selector:
 * dark navy glass on navy headers, readable in BOTH light and dark themes.
 * The button + menu carry `notranslate` so Google never translates the
 * language names themselves.
 */
export const GTranslate: React.FC<GTranslateProps> = ({ variant = 'dark', className = '' }) => {
  const [selected, setSelected] = useState<GTranslateLang>(() => _activeLang);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectGoogleTranslate();
    // Preload all flag images into browser cache so the dropdown opens instantly
    GTRANSLATE_LANGS.forEach(({ flag }) => {
      const img = new Image();
      img.src = `${FLAG_BASE}/${flag}.png`;
    });
  }, []);

  // Stay in sync when another instance (or setGTranslateLang) changes the language
  useEffect(() => subscribe(setSelected), []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const changeLang = (lang: GTranslateLang): void => {
    setOpen(false);
    setGTranslateLang(lang.code);
  };

  const dark = variant === 'dark';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Change language"
        // Google must never translate the language picker itself
        className={`notranslate flex items-center gap-2 pl-2 pr-2.5 rounded-full border transition-all h-10 shrink-0 ${
          dark
            ? 'border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white'
            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 shadow-xs'
        }`}
        translate="no"
      >
        <img
          src={`${FLAG_BASE}/${selected.flag}.png`}
          alt={selected.label}
          width={16}
          height={12}
          className="rounded-[2px]"
        />
        <span
          className={`text-xs font-black tracking-wide ${
            dark ? 'text-white' : 'text-slate-900 dark:text-gray-100'
          }`}
        >
          {selected.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''} text-slate-400 dark:text-gray-500`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="notranslate absolute right-0 mt-2 w-56 bg-white dark:bg-[#0C1322] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 overflow-hidden z-50"
          translate="no"
        >
          <div className="p-1.5 max-h-72 overflow-y-auto">
            {GTRANSLATE_LANGS.map((lang) => {
              const active = lang.code === selected.code;
              return (
                <li key={lang.code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => changeLang(lang)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      /* Selected row: readable in BOTH themes. */
                      active
                        ? 'bg-blue-50 dark:bg-blue-500/15'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={`${FLAG_BASE}/${lang.flag}.png`}
                      alt=""
                      width={16}
                      height={12}
                      className="rounded-[2px] shrink-0"
                    />
                    <span className="flex-1 min-w-0 block text-sm font-bold text-slate-800 dark:text-gray-100 truncate">
                      {lang.label}
                    </span>
                    {active && <Check className="w-4 h-4 text-[#168BFF] dark:text-blue-400 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </div>
        </ul>
      )}
    </div>
  );
};

export default GTranslate;
