import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { translate, type Locale, type DictKey } from '../i18n/dictionaries';

export interface Region {
  code: string;
  nameKey: string; // dictionary key: region.<CODE>
  currency: string;
  locale: Locale;
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
  locale: Locale;
  /** Switch region — persists region + currency + language as ONE object. */
  setRegion: (code: string) => void;
  /** Translate a dictionary key for the current locale (English fallback). */
  t: (key: DictKey | string, vars?: Record<string, string | number>) => string;
  /** Localized display name of the current region. */
  regionName: string;
}

const RegionContext = createContext<RegionContextValue>({
  region: REGIONS[0],
  locale: 'ka',
  setRegion: () => {},
  t: (key) => String(key),
  regionName: 'Georgia',
});

/**
 * Single source of truth for region + currency + language.
 * One object, one setter, persisted to localStorage, applied on first
 * paint (useState initializer reads storage synchronously — no flash of
 * wrong language). Also syncs <html lang>.
 */
export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState<string>(getInitialCode);

  const region = REGIONS.find((r) => r.code === code) ?? REGIONS[0];
  const locale = region.locale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setRegion = useCallback((next: string) => {
    if (!REGIONS.some((r) => r.code === next) || next === code) return;
    setCode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, [code]);

  const t = useCallback(
    (key: DictKey | string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const regionName = t(region.nameKey);

  return (
    <RegionContext.Provider value={{ region, locale, setRegion, t, regionName }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextValue => useContext(RegionContext);
