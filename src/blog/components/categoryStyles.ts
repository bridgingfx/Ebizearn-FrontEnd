/**
 * Accent styling per blog category — light + dark aware.
 * Keep flat and premium; no dot/grid patterns anywhere.
 */
import type { BlogCategory } from '../types';

interface CategoryStyle {
  badge: string;
  softBg: string;
  gradient: string;
}

const STYLES: Record<BlogCategory, CategoryStyle> = {
  'Getting Started': {
    badge: 'bg-blue-50 text-[#168BFF] dark:bg-blue-500/10 dark:text-blue-300',
    softBg: 'bg-blue-50/60 dark:bg-blue-500/10',
    gradient: 'from-[#0D2342] via-[#123A6B] to-[#168BFF]',
  },
  Instagram: {
    badge: 'bg-pink-50 text-[#C13584] dark:bg-pink-500/10 dark:text-pink-300',
    softBg: 'bg-pink-50/60 dark:bg-pink-500/10',
    gradient: 'from-[#3A0F2E] via-[#7A1E5C] to-[#C13584]',
  },
  TikTok: {
    badge: 'bg-cyan-50 text-[#0E7490] dark:bg-cyan-500/10 dark:text-cyan-300',
    softBg: 'bg-cyan-50/60 dark:bg-cyan-500/10',
    gradient: 'from-[#0B1B22] via-[#0E3B47] to-[#20C4E8]',
  },
  YouTube: {
    badge: 'bg-red-50 text-[#DC2626] dark:bg-red-500/10 dark:text-red-300',
    softBg: 'bg-red-50/60 dark:bg-red-500/10',
    gradient: 'from-[#2B0E12] via-[#6B1A22] to-[#DC2626]',
  },
  Facebook: {
    badge: 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-500/10 dark:text-indigo-300',
    softBg: 'bg-indigo-50/60 dark:bg-indigo-500/10',
    gradient: 'from-[#101A3A] via-[#1E2F7A] to-[#4F46E5]',
  },
  Referrals: {
    badge: 'bg-violet-50 text-[#7C3AED] dark:bg-violet-500/10 dark:text-violet-300',
    softBg: 'bg-violet-50/60 dark:bg-violet-500/10',
    gradient: 'from-[#1E1038] via-[#3D1F7A] to-[#7C3AED]',
  },
  'Payments & Withdrawals': {
    badge: 'bg-emerald-50 text-[#16B364] dark:bg-emerald-500/10 dark:text-emerald-300',
    softBg: 'bg-emerald-50/60 dark:bg-emerald-500/10',
    gradient: 'from-[#0B2417] via-[#0F5132] to-[#16B364]',
  },
  Safety: {
    badge: 'bg-amber-50 text-[#B45309] dark:bg-amber-500/10 dark:text-amber-300',
    softBg: 'bg-amber-50/60 dark:bg-amber-500/10',
    gradient: 'from-[#241708] via-[#7A4A0B] to-[#F79009]',
  },
  Georgia: {
    badge: 'bg-teal-50 text-[#0D9488] dark:bg-teal-500/10 dark:text-teal-300',
    softBg: 'bg-teal-50/60 dark:bg-teal-500/10',
    gradient: 'from-[#0A2027] via-[#0F4A52] to-[#0D9488]',
  },
};

export function categoryStyle(category: BlogCategory): CategoryStyle {
  return STYLES[category];
}
