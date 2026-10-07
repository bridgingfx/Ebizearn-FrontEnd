import React from 'react';
import { Sprout, Zap, ShieldCheck, Crown, Gem } from 'lucide-react';

/**
 * Premium rank badge — each tier gets a more prestigious look.
 * Starter (slate) → Contributor (emerald) → Trusted (blue) →
 * Pro (violet, glow) → Elite (gold, premium shine).
 */
export type RankLevel = 'starter' | 'explorer' | 'trusted' | 'pro' | 'elite';

interface RankStyle {
  label: string;
  Icon: React.ElementType;
  badge: string;
  iconColor: string;
  glow?: string;
}

const RANK_STYLES: Record<RankLevel, RankStyle> = {
  starter: {
    label: 'Starter',
    Icon: Sprout,
    badge: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
    iconColor: 'text-slate-500 dark:text-slate-400',
  },
  explorer: {
    label: 'Contributor',
    Icon: Zap,
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    iconColor: 'text-emerald-500',
  },
  trusted: {
    label: 'Trusted',
    Icon: ShieldCheck,
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    iconColor: 'text-blue-500',
  },
  pro: {
    label: 'Pro',
    Icon: Crown,
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
    iconColor: 'text-violet-500 dark:text-violet-300',
    glow: 'drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]',
  },
  elite: {
    label: 'Elite',
    Icon: Gem,
    badge: 'bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.35)]',
    iconColor: 'text-amber-500 dark:text-amber-300',
    glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  },
};

export const getRankStyle = (level?: string | null): RankStyle =>
  RANK_STYLES[(level as RankLevel) || 'starter'] || RANK_STYLES.starter;

interface RankBadgeProps {
  level?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const style = getRankStyle(level);
  const { Icon, label } = style;

  const sizes = {
    sm: { badge: 'px-2 py-0.5 text-[10px] gap-1', icon: 'w-3 h-3' },
    md: { badge: 'px-2.5 py-1 text-[11px] gap-1.5', icon: 'w-3.5 h-3.5' },
    lg: { badge: 'px-3.5 py-1.5 text-sm gap-2', icon: 'w-5 h-5' },
  }[size];

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-wider rounded-full border ${style.badge} ${sizes.badge} ${className}`}
    >
      <Icon className={`${sizes.icon} ${style.iconColor} ${style.glow || ''}`} />
      {showLabel && <span>{label}</span>}
    </span>
  );
};
