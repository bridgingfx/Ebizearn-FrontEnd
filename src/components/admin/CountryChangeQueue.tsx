import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Loader2, X, AlertCircle, Globe2 } from 'lucide-react';
import { staffCountryChangeApi, getApiError, type CountryChangeRequest } from '../../api';

type Status = 'pending' | 'approved' | 'rejected' | 'all';

const STATUS_BADGE: Record<CountryChangeRequest['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
};

/**
 * Staff queue of residence-country changes. Approving switches the user's
 * country and resets their KYC for the new country — their tasks stay
 * locked until new-country documents are approved in the KYC queue.
 */
export const CountryChangeQueue: React.FC<{ onPendingCount?: (n: number) => void }> = ({ onPendingCount }) => {
  const [status, setStatus] = useState<Status>('pending');
  const [rows, setRows] = useState<CountryChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffCountryChangeApi.list({ status });
      setRows(res.data || []);
      onPendingCount?.(res.meta?.pending_count ?? 0);
    } catch (e) {
      setError(getApiError(e, 'Could not load country change requests.'));
    } finally {
      setLoading(false);
    }
  }, [status, onPendingCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (row: CountryChangeRequest, decision: 'approve' | 'reject') => {
    if (decision === 'approve' && !window.confirm(
      `Approve ${row.user?.name ?? 'this user'}'s move to ${row.to_country}?\n\n` +
      'Their KYC is reset and tasks stay locked until they submit KYC with documents from the new country.',
    )) return;
    setBusyId(row.id);
    try {
      const res = await staffCountryChangeApi.decide(row.id, decision, decision === 'reject' ? note.trim() : undefined);
      if (res.success) {
        setRejecting(null);
        setNote('');
        void load();
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save the decision.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
          Contributors and businesses cannot change their country of residence themselves. Approving a request switches the
          country and requires new KYC for that country before they can do tasks again.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(['pending', 'approved', 'rejected', 'all'] as Status[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                status === s
                  ? 'bg-[#07182F] dark:bg-[#168BFF] text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-400 dark:text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin inline-block" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center">
          <Globe2 className="w-7 h-7 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">No {status === 'all' ? '' : status} country change requests.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-white/10 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {rows.map((row) => (
            <li key={row.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/admin/users/${row.user_id}`} className="text-sm font-bold text-gray-900 dark:text-gray-100 hover:underline">
                    {row.user?.name ?? `User #${row.user_id}`}
                  </Link>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {row.user?.email} · <span className="capitalize">{row.user?.role}</span> · KYC{' '}
                    {row.user?.profile?.kyc_status ?? 'unverified'}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-black text-gray-900 dark:text-gray-100">
                    {row.from_country ?? '—'} <ArrowRight className="w-4 h-4 text-gray-400" /> {row.to_country}
                  </p>
                  {row.reason && <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 break-words">“{row.reason}”</p>}
                  {row.review_note && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 break-words">
                      Note{row.reviewer ? ` (${row.reviewer.name})` : ''}: {row.review_note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${STATUS_BADGE[row.status]}`}>{row.status}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(row.created_at).toLocaleString()}</span>
                </div>
              </div>

              {row.status === 'pending' && (
                rejecting === row.id ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={500}
                      placeholder="Reason shown to the user…"
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                    />
                    <button
                      type="button"
                      disabled={!note.trim() || busyId === row.id}
                      onClick={() => void decide(row, 'reject')}
                      className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRejecting(null); setNote(''); }}
                      className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300"
                    >
                      Back
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => void decide(row, 'approve')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                    >
                      {busyId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRejecting(row.id); setNote(''); }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
