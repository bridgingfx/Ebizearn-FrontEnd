import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Flag,
  Gavel,
  Image as ImageIcon,
  Loader2,
  PlayCircle,
  RotateCcw,
  Send,
  Store,
  Timer,
  Wallet,
  XCircle,
} from 'lucide-react';
import { contributorHistoryApi, getApiError } from '../../api';
import type { ContributorHistoryDetail, ContributorHistoryEvent } from '../../api';
import { useMoney } from '../../hooks/useMoney';
import { PlatformBrandIcon } from '../../components/common/PlatformBrandIcon';
import { RewardStatusBadge } from '../../components/task/RewardStatusBadge';

const ICONS: Record<ContributorHistoryEvent['kind'], React.ElementType> = {
  started: PlayCircle,
  submitted: Send,
  evidence: ImageIcon,
  verification: Bot,
  business: Store,
  decision: Gavel,
  payment: Wallet,
  scheduled: CalendarClock,
  refund: RotateCcw,
  expired: Timer,
  final: Flag,
};

const TONE: Record<ContributorHistoryEvent['tone'], string> = {
  info: 'bg-blue-50 text-[#168BFF] ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20',
  success: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20',
  warning: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20',
  danger: 'bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/20',
  muted: 'bg-gray-50 text-gray-400 ring-gray-100 dark:bg-white/5 dark:text-gray-500 dark:ring-white/10',
};

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Contributor → Task History → one task: requirements, proof, and every step in order. */
export const ContributorTaskHistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fmt } = useMoney();
  const [data, setData] = useState<ContributorHistoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    contributorHistoryApi
      .show(id)
      .then((res) => setData(res.data))
      .catch((e) => setError(getApiError(e, 'This task could not be found in your history.')));
  }, [id]);

  const back = (
    <Link to="/app/task-history" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
      <ArrowLeft className="w-4 h-4" /> Task History
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-4 max-w-4xl">
        {back}
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-7 h-7 animate-spin inline-block text-[#168BFF]" />
      </div>
    );
  }

  const { task, submission, timeline } = data;

  return (
    <div className="space-y-5 max-w-4xl">
      {back}

      {/* Header */}
      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
            {task?.platform ? <PlatformBrandIcon platform={task.platform} className="w-8 h-8" /> : <ClipboardList className="w-6 h-6 text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <RewardStatusBadge status={data.status} rewardStatus={data.reward_status} />
            <h1 className="mt-1.5 text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 leading-snug">{task?.title ?? 'Task removed'}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {[task?.brand, task?.category, task?.platform].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reward</p>
            <p className={`text-xl font-black ${data.reward_status === 'refunded' || data.status === 'rejected' ? 'text-gray-400 line-through' : 'text-[#16B364]'}`}>
              {task ? fmt(task.reward_cents) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5 items-start">
        {/* Timeline */}
        <section className="lg:col-span-3 bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5 sm:p-6">
          <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-4">History</h2>
          {timeline.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No history recorded for this task yet.</p>
          ) : (
            <ol className="relative">
              {timeline.map((e, i) => {
                const Icon = ICONS[e.kind] ?? CheckCircle2;
                const last = i === timeline.length - 1;
                return (
                  <li key={`${e.kind}-${e.at}-${i}`} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {!last && <span className="absolute left-[17px] top-9 bottom-0 w-px bg-gray-200 dark:bg-white/10" />}
                    <span className={`w-9 h-9 rounded-full ring-4 flex items-center justify-center shrink-0 ${TONE[e.tone]}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className={`text-sm font-bold ${e.tone === 'muted' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{e.title}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{e.kind === 'scheduled' ? `Scheduled for ${when(e.at)}` : when(e.at)}</p>
                      {e.detail && <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{e.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="lg:col-span-2 space-y-5">
          {/* Your proof */}
          <section className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5">
            <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Your proof</h2>
            {!submission ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No proof submitted.{' '}
                {task?.still_available && (
                  <Link to={`/app/tasks/${task.uuid}`} className="font-bold text-[#168BFF] hover:underline">Open the task</Link>
                )}
              </p>
            ) : (
              <div className="space-y-3">
                {submission.files.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {submission.files.map((f) => (
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <img src={f.url} alt="Your screenshot" loading="lazy" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                {submission.proof.url && (
                  <a href={submission.proof.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline break-all">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {submission.proof.url}
                  </a>
                )}
                {submission.proof.text_answer && <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-xl p-3 whitespace-pre-wrap">{submission.proof.text_answer}</p>}
                {submission.proof.note && <p className="text-xs italic text-gray-500">{submission.proof.note}</p>}
                {submission.review_notes && (
                  <div className={`text-xs rounded-xl p-3 border ${submission.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-200' : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300'}`}>
                    <span className="font-bold block mb-0.5">{submission.status === 'rejected' ? <XCircle className="w-3.5 h-3.5 inline mr-1" /> : null}Reviewer note</span>
                    {submission.review_notes}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Task requirements */}
          {task && (
            <section className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Task requirements</h2>
              <dl className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Duration</dt>
                  <dd className="text-sm font-bold text-gray-900 dark:text-gray-100">{task.duration_days > 0 ? `${task.duration_days} days` : 'Paid on approval'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Platform</dt>
                  <dd className="text-sm font-bold text-gray-900 dark:text-gray-100">{task.platform ?? '—'}</dd>
                </div>
              </dl>
              {(task.instructions || task.description) && (
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-white/5 rounded-xl p-3">{task.instructions || task.description}</p>
              )}
              {task.target_url && (
                <a href={task.target_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#168BFF] hover:underline break-all">
                  <ExternalLink className="w-3 h-3 shrink-0" /> {task.target_url}
                </a>
              )}
            </section>
          )}

          {/* Payments */}
          {data.ledger.length > 0 && (
            <section className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Payments</h2>
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {data.ledger.map((t, i) => (
                  <li key={i} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0">
                      <span className="font-bold text-gray-800 dark:text-gray-200 capitalize block">{t.type.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-gray-400">{when(t.created_at)}</span>
                    </span>
                    <span className={`font-black tabular-nums ${t.amount_cents >= 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {t.amount_cents >= 0 ? '+' : '−'}{fmt(Math.abs(t.amount_cents))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-gray-400">"Retention hold" moves the reward to your pending balance until the final check.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
