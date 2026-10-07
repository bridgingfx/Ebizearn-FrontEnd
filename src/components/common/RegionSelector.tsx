import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { useRegion, type Region } from '../../context/RegionContext';
import { GTRANSLATE_LANGS } from './GTranslate';
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
  /** Compact row style for dropdown menus (smaller padding/text). */
  compact?: boolean;
  /** 'up' opens the menu above the button (for bottom-of-sidebar placement). */
  direction?: 'down' | 'up';
}

/**
 * Language selector. Every amount on the site is shown in USD (the ledger and
 * payout currency), so there is no currency picker: a currency pick could
 * never convert the USD figures in page copy, which left the pill saying
 * e.g. PKR while prices still read "$1.80".
 */
export const RegionSelector: React.FC<RegionSelectorProps> = ({ variant = 'dark', className = '', compact = false, direction = 'down' }) => {
  const { lang, setLang, t } = useRegion();
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
  const current = GTRANSLATE_LANGS.find((l) => l.code === lang) ?? GTRANSLATE_LANGS[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('region.ariaLabel', { name: current.label })}
        translate="no"
        className={`notranslate flex items-center gap-1.5 ps-1.5 pe-2 rounded-full border transition-all shrink-0 ${
          compact ? 'h-7' : 'h-10 gap-2 ps-2 pe-2.5'
        } ${
          dark
            ? 'border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white'
            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 shadow-xs'
        }`}
      >
        <CountryFlag iso={current.flag} className={compact ? 'w-4 h-3' : 'w-6 h-[18px]'} />
        <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold max-w-[6.5rem] truncate ${dark ? 'text-white' : 'text-slate-900 dark:text-gray-100'}`}>
          {current.label}
        </span>
        <ChevronDown className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} transition-transform ${open ? 'rotate-180' : ''} text-slate-400 dark:text-gray-500`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('region.languageTitle')}
          className={`absolute end-0 w-72 bg-white dark:bg-[#0C1322] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in ${direction === 'up' ? 'bottom-full mb-2' : 'mt-2'}`}
        >
          <div className="p-1.5 max-h-[22rem] overflow-y-auto">
            <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
              <Languages className="w-3 h-3" /> {t('region.languageTitle')}
            </p>
            {/* Native labels must NOT be machine-translated. */}
            <div className="notranslate grid grid-cols-2 gap-0.5 px-1 pb-1" translate="no">
              {GTRANSLATE_LANGS.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-start transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-500/15'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <CountryFlag iso={l.flag} className="w-5 h-[15px]" />
                    <span className="flex-1 min-w-0 truncate text-[13px] font-semibold text-slate-700 dark:text-gray-200">
                      {l.label}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 text-[#168BFF] dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="px-4 py-2.5 text-[10px] text-slate-400 dark:text-gray-500 border-t border-slate-100 dark:border-white/10">
            {t('region.footnote')}
          </p>
        </div>
      )}
    </div>
  );
}
