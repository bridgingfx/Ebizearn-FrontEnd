import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { businessApi, getApiError } from '../../api';
import type { TaskSubmission } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

type Filter = 'all' | 'pending' | 'verified' | 'rejected';

export const BusinessSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<TaskSubmission | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessApi.submissions();
      if (res.success) {
        setSubmissions(res.data || []);
      } else {
        setError(res.message || 'Could not load submissions.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load submissions.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      const status = s.status;
      const filterOk =
        filter === 'all' ||
        (filter === 'pending' && ['submitted', 'under_review', 'action_required'].includes(status)) ||
        (filter === 'verified' && status === 'approved') ||
        (filter === 'rejected' && status === 'rejected');
      const qOk =
        !q ||
        (s.user?.name || '').toLowerCase().includes(q) ||
        (s.task?.title || '').toLowerCase().includes(q);
      return filterOk && qOk;
    });
  }, [submissions, search, filter]);

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const statusStyle = (status: string) => {
    if (status === 'approved') return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    if (status === 'rejected') return 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300';
    if (status === 'action_required') return 'bg-purple-100 text-purple-700';
    return 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Proof Gallery</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real proof submitted by contributors for your campaigns. Final verification decisions are made in the
          Admin Verification Center.
        </p>
      </div>

      {/* Tabs + search */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === t.id ? 'bg-[#07182F] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contributor or task…"
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading submissions…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load submissions</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title={submissions.length === 0 ? 'No submissions yet' : 'No submissions match your filter'}
          description={
            submissions.length === 0
              ? 'Once contributors submit proof for your campaigns, you will see it here.'
              : 'Try a different search term or tab.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle(String(s.status))}`}
                >
                  {String(s.status).replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">{s.task?.title || `Task #${s.task_id}`}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                by <span className="font-bold">{s.user?.name || 'Contributor'}</span>
              </p>
              {s.proof_data_json?.text_answer && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 bg-gray-50 dark:bg-white/5 rounded-lg p-2.5">
                  {s.proof_data_json.text_answer}
                </p>
              )}
              {s.proof_data_json?.note && !s.proof_data_json?.text_answer && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 bg-gray-50 dark:bg-white/5 rounded-lg p-2.5">
                  {s.proof_data_json.note}
                </p>
              )}
              <button
                type="button"
                onClick={() => setSelected(s)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline"
              >
                <ImageIcon className="w-3.5 h-3.5" /> View proof
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Proof detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                  {selected.task?.title || `Submission #${selected.id}`}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  by {selected.user?.name || 'Contributor'} ·{' '}
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${statusStyle(String(selected.status))}`}
            >
              {String(selected.status).replace(/_/g, ' ')}
            </span>

            {selected.proof_data_json?.url && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Submitted link</p>
                <a
                  href={selected.proof_data_json.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {selected.proof_data_json.url}
                </a>
              </div>
            )}

            {(selected.proof_data_json?.text_answer || selected.proof_data_json?.note) && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Submitted proof</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selected.proof_data_json.text_answer || selected.proof_data_json.note}
                </p>
              </div>
            )}

            {selected.files && selected.files.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Attachments</p>
                <div className="space-y-2">
                  {selected.files.map((f) => (
                    <a
                      key={f.id}
                      href={f.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-[#168BFF] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {f.mime_type || 'View file'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selected.aiResult && (
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 mb-4">
                <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">AI pre-screen</p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Suggested:{' '}
                  <span className="font-bold">
                    {String(selected.aiResult.suggested_decision).replace(/_/g, ' ')}
                  </span>{' '}
                  · confidence {Math.round(Number(selected.aiResult.confidence_score) || 0)}%
                  {(selected.aiResult.ai_label || (selected.aiResult.ai_simulated === false ? '' : 'Simulated heuristic (pre-launch)')) && (
                    <span className="text-blue-600">
                      {' '}· {selected.aiResult.ai_label || 'Simulated heuristic (pre-launch)'}
                    </span>
                  )}
                </p>
                {selected.aiResult.analysis_summary && (
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1.5">{selected.aiResult.analysis_summary}</p>
                )}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-bold mb-1">Approve / reject as a business</p>
              <p>
                Business-side review actions are not available in the current backend API. Final decisions are
                made in the Admin Verification Center.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
