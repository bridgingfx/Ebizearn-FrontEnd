import React from 'react';
import { Building2, CheckCircle2, Eye, Loader2, Pause, Pencil, Play, Trash2 } from 'lucide-react';
import type { Campaign } from '../../types';
import { PlatformMark } from '../task/TaskCard';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  pending_review: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
  draft: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400',
  paused: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
  completed: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
  cancelled: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = { pending_review: 'In review' };

/** Rewards released so far: total budget minus what is still in the pool. */
export const campaignSpent = (c: Campaign) => Math.max(0, (c.total_budget_cents ?? 0) - (c.remaining_budget_cents ?? 0));

const iconBtn =
  'p-1.5 rounded-lg text-gray-400 dark:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Campaign tile shared by the business portal and the admin panel. Every
 * action is optional — pass a handler only when the viewer may do it.
 */
export const CampaignCard: React.FC<{
  campaign: Campaign;
  fmt: (cents: number) => string;
  showBusiness?: boolean;
  busy?: boolean;
  onToggle?: (c: Campaign) => void;
  onApprove?: (c: Campaign) => void;
  onEdit?: (c: Campaign) => void;
  onDelete?: (c: Campaign) => void;
  /** Link element or button for "View details" / "Continue editing". */
  detailsAction?: React.ReactNode;
}> = ({ campaign: c, fmt, showBusiness, busy, onToggle, onApprove, onEdit, onDelete, detailsAction }) => {
  const canToggle = onToggle && (c.status === 'active' || c.status === 'paused');
  const canApprove = onApprove && c.status === 'pending_review';
  const closed = c.status === 'completed' || c.status === 'cancelled';
  const progress =
    c.target_contributors_count > 0
      ? Math.min(100, Math.round(((c.completed_contributors_count ?? 0) / c.target_contributors_count) * 100))
      : 0;

  return (
    <div className="group bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status] ?? STATUS_STYLES.draft}`}>
          {STATUS_LABELS[c.status] ?? c.status}
        </span>
        <div className="flex items-center gap-1">
          {busy && <Loader2 className="w-4 h-4 animate-spin text-[#168BFF] mr-1" />}
          {canApprove && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onApprove(c)}
              title="Approve and publish this campaign"
              aria-label={`Approve ${c.title}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-[11px] font-bold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {canToggle && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggle(c)}
              title={c.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
              aria-label={c.status === 'active' ? `Pause ${c.title}` : `Resume ${c.title}`}
              className={`${iconBtn} hover:text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10`}
            >
              {c.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
          {onEdit && !closed && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(c)}
              title="Edit campaign"
              aria-label={`Edit ${c.title}`}
              className={`${iconBtn} hover:text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10`}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(c)}
              title="Delete campaign"
              aria-label={`Delete ${c.title}`}
              className={`${iconBtn} hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 mb-1">
        {c.platform && (
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <PlatformMark platform={c.platform} className="w-5 h-5" />
          </div>
        )}
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 leading-snug flex-1">{c.title}</h3>
      </div>
      {showBusiness && (
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
          <Building2 className="w-3.5 h-3.5" />
          {c.business?.company_name ?? `Business #${c.business_id}`}
        </p>
      )}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{c.description}</p>

      <div className="grid grid-cols-3 gap-2 text-center mb-3 mt-auto">
        <Stat value={fmt(c.reward_per_task_cents)} label="per task" />
        <Stat value={`${c.completed_contributors_count ?? 0}/${c.target_contributors_count ?? 0}`} label="done" />
        <Stat value={fmt(campaignSpent(c))} label="spent" />
      </div>

      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden mb-4" aria-label={`${progress}% complete`}>
        <div className="h-full rounded-full bg-[#168BFF] transition-all" style={{ width: `${progress}%` }} />
      </div>

      {detailsAction}
    </div>
  );
};

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-gray-50 dark:bg-white/5 rounded-xl py-2 px-1 min-w-0">
    <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100 truncate" title={value}>
      {value}
    </p>
    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{label}</p>
  </div>
);
