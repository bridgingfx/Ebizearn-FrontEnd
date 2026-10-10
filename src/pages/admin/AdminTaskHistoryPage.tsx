import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  History,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  Video,
  X,
  Hourglass,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { taskHistoryApi, getApiError } from '../../api';
import type { TaskHistoryFilter, TaskHistoryRow } from '../../api';
import { PageHeader, SearchInput, LoadingBlock, ErrorBlock, fmtMoney } from '../../components/common/ui';
import { RewardStatusBadge } from '../../components/task/RewardStatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';
import { PlatformBrandIcon } from '../../components/common/PlatformBrandIcon';

const TABS: { value: TaskHistoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'in_review', label: 'In review' },
  { value: 'action_required', label: 'Action required' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_duration', label: 'Pending duration' },
  { value: 'reverification_required', label: 'Reverification' },
  { value: 'released', label: 'Completed' },
  { value: 'refunded', label: 'Refunded' },
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'WhatsApp', 'LinkedIn', 'Google Reviews', 'Trustpilot'];

const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/** Proof chips: link / photos / videos, with the first photo as a thumbnail. */
const ProofSummary: React.FC<{ row: TaskHistoryRow }> = ({ row }) => {
  const { proof } = row;
  if (!row.submission_id) return <span className="text-[11px] text-gray-400 dark:text-gray-500">Not submitted</span>;
  return (
    <div className="flex items-center gap-2">
      {proof.thumb ? (
        <img src={proof.thumb} alt="" loading="lazy" className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-white/10 shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
          <ClipboardList className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {proof.has_link && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[10px] font-bold text-blue-700 dark:text-blue-300">
            <Link2 className="w-3 h-3" /> Link
          </span>
        )}
        {proof.images > 0 && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-500/10 text-[10px] font-bold text-violet-700 dark:text-violet-300">
            <ImageIcon className="w-3 h-3" /> {proof.images}
          </span>
        )}
        {proof.videos > 0 && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-[10px] font-bold text-rose-700 dark:text-rose-300">
            <Video className="w-3 h-3" /> {proof.videos}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Admin → Task History: every task a contributor took — who, which task,
 * what proof they sent and where it stands. "View" opens the full record
 * with the proof files and status controls.
 */
export const AdminTaskHistoryPage: React.FC = () => {
  const [rows, setRows] = useState<TaskHistoryRow[]>([]);
  const [counts, setCounts] = useState<Partial<Record<TaskHistoryFilter, number>>>({});
  const [totals, setTotals] = useState<{ pending_cents: number; released_cents: number; refunded_cents: number } | null>(null);
  const [tab, setTab] = useState<TaskHistoryFilter>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskHistoryApi.list({ status: tab, search: query || undefined, platform: platform || undefined, from: from || undefined, to: to || undefined, page });
      setRows(res.data);
      setCounts(res.meta.counts);
      setTotals(res.meta.totals ?? null);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } catch (e) {
      setError(getApiError(e, 'Could not load task history.'));
    } finally {
      setLoading(false);
    }
  }, [tab, query, platform, from, to, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasFilters = !!(query || platform || from || to);
  const clearFilters = () => {
    setSearch('');
    setQuery('');
    setPlatform('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const inputCls =
    'h-9 px-3 text-sm bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/40 focus:border-[#168BFF]';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task History"
        subtitle="Every task a contributor took — who did it, the proof they sent and its status. Open a record to see the photos, videos and links, and change the status."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      {/* Rewards held / paid / returned */}
      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'pending_duration' as const, label: 'Held in pending balances', value: totals.pending_cents, icon: Hourglass, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-300' },
            { key: 'released' as const, label: 'Released to contributors', value: totals.released_cents, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300' },
            { key: 'refunded' as const, label: 'Refunded to funders', value: totals.refunded_cents, icon: RotateCcw, tone: 'text-red-600 bg-red-50 dark:bg-red-500/15 dark:text-red-300' },
          ].map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => { setTab(c.key); setPage(1); }}
              className={`text-left bg-white dark:bg-[#0C1322] rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${tab === c.key ? 'border-[#168BFF]/50' : 'border-[#E7ECF3] dark:border-white/10'}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{c.label}</p>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.tone}`}><c.icon className="w-4 h-4" /></span>
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{fmtMoney(c.value)}</p>
            </button>
          ))}
        </div>
      )}

      {/* Status tabs with live counts */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTab(t.value);
                setPage(1);
              }}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-[#07182F] dark:bg-[#168BFF] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0C1322] text-gray-600 dark:text-gray-300 border border-[#E7ECF3] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              {t.label}
              <span className={`min-w-[20px] px-1.5 py-0.5 rounded-md text-[10px] tabular-nums ${active ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
                {counts[t.value] ?? '·'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-3 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search contributor or task…" />
        <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }} className={inputCls} aria-label="Platform">
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={inputCls} aria-label="From date" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={inputCls} aria-label="To date" />
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 px-3 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 tabular-nums">{total.toLocaleString()} records</span>
      </div>

      {error ? (
        <ErrorBlock message={error} onRetry={() => void load()} />
      ) : loading && rows.length === 0 ? (
        <LoadingBlock label="Loading task history…" />
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-12 text-center">
          <History className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm font-bold text-gray-700 dark:text-gray-200">No tasks here yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hasFilters ? 'Try clearing the filters.' : 'When contributors start tasks, they show up here.'}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={`hidden lg:block bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 overflow-hidden transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-white/[0.03] text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  <th className="px-5 py-3">Contributor</th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Proof</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timeline</th>
                  <th className="px-5 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar src={r.user?.avatar_url} name={r.user?.name} email={r.user?.email} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{r.user?.name ?? 'Deleted user'}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                            {r.user?.email}
                            {r.user?.country_code ? ` · ${r.user.country_code}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {r.task?.platform && <PlatformBrandIcon platform={r.task.platform} className="w-7 h-7 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[220px]">{r.task?.title ?? '—'}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                            {r.task?.business ?? '—'} · <span className="font-bold text-[#16B364]">{fmtMoney(r.task?.reward_cents)}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><ProofSummary row={r} /></td>
                    <td className="px-4 py-3.5"><RewardStatusBadge status={r.status} rewardStatus={r.reward_status} /></td>
                    <td className="px-4 py-3.5 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed whitespace-nowrap">
                      <p>Started {when(r.started_at)}</p>
                      {r.submitted_at && <p>Submitted {when(r.submitted_at)}</p>}
                      {r.reward_status === 'pending_duration' && r.final_check_due_at && (
                        <p className="text-blue-600 dark:text-blue-300 font-semibold">Final check {when(r.final_check_due_at)}</p>
                      )}
                      {r.auto_verify_status && r.auto_verify_status !== 'done' && <p className="text-amber-600 font-semibold">AI check running…</p>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/task-history/${r.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#168BFF]/10 hover:bg-[#168BFF]/15 text-[#168BFF] dark:text-blue-300 text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className={`lg:hidden space-y-3 ${loading ? 'opacity-60' : ''}`}>
            {rows.map((r) => (
              <Link
                key={r.id}
                to={`/admin/task-history/${r.id}`}
                className="block bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-4 hover:border-[#168BFF]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar src={r.user?.avatar_url} name={r.user?.name} email={r.user?.email} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{r.user?.name ?? 'Deleted user'}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{r.user?.email}</p>
                    </div>
                  </div>
                  <RewardStatusBadge status={r.status} rewardStatus={r.reward_status} />
                </div>
                <div className="mt-3 flex items-center gap-2.5 min-w-0">
                  {r.task?.platform && <PlatformBrandIcon platform={r.task.platform} className="w-6 h-6 shrink-0" />}
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{r.task?.title}</p>
                  <span className="ml-auto text-xs font-black text-[#16B364] shrink-0">{fmtMoney(r.task?.reward_cents)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <ProofSummary row={r} />
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {when(r.submitted_at ?? r.started_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {lastPage}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  type="button"
                  disabled={page >= lastPage || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
