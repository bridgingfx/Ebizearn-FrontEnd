import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarDays, ShieldAlert, ArrowRight, Users } from 'lucide-react';
import type { UiTask } from '../../types';
import { money } from '../../utils/apiMappers';
import {
  InstagramLogo,
  TikTokLogo,
  YouTubeLogo,
  FacebookLogo,
  LinkedInLogo,
  MetaLogo,
  WhatsAppLogo,
  TrustpilotLogo,
  GoogleReviewLogo,
  XTwitterLogo,
} from '../common/PlatformIcons';

type LogoComponent = React.FC<{ className?: string }>;

/** Real platform brand marks (color accents stay true to each platform). */
const platformLogos: Record<string, LogoComponent> = {
  Instagram: InstagramLogo,
  TikTok: TikTokLogo,
  YouTube: YouTubeLogo,
  Facebook: FacebookLogo,
  Meta: MetaLogo,
  LinkedIn: LinkedInLogo,
  'Google Reviews': GoogleReviewLogo,
  Google: GoogleReviewLogo,
  Trustpilot: TrustpilotLogo,
  WhatsApp: WhatsAppLogo,
  X: XTwitterLogo,
  Twitter: XTwitterLogo,
};

/** Soft tinted tile behind each platform mark. */
const platformTile: Record<string, string> = {
  Instagram: 'bg-pink-50 dark:bg-white/10',
  TikTok: 'bg-slate-100 dark:bg-white/10',
  YouTube: 'bg-red-50 dark:bg-white/10',
  Facebook: 'bg-blue-50 dark:bg-white/10',
  Meta: 'bg-blue-50 dark:bg-white/10',
  LinkedIn: 'bg-sky-50 dark:bg-white/10',
  'Google Reviews': 'bg-white dark:bg-[#0C1322] border border-slate-200 dark:border-white/10',
  Google: 'bg-white dark:bg-[#0C1322] border border-slate-200 dark:border-white/10',
  Trustpilot: 'bg-emerald-50 dark:bg-white/10',
  WhatsApp: 'bg-green-50 dark:bg-white/10',
  X: 'bg-slate-100 dark:bg-white/10',
  Twitter: 'bg-slate-100 dark:bg-white/10',
};

export function humanizeRetention(hours: number): string {
  if (hours <= 0) return 'no retention required';
  if (hours < 24) return `${hours}-hour retention`;
  const days = Math.round(hours / 24);
  return days === 1 ? '24-hour retention' : `${days}-day retention`;
}

/**
 * Normalize proof requirements into a label list.
 * The campaign wizard submits an array (["Screenshot", …]); older campaigns
 * store an object map ({ screenshot: true, … }). Both must render correctly.
 */
export function proofRequirementLabels(
  json?: Record<string, unknown> | string[] | null,
): string[] {
  if (Array.isArray(json)) return json.map((v) => String(v));
  if (json && typeof json === 'object') {
    return Object.entries(json)
      .filter(([, required]) => Boolean(required))
      .map(([key]) => key.replace(/_/g, ' '));
  }
  return [];
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

export const PlatformMark: React.FC<{ platform: string; className?: string }> = ({
  platform,
  className = 'w-6 h-6',
}) => {
  const Logo = platformLogos[platform];
  if (!Logo) return null;
  return <Logo className={className} />;
};

interface TaskCardProps {
  task: UiTask;
  /** When the card is the "feed" variant we render a compact row instead. */
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const detailUrl = `/app/tasks/${task.uuid || task.id}`;
  const reward = money(task.reward_cents, 'USD');
  const deadline = formatDeadline(task.campaign?.ends_at);
  const retention = humanizeRetention(task.retentionHours);
  const requirements = proofRequirementLabels(task.campaign?.proof_requirements_json);
  const slotsLeft = Math.max(0, task.slots_total - task.slots_taken);
  const tile = platformTile[task.platform] || 'bg-slate-100 dark:bg-white/10';

  if (compact) {
    return (
      <Link
        to={detailUrl}
        className="group flex items-center gap-3.5 bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.07] hover:border-[#168BFF]/50"
      >
        <div className={`w-12 h-12 rounded-2xl ${tile} flex items-center justify-center shrink-0`}>
          <PlatformMark platform={task.platform} className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-slate-900 dark:text-gray-100 truncate group-hover:text-[#168BFF] transition-colors">
            {task.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
            {task.brandName} · {task.platform} · {task.categoryName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-[#16B364]">{reward}</p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">{task.estimated_minutes} min</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#168BFF] group-hover:translate-x-0.5 transition-all shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      to={detailUrl}
      aria-label={`${task.title} — ${reward} reward. View and complete this task.`}
      className="group bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.08] hover:border-[#168BFF]/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168BFF]/30"
    >
      <div className="p-5 sm:p-6 pb-4 flex-1">
        {/* Brand + platform header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl ${tile} flex items-center justify-center shrink-0`}>
            <PlatformMark platform={task.platform} className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 truncate">{task.brandName}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 truncate mt-0.5">
              {task.platform} · {task.categoryName}
            </p>
          </div>
          {slotsLeft <= 5 && slotsLeft > 0 && (
            <span className="shrink-0 text-[11px] font-black px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
              {slotsLeft} left
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[1.05rem] font-extrabold text-slate-900 dark:text-gray-100 leading-snug group-hover:text-[#168BFF] transition-colors">
          {task.title}
        </h3>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-slate-500 dark:text-gray-400 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400 dark:text-gray-500" /> ~{task.estimated_minutes} min
          </span>
          {deadline && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400 dark:text-gray-500" /> Due {deadline}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 capitalize">
            <Users className="w-4 h-4 text-slate-400 dark:text-gray-500" /> {task.difficulty}
          </span>
        </div>

        {/* Instructions excerpt */}
        {task.postCopy && (
          <p className="mt-3 text-sm text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2">{task.postCopy}</p>
        )}

        {/* Proof requirements */}
        {requirements.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {requirements.slice(0, 2).map((req) => (
              <li key={req} className="text-[13px] text-slate-600 dark:text-gray-400 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#168BFF] mt-[7px] shrink-0" />
                <span className="capitalize">{req}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Retention notice */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/25">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
            Reversing this action before the {retention} period ends can reverse this reward.
          </p>
        </div>
      </div>

      {/* Reward + big CTA footer */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Reward</p>
          <p className="text-2xl font-black text-[#16B364] tracking-tight">{reward}</p>
        </div>
        <span className="flex items-center justify-center gap-2 w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-[#16B364] to-[#0EA968] text-white font-extrabold text-base shadow-lg shadow-emerald-500/25 group-hover:brightness-105 group-hover:shadow-xl transition-all">
          Start task
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
};
