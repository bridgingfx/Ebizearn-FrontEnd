import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { COUNTRY_DIALS, findCountryDialByIso } from '../../utils/countryDialCodes';
import { CountryFlag } from '../common/CountryFlag';
import { authInputClass } from './AuthSplitLayout';

interface CountrySelectProps {
  id: string;
  /** ISO 3166-1 alpha-2 code, e.g. "AE". */
  value: string;
  onChange: (iso: string) => void;
}

/** Popular markets first, then every country A–Z. */
const PINNED = ['AE', 'SA', 'IN', 'PK', 'BD', 'PH', 'EG', 'GB', 'US'];
const ORDERED = [
  ...PINNED.map((iso) => findCountryDialByIso(iso)!).filter(Boolean),
  ...COUNTRY_DIALS.filter((c) => !PINNED.includes(c.iso)).sort((a, b) => a.name.localeCompare(b.name)),
];

/**
 * Searchable country picker with flags (every country), same look as the
 * phone code picker. Keyboard: Enter/Space opens, type to search,
 * ArrowUp/ArrowDown moves, Enter picks, Escape closes.
 */
export const CountrySelect: React.FC<CountrySelectProps> = ({ id, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = findCountryDialByIso(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ORDERED;
    return ORDERED.filter((c) => c.name.toLowerCase().includes(q) || c.iso.toLowerCase() === q);
  }, [query]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    searchRef.current?.focus();
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
    setQuery('');
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = filtered[activeIndex];
      if (c) pick(c.iso);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${authInputClass} flex items-center gap-2.5 text-left cursor-pointer`}
      >
        {selected && <CountryFlag iso={selected.iso} className="w-[22px] h-4" />}
        <span className="flex-1 truncate text-[15px]">{selected?.name ?? 'Select country'}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full min-w-[260px] bg-white dark:bg-[#0C1322] border-2 border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onListKeyDown}
                placeholder="Search country…"
                aria-label="Search countries"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-listbox`}
                aria-activedescendant={`${id}-opt-${activeIndex}`}
                className="w-full min-h-[44px] pl-9 pr-3 text-[15px] text-slate-900 dark:text-gray-100 bg-slate-50 dark:bg-white/5 rounded-xl placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/40"
              />
            </div>
          </div>
          <div ref={listRef} id={`${id}-listbox`} role="listbox" aria-label="Countries" className="max-h-[264px] overflow-y-auto py-1.5 overscroll-contain">
            {filtered.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 dark:text-gray-400 text-center">No country matches “{query}”.</p>}
            {filtered.map((c, i) => {
              const isSelected = c.iso === value;
              return (
                <div
                  key={c.iso}
                  id={`${id}-opt-${i}`}
                  data-option-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => pick(c.iso)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center gap-2.5 px-4 min-h-[46px] cursor-pointer text-[15px] ${i === activeIndex ? 'bg-[#168BFF]/10 dark:bg-[#168BFF]/15' : ''} ${
                    isSelected ? 'font-bold text-slate-900 dark:text-gray-100' : 'text-slate-700 dark:text-gray-300'
                  } ${!query && i === PINNED.length - 1 ? 'border-b border-slate-100 dark:border-white/10' : ''}`}
                >
                  <CountryFlag iso={c.iso} className="w-6 h-[18px]" />
                  <span className="flex-1 truncate">{c.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#168BFF] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
