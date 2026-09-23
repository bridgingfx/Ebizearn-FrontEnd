import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Gradient classes for the icon tile, e.g. 'from-emerald-500 to-teal-600'. */
  gradient: string;
  shadow: string;
  to?: string;
}

/**
 * Premium SaaS stat card: gradient icon tile, strong typography scale,
 * generous spacing. Optionally a link.
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, gradient, shadow, to }) => {
  const body = (
    <>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} ${shadow} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-400 dark:text-gray-500">{label}</p>
      <p
        className="text-[1.65rem] font-black text-slate-900 dark:text-white tracking-tight mt-1 leading-none truncate"
        title={value}
      >
        {value}
      </p>
      {sub && <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mt-2">{sub}</p>}
    </>
  );

  const cls =
    'glass rounded-[1.5rem] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.07]';

  if (to) {
    return (
      <Link to={to} className={`${cls} block hover:border-[#168BFF]/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168BFF]/25`}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actionLabel, actionTo }) => (
  <div className="flex items-end justify-between gap-3 mb-4">
    <div>
      <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-[#168BFF] hover:underline min-h-[44px]"
      >
        {actionLabel} <span aria-hidden="true">→</span>
      </Link>
    )}
  </div>
);
