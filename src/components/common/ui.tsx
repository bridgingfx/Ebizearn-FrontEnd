import React from 'react';
import { Loader2, Search } from 'lucide-react';

/**
 * Phase 11 — shared visual primitives.
 *
 * One file holds the common SaaS chrome (page headers, stat cards, status
 * badges, search, filter pills, loading/error blocks) so every page shares
 * the same premium look and the whole system can be restyled from here.
 */

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

const STAT_ACCENTS: Record<string, string> = {
  navy: 'bg-[#07182F] text-white',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
};

export const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: keyof typeof STAT_ACCENTS;
}> = ({ label, value, hint, icon: Icon, accent = 'navy' }) => (
  <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)] hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${STAT_ACCENTS[accent]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2 tabular-nums">{value}</p>
    {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
  </div>
);

const BADGE_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  rewarded: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  completed: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
  paused: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  requested: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  checking: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  submitted: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  draft: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/15',
  rejected: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
  reversed: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
  cancelled: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
  action_required: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30',
  suspended: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const style = BADGE_STYLES[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/15';
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ring-1 ring-inset ${style}`}>
      {label}
    </span>
  );
};

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative">
    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/40 focus:border-[#168BFF] transition"
    />
  </div>
);

export const FilterPills: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          value === o.value
            ? 'bg-[#07182F] text-white shadow-sm'
            : 'bg-white dark:bg-[#0C1322] text-gray-500 dark:text-gray-400 border border-[#E7ECF3] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-gray-300 dark:hover:text-gray-200'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const LoadingBlock: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-12 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
    <Loader2 className="w-6 h-6 animate-spin text-[#168BFF]" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const ErrorBlock: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50/60 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/25 p-8 text-center space-y-3">
    <p className="text-sm font-semibold text-red-700 dark:text-red-300">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-white dark:bg-transparent border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/10">
    <div>
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/** Format integer cents as $x.xx */
export const fmtMoney = (cents: number | null | undefined): string =>
  `$${((cents ?? 0) / 100).toFixed(2)}`;
