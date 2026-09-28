import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { translate, type DictKey } from '../i18n/dictionaries';
import { setGTranslateLang } from '../components/common/GTranslate';

export interface Region {
  code: string;
  nameKey: string; // dictionary key: region.<CODE>
  currency: string;
  /** Google Translate target language for this region (ka / ar / en). */
  locale: string;
}

export const REGIONS: Region[] = [
  { code: 'GE', nameKey: 'region.GE', currency: 'GEL', locale: 'ka' },
  { code: 'SA', nameKey: 'region.SA', currency: 'SAR', locale: 'ar' },
  { code: 'US', nameKey: 'region.US', currency: 'USD', locale: 'en' },
  { code: 'GB', nameKey: 'region.GB', currency: 'GBP', locale: 'en' },
  { code: 'EU', nameKey: 'region.EU', currency: 'EUR', locale: 'en' },
  { code: 'IN', nameKey: 'region.IN', currency: 'INR', locale: 'en' },
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
  /** Switch region — persists region + currency and drives the site language via GTranslate. */
  setRegion: (code: string) => void;
  /** Resolve a dictionary key to its English source string (Google translates the DOM). */
  t: (key: DictKey | string, vars?: Record<string, string | number>) => string;
  /** Display name of the current region (English source). */
  regionName: string;
}

const RegionContext = createContext<RegionContextValue>({
  region: REGIONS[0],
  setRegion: () => {},
  t: (key) => String(key),
  regionName: 'Georgia',
});

/**
 * Single source of truth for region + currency. The page source language is
 * always English (`pageLanguage: 'en'`); the GTranslate component translates
 * the entire DOM via the Google Translate engine.
 *
 * Region → language wiring: Georgia → Georgian (ka), Saudi Arabia → Arabic
 * (ar), everything else → English. Changing the region calls
 * `setGTranslateLang`, which persists the choice (`lm-lang` + googtrans
 * cookie) and applies it in-page; the persisted choice restores on reload
 * via the cookie-before-script-load trick in the GTranslate module.
 */
export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState<string>(getInitialCode);

  const region = REGIONS.find((r) => r.code === code) ?? REGIONS[0];

  useEffect(() => {
    // Page source is English; Google translates the DOM from here.
    document.documentElement.lang = 'en';
    // First load: if the user never picked a language, default from region.
    try {
      if (!window.localStorage.getItem('lm-lang')) {
        setGTranslateLang(region.locale);
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
    // Region selection drives the site language.
    setGTranslateLang(target.locale);
  }, [code]);

  const t = useCallback(
    (key: DictKey | string, vars?: Record<string, string | number>) => translate('en', key, vars),
    [],
  );

  const regionName = t(region.nameKey);

  return (
    <RegionContext.Provider value={{ region, setRegion, t, regionName }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextValue => useContext(RegionContext);
