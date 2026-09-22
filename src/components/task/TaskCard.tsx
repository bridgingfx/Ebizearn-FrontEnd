import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarDays, ShieldAlert, ChevronRight } from 'lucide-react';
import type { UiTask } from '../../types';
import { money } from '../../utils/apiMappers';

const platformBadge: Record<string, string> = {
  Instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  TikTok: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  YouTube: 'bg-red-50 text-red-700 border-red-200',
  Facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  'Google Reviews': 'bg-amber-50 text-amber-700 border-amber-200',
  Trustpilot: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WhatsApp: 'bg-green-50 text-green-700 border-green-200',
  LinkedIn: 'bg-sky-50 text-sky-700 border-sky-200',
};

export function humanizeRetention(hours: number): string {
  if (hours <= 0) return 'no retention required';
  if (hours < 24) return `${hours}-hour retention`;
  const days = Math.round(hours / 24);
  return days === 1 ? '24-hour retention' : `${days}-day retention`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function formatDeadline(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface TaskCardProps {
  task: UiTask;
  /** When the card is the "feed" variant we render a compact row instead. */
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const badge = platformBadge[task.platform] || 'bg-gray-100 text-gray-700 border-gray-200';
  const reward = money(task.reward_cents, 'USD');
  const deadline = formatDeadline(task.campaign?.ends_at);
  const retention = humanizeRetention(task.retentionHours);
  const requirements = task.campaign?.proof_requirements_json
    ? Object.entries(task.campaign.proof_requirements_json)
        .filter(([, required]) => required)
        .map(([key]) => key.replace(/_/g, ' '))
    : [];
  const slotsLeft = Math.max(0, task.slots_total - task.slots_taken);

  if (compact) {
    return (
      <Link
        to={`/app/tasks/${task.uuid || task.id}`}
        className="flex items-center gap-3 bg-white rounded-2xl border border-[#E7ECF3] p-3 hover:border-[#168BFF] hover:shadow-sm transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-[#07182F] text-white flex items-center justify-center text-xs font-black shrink-0">
          {initials(task.brandName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 truncate">{task.title}</p>
          <p className="text-[10px] text-gray-500 truncate">
            {task.brandName} · {task.platform} · {task.categoryName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-black text-[#16B364]">{reward}</p>
          <p className="text-[10px] text-gray-400">{task.estimated_minutes} min</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="bg-white rounded-3xl border border-[#E7ECF3] shadow-xs overflow-hidden flex flex-col hover:shadow-md hover:border-[#168BFF]/40 transition-all">
      <div className="p-5 pb-4 flex-1">
        {/* Company header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-[#07182F] text-white flex items-center justify-center text-sm font-black shrink-0">
            {initials(task.brandName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-gray-500 truncate">{task.brandName}</p>
            <h3 className="text-sm font-black text-gray-900 leading-snug">{task.title}</h3>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${badge}`}>{task.platform}</span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-gray-50 text-gray-600 border-gray-200">
            {task.categoryName}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-violet-50 text-violet-700 border-violet-200 capitalize">
            {task.difficulty}
          </span>
          {slotsLeft <= 5 && slotsLeft > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-amber-50 text-amber-700 border-amber-200">
              {slotsLeft} slot{slotsLeft === 1 ? '' : 's'} left
            </span>
          )}
        </div>

        {/* Reward / time / deadline */}
        <div className="flex items-center gap-4 text-[11px] text-gray-600 mb-3">
          <span className="text-sm font-black text-[#16B364]">{reward}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> ~{task.estimated_minutes} min
          </span>
          {deadline && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" /> Due {deadline}
            </span>
          )}
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <ul className="space-y-1 mb-3">
            {requirements.slice(0, 3).map((req) => (
              <li key={req} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#168BFF] mt-1.5 shrink-0" />
                <span className="capitalize">{req}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Retention notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-px" />
          <p className="text-[10px] text-amber-800 leading-snug">
            Reversing this action before the {retention} period ends can reverse this reward.
          </p>
        </div>
      </div>

      <Link
        to={`/app/tasks/${task.uuid || task.id}`}
        className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs font-black text-[#168BFF] hover:bg-blue-50/50 transition-colors"
      >
        <span>View &amp; complete task</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </article>
  );
};
