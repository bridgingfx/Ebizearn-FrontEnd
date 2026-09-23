import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Eye,
  X,
  ShieldCheck,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { mapTaskForUi, money } from '../../utils/apiMappers';
import type { TaskSubmission, UiTask } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { VerificationTimeline } from '../../components/task/VerificationTimeline';

interface EnrichedSubmission extends TaskSubmission {
  uiTask: UiTask | null;
}

const STATUS_META: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  submitted: { label: 'Submitted', className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30', icon: Clock },
  under_review: { label: 'Under review', className: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30', icon: ShieldCheck },
  approved: { label: 'Approved', className: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30', icon: AlertCircle },
  action_required: { label: 'Action required', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under review' },
  { key: 'approved', label: 'Approved' },
  { key: 'action_required', label: 'Action required' },
  { key: 'rejected', label: 'Rejected' },
] as const;

export const ContributorMyTasksPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<EnrichedSubmission | null>(null);

  const fetchMine = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.myTasks();
      if (res.success) {
        setSubmissions(
          (res.data || []).map((s) => ({
            ...s,
            uiTask: s.task ? mapTaskForUi(s.task) : null,
          }))
        );
      } else {
        setError('Could not load your task history.');
      }
    } catch (err) {
      setError(getApiError(err, 'Could not load your task history.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (q) {
        const hay = `${s.uiTask?.title || ''} ${s.uiTask?.brandName || ''} ${s.uiTask?.platform || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [submissions, filter, search]);

  const countFor = (key: string) => (key === 'all' ? submissions.length : submissions.filter((s) => s.status === key).length);

  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-gray-100">My Tasks</h1>
          <p className="text-xs text-[#667085] dark:text-gray-400 mt-0.5">
            Your submissions and their real verification status.
          </p>
        </div>
        <Link
          to="/app/tasks"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#07182F] hover:bg-[#168BFF] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
        >
          Find more tasks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl p-3 sm:p-4 border border-[#E7ECF3] dark:border-white/10 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filter === tab.key ? 'bg-[#07182F] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-px rounded-full ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                {countFor(tab.key)}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by task, company, or platform…"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#168BFF]"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={fetchMine}
            className="mt-3 px-5 py-2 rounded-xl bg-[#07182F] text-white text-xs font-bold hover:bg-[#168BFF] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={submissions.length === 0 ? 'No submissions yet' : 'Nothing matches these filters'}
          description={
            submissions.length === 0
              ? 'You haven\'t started a task yet. Browse available tasks, complete the real action on the platform, and submit your proof.'
              : 'Try a different status or search term.'
          }
          icon={ClipboardList}
          actionLabel={submissions.length === 0 ? 'Browse available tasks' : 'Clear filters'}
          onAction={() => {
            if (submissions.length === 0) window.location.href = '/app/tasks';
            else {
              setFilter('all');
              setSearch('');
            }
          }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const meta = STATUS_META[s.status] || { label: s.status.replace(/_/g, ' '), className: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10', icon: Clock };
            const Icon = meta.icon;
            const task = s.uiTask;
            return (
              <div key={s.id} className="bg-white dark:bg-[#0C1322] rounded-2xl p-4 sm:p-5 border border-[#E7ECF3] dark:border-white/10 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.className}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      {task && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">{task.platform}</span>
                      )}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        Submitted {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">{task?.title || `Task #${s.task_id}`}</h3>
                    {task && <p className="text-[11px] text-gray-500 dark:text-gray-400">{task.brandName}</p>}
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-base font-black text-[#16B364]">{task ? money(task.reward_cents) : '—'}</p>
                    {s.aiResult && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {s.aiResult.ai_label || (s.aiResult.ai_simulated ? 'Simulated check' : 'AI check')}: {Math.round((s.aiResult.confidence_score || 0) * 100)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Verification timeline */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                  <VerificationTimeline status={s.status} aiResult={s.aiResult} />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" /> View proof
                  </button>
                  {task && (
                    <Link
                      to={`/app/tasks/${task.uuid || task.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#168BFF] hover:underline"
                    >
                      Open task <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proof detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Submission #{selected.id}</p>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100">{selected.uiTask?.title || `Task #${selected.task_id}`}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close">
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {selected.files && selected.files.length > 0 && (
              <div className="space-y-2">
                {selected.files.map((f) => (
                  <div key={f.id} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-900 flex items-center justify-center">
                    <img src={f.file_url} alt="Proof" className="w-full max-h-72 object-contain" />
                  </div>
                ))}
              </div>
            )}

            {selected.proof_data_json?.url && (
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold block mb-0.5">Proof URL</span>
                <a href={selected.proof_data_json.url} target="_blank" rel="noreferrer" className="text-[#168BFF] hover:underline font-mono break-all">
                  {selected.proof_data_json.url}
                </a>
              </div>
            )}

            {selected.proof_data_json?.text_answer && (
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold block mb-0.5">Answer</span>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selected.proof_data_json.text_answer}</p>
              </div>
            )}

            {selected.proof_data_json?.note && (
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-bold block mb-0.5">Note</span>
                <p className="text-gray-700 dark:text-gray-300 italic">{selected.proof_data_json.note}</p>
              </div>
            )}

            {selected.review_notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/15 rounded-xl border border-amber-200 dark:border-amber-500/30 text-xs">
                <span className="text-amber-800 dark:text-amber-200 font-bold block mb-0.5">Reviewer note</span>
                <p className="text-amber-900">{selected.review_notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-white/10">
              <VerificationTimeline status={selected.status} aiResult={selected.aiResult} />
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="w-full py-2.5 bg-[#07182F] text-white rounded-xl text-xs font-bold hover:bg-[#168BFF] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
