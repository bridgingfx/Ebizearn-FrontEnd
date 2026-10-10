import React from 'react';
import { CheckCircle2, Clock, Hourglass, RotateCcw, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';

type Tone = 'sky' | 'amber' | 'orange' | 'blue' | 'violet' | 'emerald' | 'red' | 'gray';

const TONES: Record<Tone, string> = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
  gray: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/15',
};

/**
 * One name for where a task stands, from the proof status and the reward
 * status: Submitted → Under review / Manual review → Verified (pending
 * duration) → Completed, or Rejected / Refunded / Reverification required.
 */
export function taskDisplayStatus(status: string | null | undefined, rewardStatus?: string | null): { label: string; tone: Tone; icon: React.ElementType; hint: string } {
  switch (rewardStatus) {
    case 'pending_duration':
      return { label: 'Verified · pending duration', tone: 'blue', icon: Hourglass, hint: 'Reward is in the pending balance until the final check.' };
    case 'reverification_required':
      return { label: 'Reverification required', tone: 'orange', icon: ShieldAlert, hint: 'The final check could not confirm the post — a person will review it.' };
    case 'released':
      return { label: 'Completed', tone: 'emerald', icon: CheckCircle2, hint: 'Reward released to the available balance.' };
    case 'refunded':
      return { label: 'Refunded', tone: 'red', icon: RotateCcw, hint: 'Reward cancelled and returned to the business that funded it.' };
  }
  switch (status) {
    case 'submitted':
    case 'checking':
      return { label: 'Submitted', tone: 'sky', icon: Clock, hint: 'Proof received — automatic check running.' };
    case 'under_review':
      return { label: 'Under review', tone: 'amber', icon: ShieldCheck, hint: 'Waiting for a reviewer.' };
    case 'action_required':
      return { label: 'Action required', tone: 'orange', icon: ShieldAlert, hint: 'The reviewer asked for changes.' };
    case 'approved':
      return { label: 'Verified', tone: 'emerald', icon: CheckCircle2, hint: 'Approved.' };
    case 'rejected':
      return { label: 'Rejected', tone: 'red', icon: XCircle, hint: 'Proof was not accepted.' };
    case 'in_progress':
    case 'reserved':
      return { label: 'In progress', tone: 'violet', icon: Clock, hint: 'Task started, no proof yet.' };
    case 'expired':
    case 'cancelled':
      return { label: 'Expired', tone: 'gray', icon: XCircle, hint: 'The slot expired.' };
    default:
      return { label: (status ?? 'unknown').replace(/_/g, ' '), tone: 'gray', icon: Clock, hint: '' };
  }
}

export const RewardStatusBadge: React.FC<{ status: string | null | undefined; rewardStatus?: string | null; className?: string }> = ({ status, rewardStatus, className = '' }) => {
  const d = taskDisplayStatus(status, rewardStatus);
  const Icon = d.icon;
  return (
    <span title={d.hint} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ring-1 ring-inset whitespace-nowrap ${TONES[d.tone]} ${className}`}>
      <Icon className="w-3 h-3" /> {d.label}
    </span>
  );
};
