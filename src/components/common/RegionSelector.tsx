import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useRegion, REGIONS, type Region } from '../../context/RegionContext';
import { CountryFlag } from './CountryFlag';

/**
 * Real flag for a region — served from flagcdn.com (correct artwork for every
 * region, incl. the five-cross Georgian flag and the EU circle of stars),
 * falling back to the emoji flag if the image can't load.
 * (Previously this rendered every flag as three CSS stripes, which made
 * Georgia look like Poland and every other flag wrong.)
 */
export const RegionFlag: React.FC<{ region: Region; className?: string }> = ({ region, className = 'w-6 h-[18px]' }) => (
  <CountryFlag iso={region.code} className={className} />
);

interface RegionSelectorProps {
  /** 'dark' for navy headers, 'light' for white headers. */
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Region & currency selector. Region + currency + language are a single
 * persisted source of truth (RegionContext) — changing the region here
 * updates the header badge, this dropdown, the AI support bubble and the
 * site language everywhere at once.
 */
export const RegionSelector: React.FC<RegionSelectorProps> = ({ variant = 'dark', className = '' }) => {
  const { region: current, setRegion, t, regionName } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
  }, []);

  const dark = variant === 'dark';
  const shortName = regionName.split(' ')[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('region.ariaLabel', { name: regionName, currency: current.currency })}
        className={`flex items-center gap-2 pl-2 pr-2.5 rounded-full border transition-all h-10 shrink-0 ${
          dark
            ? 'border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white'
            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 shadow-xs'
        }`}
      >
        <RegionFlag region={current} />
        <span className={`text-xs font-black tracking-wide ${dark ? 'text-white' : 'text-slate-900 dark:text-gray-100'}`}>
          {current.currency}
        </span>
        <span className={`h-3.5 w-px ${dark ? 'bg-white/20' : 'bg-slate-200'}`} />
        <span className={`text-[11px] font-bold ${dark ? 'text-slate-300' : 'text-slate-500 dark:text-gray-400'}`}>
          {shortName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''} text-slate-400 dark:text-gray-500`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('region.title')}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0C1322] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in"
        >
          <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> {t('region.title')}
          </p>
          <div className="p-1.5 max-h-72 overflow-y-auto">
            {REGIONS.map((r) => {
              const active = r.code === current.code;
              const name = t(r.nameKey);
              return (
                <button
                  key={r.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setRegion(r.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    /* Selected row: readable in BOTH themes (was bg-blue-50
                       with light text in dark mode — unreadable). */
                    active
                      ? 'bg-blue-50 dark:bg-blue-500/15'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <RegionFlag region={r} className="w-7 h-[21px]" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-gray-100 truncate">{name}</span>
                    <span className="block text-[11px] text-slate-400 dark:text-gray-400">
                      {t('region.currencyLabel', { currency: r.currency })}
                    </span>
                  </span>
                  {active && <Check className="w-4 h-4 text-[#168BFF] dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          <p className="px-4 py-2.5 text-[10px] text-slate-400 dark:text-gray-500 border-t border-slate-100 dark:border-white/10">
            {t('region.footnote')}
          </p>
        </div>
      )}
    </div>
  );
}
