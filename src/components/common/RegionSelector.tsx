import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';

interface Region {
  code: string;
  name: string;
  currency: string;
  /** [top stripe, middle stripe, bottom stripe, hoist band] */
  flag: [string, string, string, string];
}

const REGIONS: Region[] = [
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: ['#00732F', '#FFFFFF', '#000000', '#FF0000'] },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: ['#006C35', '#006C35', '#006C35', '#FFFFFF'] },
  { code: 'US', name: 'United States', currency: 'USD', flag: ['#3C3B6E', '#FFFFFF', '#B22234', '#3C3B6E'] },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: ['#012169', '#FFFFFF', '#C8102E', '#012169'] },
  { code: 'EU', name: 'European Union', currency: 'EUR', flag: ['#003399', '#003399', '#003399', '#FFDD00'] },
  { code: 'IN', name: 'India', currency: 'INR', flag: ['#FF9933', '#FFFFFF', '#138808', '#000080'] },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', flag: ['#01411C', '#01411C', '#01411C', '#FFFFFF'] },
];

const STORAGE_KEY = 'ebizearn_region';

/** Crisp CSS flag: hoist band + three horizontal stripes. */
export const RegionFlag: React.FC<{ region: Region; className?: string }> = ({ region, className = 'w-6 h-[18px]' }) => {
  const [top, mid, bot, hoist] = region.flag;
  return (
    <span
      className={`relative inline-block overflow-hidden rounded-[4px] ring-1 ring-black/10 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-y-0 left-0 w-[28%]" style={{ background: hoist }} />
      <span className="absolute inset-y-0 right-0 left-[28%] flex flex-col">
        <span className="flex-1" style={{ background: top }} />
        <span className="flex-1" style={{ background: mid }} />
        <span className="flex-1" style={{ background: bot }} />
      </span>
    </span>
  );
};

interface RegionSelectorProps {
  /** 'dark' for navy headers, 'light' for white headers. */
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Clean flag-style region & currency selector: UAE flag mark + "AED" + "UAE"
 * chip with a polished dropdown. Display preference persisted locally.
 */
export const RegionSelector: React.FC<RegionSelectorProps> = ({ variant = 'dark', className = '' }) => {
  const [code, setCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'AE';
    } catch {
      return 'AE';
    }
  });
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

  const current = REGIONS.find((r) => r.code === code) || REGIONS[0];
  const dark = variant === 'dark';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Region: ${current.name}, currency ${current.currency}. Change region`}
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
          {current.code === 'AE' ? 'UAE' : current.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''} ${dark ? 'text-slate-400 dark:text-gray-500' : 'text-slate-400 dark:text-gray-500'}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select region"
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0C1322] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in"
        >
          <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Region & currency
          </p>
          <div className="p-1.5 max-h-72 overflow-y-auto">
            {REGIONS.map((r) => {
              const active = r.code === code;
              return (
                <button
                  key={r.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setCode(r.code);
                    try {
                      localStorage.setItem(STORAGE_KEY, r.code);
                    } catch {
                      /* ignore */
                    }
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    active ? 'bg-blue-50' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <RegionFlag region={r} className="w-7 h-[21px]" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-gray-200 truncate">{r.name}</span>
                    <span className="block text-[11px] text-slate-400 dark:text-gray-500">Currency: {r.currency}</span>
                  </span>
                  {active && <Check className="w-4 h-4 text-[#168BFF] shrink-0" />}
                </button>
              );
            })}
          </div>
          <p className="px-4 py-2.5 text-[10px] text-slate-400 dark:text-gray-500 border-t border-slate-100">
            Balances are shown in your account currency. Region affects display only.
          </p>
        </div>
      )}
    </div>
  );
};
