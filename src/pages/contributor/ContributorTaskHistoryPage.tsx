import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, History, Image as ImageIcon, Link2, Search, AlertCircle } from 'lucide-react';
import { contributorHistoryApi, getApiError } from '../../api';
import type { ContributorHistoryFilter, ContributorHistoryRow } from '../../api';
import { useMoney } from '../../hooks/useMoney';
import { EmptyState } from '../../components/common/EmptyState';
import { PlatformBrandIcon } from '../../components/common/PlatformBrandIcon';
import { RewardStatusBadge } from '../../components/task/RewardStatusBadge';

const TABS: { key: ContributorHistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'in_review', label: 'In review' },
  { key: 'pending_reward', label: 'Pending reward' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'expired', label: 'Expired' },
];

const day = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

/**
 * Contributor → Task History: every task you took, newest first, with its
 * status, proof and payment state. Tap one for its full step-by-step history.
 */
export const ContributorTaskHistoryPage: React.FC = () => {
  const { fmt } = useMoney();
  const [rows, setRows] = useState<ContributorHistoryRow[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ContributorHistoryFilter, number>>>({});
  const [tab, setTab] = useState<ContributorHistoryFilter>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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
      const res = await contributorHistoryApi.list({ status: tab, search: query || undefined, page });
      setRows(res.data);
      setCounts(res.meta.counts);
      setLastPage(res.meta.last_page);
    } catch (e) {
      setError(getApiError(e, 'Could not load your task history.'));
    } finally {
      setLoading(false);
    }
  }, [tab, query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#168BFF] text-white flex items-center justify-center shrink-0">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-gray-100">Task History</h1>
          <p className="text-xs text-[#667085] dark:text-gray-400 mt-0.5">Every task you took — open one to see each step, from start to payment.</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === t.key
                ? 'bg-[#168BFF] text-white shadow-sm'
                : 'bg-white dark:bg-[#0C1322] text-gray-600 dark:text-gray-300 border border-[#E7ECF3] dark:border-white/10'
            }`}
          >
            {t.label}
            <span className={`px-1.5 rounded-md text-[10px] ${tab === t.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>{counts[t.key] ?? '·'}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by task name"
          className="w-full h-11 pl-9 pr-3 rounded-2xl border border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
        />
      </div>

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : loading && rows.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={History}
          title={tab === 'all' && !query ? 'No task history yet' : 'Nothing here'}
          description={tab === 'all' && !query ? 'Tasks you start appear here with every step of their progress.' : 'Try another filter or search.'}
          actionLabel="Browse tasks"
          onAction={() => (window.location.href = '/app/tasks')}
        />
      ) : (
        <div className={`space-y-2.5 ${loading ? 'opacity-60' : ''}`}>
          {rows.map((r) => (
            <Link
              key={r.id}
              to={`/app/task-history/${r.id}`}
              className="flex items-center gap-3.5 bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-4 hover:border-[#168BFF]/40 hover:shadow-sm transition-all"
            >
              {r.proof.thumb ? (
                <img src={r.proof.thumb} alt="" loading="lazy" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                  {r.task?.platform ? <PlatformBrandIcon platform={r.task.platform} className="w-7 h-7" /> : <History className="w-5 h-5 text-gray-400" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <RewardStatusBadge status={r.status} rewardStatus={r.reward_status} className="!text-[10px] !py-0" />
                  {r.task?.category && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">{r.task.category}</span>}
                </div>
                <p className="mt-1 text-sm font-black text-gray-900 dark:text-gray-100 truncate">{r.task?.title ?? 'Task removed'}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2">
                  {r.task?.brand && <span>{r.task.brand}</span>}
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {r.submitted_at ? `Submitted ${day(r.submitted_at)}` : `Started ${day(r.started_at)}`}</span>
                  {r.proof.has_link && <span className="inline-flex items-center gap-0.5"><Link2 className="w-3 h-3" /> link</span>}
                  {r.proof.files > 0 && <span className="inline-flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> {r.proof.files}</span>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-black ${r.reward_status === 'refunded' || r.status === 'rejected' ? 'text-gray-400 line-through' : 'text-[#16B364]'}`}>
                  {r.task ? fmt(r.task.reward_cents) : '—'}
                </p>
                {r.reward_status === 'pending_duration' && r.final_check_due_at && (
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-300">until {day(r.final_check_due_at)}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold disabled:opacity-40">
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="text-xs text-gray-500">Page {page} of {lastPage}</span>
          <button type="button" disabled={page >= lastPage || loading} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold disabled:opacity-40">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
