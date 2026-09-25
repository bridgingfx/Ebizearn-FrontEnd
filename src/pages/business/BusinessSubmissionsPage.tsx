import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  XCircle,
  Clock,
} from 'lucide-react';
import { businessApi, getApiError } from '../../api';
import { toast } from '../../utils/toast';
import type { TaskSubmission } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

type Filter = 'all' | 'review' | 'awaiting' | 'verified' | 'rejected';

type ReviewKey = 'review' | 'you_approved' | 'you_rejected' | 'approved' | 'rejected' | 'action_required';

/** Where a proof is in the two-step review (business first, then eBizEarn staff). */
const reviewState = (s: TaskSubmission): { key: ReviewKey; label: string; style: string } => {
  if (s.status === 'approved') return { key: 'approved', label: 'Approved · paid', style: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' };
  if (s.status === 'rejected') return { key: 'rejected', label: 'Rejected', style: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300' };
  if (s.business_decision === 'approved') return { key: 'you_approved', label: 'You approved · awaiting confirmation', style: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' };
  if (s.business_decision === 'rejected') return { key: 'you_rejected', label: 'You rejected · awaiting confirmation', style: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300' };
  if (s.status === 'action_required') return { key: 'action_required', label: 'More proof requested', style: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300' };
  return { key: 'review', label: 'Needs your review', style: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300' };
};

/** Business approve / reject for one proof. Final confirmation and payment are done by staff. */
const DecisionPanel: React.FC<{ submission: TaskSubmission; onUpdated: (s: TaskSubmission) => void }> = ({ submission, onUpdated }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const final = submission.status === 'approved' || submission.status === 'rejected';

  const decide = async (decision: 'approve' | 'reject') => {
    if (decision === 'reject' && reason.trim().length < 3) {
      toast.error('Tell the contributor why the proof is rejected.');
      return;
    }
    setBusy(decision);
    try {
      const res = await businessApi.reviewSubmission(submission.uuid || submission.id, decision, decision === 'reject' ? reason.trim() : undefined);
      onUpdated(res.data);
      setRejecting(false);
      setReason('');
    } catch {
      // The API client already shows the error as a toast.
    } finally {
      setBusy(null);
    }
  };

  if (final) {
    const approved = submission.status === 'approved';
    return (
      <div className={`rounded-xl border p-4 text-xs ${approved ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'}`}>
        <p className="font-bold flex items-center gap-1.5">
          {approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {approved ? 'Approved and paid to the contributor' : 'Rejected'}
        </p>
        <p className="mt-1 opacity-90">
          Confirmed by the eBizEarn review team{submission.reviewed_at ? ` on ${new Date(submission.reviewed_at).toLocaleString()}` : ''}.
          {submission.business_decision && ` You ${submission.business_decision} it${submission.business_reviewer?.name ? ` (${submission.business_reviewer.name})` : ''}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Your decision</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {submission.business_decision
            ? `You ${submission.business_decision} this proof${submission.business_reviewer?.name ? ` (${submission.business_reviewer.name})` : ''}${submission.business_reviewed_at ? ` on ${new Date(submission.business_reviewed_at).toLocaleString()}` : ''}. You can change it until our review team confirms.`
            : 'Does this proof meet your task requirements? Our review team confirms your decision before the contributor is paid.'}
        </p>
        {submission.business_decision === 'rejected' && submission.business_reason && (
          <p className="mt-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">Reason: {submission.business_reason}</p>
        )}
      </div>

      {rejecting ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this proof rejected? e.g. The screenshot doesn't show the follow."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => decide('reject')} disabled={busy !== null} className="h-9 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 inline-flex items-center gap-1.5">
              {busy === 'reject' && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm rejection
            </button>
            <button type="button" onClick={() => setRejecting(false)} className="h-9 px-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide('approve')}
            disabled={busy !== null || submission.business_decision === 'approved'}
            className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {busy === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {submission.business_decision === 'approved' ? 'Approved' : 'Approve proof'}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={busy !== null || submission.business_decision === 'rejected'}
            className="h-10 px-5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            {submission.business_decision === 'rejected' ? 'Rejected' : 'Reject proof'}
          </button>
        </div>
      )}
    </div>
  );
};

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

  const onUpdated = (updated: TaskSubmission) => {
    setSubmissions((list) => list.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
    setSelected((cur) => (cur && cur.id === updated.id ? { ...cur, ...updated } : cur));
  };

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: submissions.length, review: 0, awaiting: 0, verified: 0, rejected: 0 };
    submissions.forEach((s) => {
      const key = reviewState(s).key;
      if (key === 'review') c.review++;
      else if (key === 'you_approved' || key === 'you_rejected') c.awaiting++;
      else if (key === 'approved') c.verified++;
      else if (key === 'rejected') c.rejected++;
    });
    return c;
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      const key = reviewState(s).key;
      const filterOk =
        filter === 'all' ||
        (filter === 'review' && key === 'review') ||
        (filter === 'awaiting' && (key === 'you_approved' || key === 'you_rejected')) ||
        (filter === 'verified' && key === 'approved') ||
        (filter === 'rejected' && key === 'rejected');
      const qOk =
        !q ||
        (s.user?.name || '').toLowerCase().includes(q) ||
        (s.task?.title || '').toLowerCase().includes(q);
      return filterOk && qOk;
    });
  }, [submissions, search, filter]);

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'review', label: 'Needs review' },
    { id: 'awaiting', label: 'Awaiting confirmation' },
    { id: 'verified', label: 'Approved & paid' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Proof Gallery</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Approve or reject the proof contributors submit for your campaigns. The eBizEarn review team confirms each
          decision, and approved work is then paid from your campaign budget.
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
              <span className="ml-1.5 opacity-60">{counts[t.id]}</span>
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
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${reviewState(s).style}`}>
                  {reviewState(s).label}
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
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(s)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> {reviewState(s).key === 'review' ? 'Review proof' : 'View proof'}
                </button>
                {reviewState(s).key === 'review' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                    <Clock className="w-3 h-3" /> Needs your decision
                  </span>
                )}
              </div>
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

            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${reviewState(selected).style}`}>
              {reviewState(selected).label}
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

            <DecisionPanel submission={selected} onUpdated={onUpdated} />
          </div>
        </div>
      )}
    </div>
  );
};
