import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { translate, type DictKey } from '../i18n/dictionaries';
import { getGTranslateLangCode, setGTranslateLang } from '../components/common/GTranslate';

export interface Region {
  code: string;
  nameKey: string; // dictionary key: region.<CODE>
  currency: string;
  /** Google Translate target language for this region (ka / ar / hi / en). */
  locale: string;
}

export const REGIONS: Region[] = [
  { code: 'GE', nameKey: 'region.GE', currency: 'GEL', locale: 'ka' },
  { code: 'SA', nameKey: 'region.SA', currency: 'SAR', locale: 'ar' },
  { code: 'US', nameKey: 'region.US', currency: 'USD', locale: 'en' },
  { code: 'GB', nameKey: 'region.GB', currency: 'GBP', locale: 'en' },
  { code: 'EU', nameKey: 'region.EU', currency: 'EUR', locale: 'en' },
  { code: 'IN', nameKey: 'region.IN', currency: 'INR', locale: 'hi' },
  { code: 'PK', nameKey: 'region.PK', currency: 'PKR', locale: 'en' },
];

/** Legacy key kept for compatibility with previously stored preferences. */
const STORAGE_KEY = 'ebizearn_region';

function getInitialCode(): string {
  if (typeof window === 'undefined') return 'GE';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && REGIONS.some((r) => r.code === stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  return 'GE';
}

interface RegionContextValue {
  region: Region;
  /** Switch region — persists region + currency and applies the region's default language. */
  setRegion: (code: string) => void;
  /** Active site language code (e.g. 'ka', 'ar', 'hi', 'en'). Independent of region. */
  lang: string;
  /** Switch language only — region and currency are untouched. Persisted via the GTranslate engine. */
  setLang: (code: string) => void;
  /** Resolve a dictionary key to its English source string (Google translates the DOM). */
  t: (key: DictKey | string, vars?: Record<string, string | number>) => string;
  /** Display name of the current region (English source). */
  regionName: string;
}

const RegionContext = createContext<RegionContextValue>({
  region: REGIONS[0],
  setRegion: () => {},
  lang: 'en',
  setLang: () => {},
  t: (key) => String(key),
  regionName: 'Georgia',
});

/**
 * Single source of truth for region + currency. The page source language is
 * always English (`pageLanguage: 'en'`); the GTranslate engine translates
 * the entire DOM via Google Translate element.js.
 *
 * Region and language are INDEPENDENT selections:
 * - `setRegion(code)` changes region + currency AND applies that region's
 *   default language (Georgia → ka, Saudi Arabia → ar, India → hi,
 *   US/UK/EU/Pakistan → en).
 * - `setLang(code)` changes ONLY the language (persisted via `lm-lang` +
 *   the googtrans cookie by the GTranslate engine).
 * Either can be re-picked afterwards without disturbing the other.
 */
export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState<string>(getInitialCode);
  const [lang, setLangState] = useState<string>(() =>
    typeof window === 'undefined' ? 'en' : getGTranslateLangCode(),
  );

  const region = REGIONS.find((r) => r.code === code) ?? REGIONS[0];

  useEffect(() => {
    // Page source is English; Google translates the DOM from here.
    document.documentElement.lang = 'en';
    // First load: if the user never picked a language, default from region.
    try {
      if (!window.localStorage.getItem('lm-lang')) {
        setGTranslateLang(region.locale);
        setLangState(region.locale);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRegion = useCallback((next: string) => {
    const target = REGIONS.find((r) => r.code === next);
    if (!target || next === code) return;
    setCode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    // Region selection applies the region's default language.
    setGTranslateLang(target.locale);
    setLangState(target.locale);
  }, [code]);

  const setLang = useCallback((next: string) => {
    setGTranslateLang(next);
    setLangState(getGTranslateLangCode());
  }, []);

  const t = useCallback(
    (key: DictKey | string, vars?: Record<string, string | number>) => translate('en', key, vars),
    [],
  );

  const regionName = t(region.nameKey);

  return (
    <RegionContext.Provider value={{ region, setRegion, lang, setLang, t, regionName }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextValue => useContext(RegionContext);
