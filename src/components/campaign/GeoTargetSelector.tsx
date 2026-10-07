import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe, MapPin } from 'lucide-react';

export interface GeoTarget {
  mode: 'global' | 'custom';
  country?: string; // ISO code (legacy single)
  countryName?: string;
  /** Multi-select: list of ISO codes when targeting several countries. */
  countries?: string[];
  state?: string;
  city?: string;
  area?: string;
}

/** Full world country list (ISO code + name). */
const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'EG', name: 'Egypt' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'NP', name: 'Nepal' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
];

/** States/provinces for countries where we have them. */
const STATES: Record<string, string[]> = {
  AE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  SA: ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Tabuk', 'Qassim', 'Hail', 'Jazan', 'Najran', 'Al Bahah', 'Al Jouf', 'Northern Borders'],
  QA: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Umm Salal', 'Al Khor', 'Al Shamal', 'Al Daayen'],
  IN: ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Bihar', 'Madhya Pradesh', 'Haryana'],
  PK: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad'],
  PH: ['Metro Manila', 'Cebu', 'Davao', 'Iloilo', 'Batangas', 'Pampanga', 'Cavite', 'Laguna'],
  BD: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'],
  US: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
  GB: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  CA: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'],
  AU: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  NG: ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna'],
  ZA: ['Gauteng', 'KwaZulu-Natal', 'Western Cape', 'Eastern Cape'],
  EG: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'],
};

const inputCls = 'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

interface Props {
  value: GeoTarget;
  onChange: (v: GeoTarget) => void;
}

export const GeoTargetSelector: React.FC<Props> = ({ value, onChange }) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateOpen, setStateOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isGlobal = value.mode === 'global';
  const states = value.country ? STATES[value.country] || [] : [];
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const setMode = (mode: 'global' | 'custom') => {
    if (mode === 'global') {
      onChange({ mode: 'global' });
    } else {
      onChange({ mode: 'custom' });
    }
  };

  const summary = isGlobal
    ? 'Visible to contributors everywhere.'
    : [
        value.area,
        value.city,
        value.state,
        value.countryName,
      ]
        .filter(Boolean)
        .join(', ') || 'Select a country to narrow the audience.';

  return (
    <div>
      <label className={labelCls}>Target region</label>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('global')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
            isGlobal
              ? 'bg-[#168BFF] text-white border-[#168BFF]'
              : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#168BFF]'
          }`}
        >
          <Globe className="w-4 h-4" /> Global — everyone
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
            !isGlobal
              ? 'bg-[#168BFF] text-white border-[#168BFF]'
              : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#168BFF]'
          }`}
        >
          <MapPin className="w-4 h-4" /> Specific region
        </button>
      </div>

      {/* Cascading selectors — locked when Global */}
      <div className={isGlobal ? 'opacity-40 pointer-events-none' : ''}>
        {/* Country */}
        <div className="relative mb-2.5" ref={countryRef}>
          <button
            type="button"
            onClick={() => setCountryOpen((v) => !v)}
            disabled={isGlobal}
            className={`${inputCls} flex items-center justify-between text-left`}
          >
            <span className="flex items-center gap-2">
              {(value.countries?.length || value.country) ? (
                <>
                  <span className="flex -space-x-1">
                    {(value.countries || (value.country ? [value.country] : [])).slice(0, 3).map((code) => (
                      <img key={code} src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt="" className="w-5 h-3.5 object-cover rounded-sm ring-1 ring-white" />
                    ))}
                  </span>
                  {(value.countries?.length || 0) > 1
                    ? `${value.countries!.length} countries`
                    : value.countryName || value.countries?.[0]}
                </>
              ) : (
                <span className="text-gray-400">Select countries…</span>
              )}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {countryOpen && !isGlobal && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-[#1a1f2b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10">
              <div className="sticky top-0 p-2 bg-white dark:bg-[#1a1f2b]">
                <input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries…"
                  className={inputCls}
                  autoFocus
                />
              </div>
              {filteredCountries.map((c) => {
                const selected = (value.countries || (value.country ? [value.country] : [])).includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      const current = value.countries || (value.country ? [value.country] : []);
                      const next = selected ? current.filter((x) => x !== c.code) : [...current, c.code];
                      onChange({
                        mode: 'custom',
                        countries: next,
                        country: next[0],
                        countryName: next.length === 1 ? c.name : `${next.length} countries`,
                      });
                      setCountrySearch('');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <img src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} alt="" className="w-5 h-3.5 object-cover rounded-sm" loading="lazy" />
                    <span className="flex-1 text-left">{c.name}</span>
                    {selected && <Check className="w-4 h-4 text-[#168BFF]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* State (only if country has states) */}
        {value.country && states.length > 0 && (
          <div className="relative mb-2.5" ref={stateRef}>
            <button
              type="button"
              onClick={() => setStateOpen((v) => !v)}
              disabled={isGlobal}
              className={`${inputCls} flex items-center justify-between text-left`}
            >
              <span className={value.state ? '' : 'text-gray-400'}>
                {value.state || 'Select state / emirate… (optional)'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {stateOpen && !isGlobal && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-[#1a1f2b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => { onChange({ ...value, state: undefined, city: undefined }); setStateOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  All states — whole country
                </button>
                {states.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { onChange({ ...value, state: s, city: undefined }); setStateOpen(false); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <span className="flex-1 text-left">{s}</span>
                    {value.state === s && <Check className="w-4 h-4 text-[#168BFF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* City — free text */}
        {value.country && (
          <div className="mb-2.5">
            <input
              value={value.city || ''}
              onChange={(e) => onChange({ ...value, city: e.target.value || undefined })}
              disabled={isGlobal}
              placeholder="City — type to narrow further (optional)"
              className={inputCls}
            />
          </div>
        )}

        {/* Area — free text */}
        {value.country && (
          <div className="mb-1">
            <input
              value={value.area || ''}
              onChange={(e) => onChange({ ...value, area: e.target.value || undefined })}
              disabled={isGlobal}
              placeholder="Area / neighborhood — type manually (optional)"
              className={inputCls}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
        {isGlobal
          ? 'Visible to contributors everywhere.'
          : value.country
            ? `Only contributors in ${summary} will see this campaign.`
            : 'Pick a country — or leave it on Global for everyone.'}
      </p>
    </div>
  );
};

/** Convert the selector value to the backend target_countries array. */
export function geoTargetToCountries(v: GeoTarget): string[] {
  if (v.mode === 'global') return ['ALL'];
  if (v.countries?.length) return v.countries;
  if (v.country) return [v.country];
  return ['ALL'];
}
