import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronDown, Gavel, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { adminApi, getApiError } from '../../api';

interface Appeal {
  id: number;
  uuid: string;
  submission_id: number;
  reason: string;
  status: 'open' | 'upheld' | 'denied';
  created_at: string;
  review_notes: string | null;
  submission?: { id: number; task?: { title: string } };
  user?: { name: string; profile?: { display_name?: string } };
}

const STATUS_TONE: Record<Appeal['status'], string> = {
  open: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  upheld: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  denied: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * Admin → Appeals: second human review for rejected submissions.
 * Uphold returns the submission to the moderator queue (it is NOT auto-approved —
 * the normal approve/reject path still decides and pays). Deny leaves the rejection.
 */
export const AdminAppealsPage: React.FC = () => {
  const [filter, setFilter] = useState<'open' | 'upheld' | 'denied'>('open');
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [decideError, setDecideError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.submissionAppeals({ status: filter });
      if (res.success) setAppeals(res.data);
      else setError(res.message || 'Could not load appeals.');
    } catch (e) {
      setError(getApiError(e, 'Could not load appeals.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (appeal: Appeal, decision: 'uphold' | 'deny') => {
    setBusy(appeal.id);
    setDecideError(null);
    try {
      const res = await adminApi.decideAppeal(appeal.id, { decision, notes: notes.trim() || undefined });
      if (res.success) {
        setAppeals((list) => list.filter((a) => a.id !== appeal.id));
        setExpanded(null);
        setNotes('');
      } else {
        setDecideError(res.message || 'Could not record the decision.');
      }
    } catch (e) {
      setDecideError(getApiError(e, 'Could not record the decision. Nothing was applied.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-500" /> Submission Appeals
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Contributors challenging a rejection. Upholding sends the submission back for re-review — it never auto-approves.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {(['open', 'upheld', 'denied'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              filter === s
                ? 'bg-[#07182F] text-white dark:bg-white dark:text-[#07182F]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin inline-block" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No {filter} appeals</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The queue is clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appeals.map((a) => {
            const open = expanded === a.id;
            return (
              <div key={a.id} className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : a.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ${STATUS_TONE[a.status]}`}>
                    {a.status}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {a.submission?.task?.title ?? `Submission #${a.submission_id}`}
                    </span>
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                      {a.user?.profile?.display_name || a.user?.name || 'Contributor'} · {when(a.created_at)}
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">Contributor's appeal</p>
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{a.reason}</p>
                    </div>
                    <Link
                      to={`/admin/verification?submission=${a.submission_id}`}
                      className="inline-block text-xs font-bold text-[#168BFF] hover:underline"
                    >
                      Open submission in verification center →
                    </Link>
                    {a.status === 'open' && (
                      <div className="space-y-2">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          maxLength={2000}
                          placeholder="Reviewer note (optional)…"
                          className="w-full text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-2.5 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-400/50"
                        />
                        {decideError && <p className="text-[11px] text-red-600 dark:text-red-300">{decideError}</p>}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busy === a.id}
                            onClick={() => void decide(a, 'uphold')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> {busy === a.id ? 'Working…' : 'Uphold — re-review'}
                          </button>
                          <button
                            type="button"
                            disabled={busy === a.id}
                            onClick={() => void decide(a, 'deny')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Deny
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400">Upholding returns the submission to the moderator queue. It is not approved and no payment is released until a reviewer decides.</p>
                      </div>
                    )}
                    {a.status !== 'open' && a.review_notes && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">Reviewer: {a.review_notes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
