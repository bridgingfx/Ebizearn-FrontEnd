import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Search, Loader2, X, CheckCircle2, XCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { staffKycApi, getApiError } from '../../api';
import type { KycDocumentSide, KycDocumentType, KycStatus, KycSubmission } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/ui';
import { useHideChatWidget } from '../../utils/useHideChatWidget';
import { Link } from 'react-router-dom';

type Filter = 'pending' | 'verified' | 'rejected' | 'all';

const DOC_LABELS: Record<KycDocumentType, string> = {
  emirates_id: 'National ID',
  passport: 'Passport',
  national_id: 'National ID',
};

const SIDE_LABELS: Record<KycDocumentSide, string> = {
  front: 'Front',
  back: 'Back',
  selfie: 'Selfie',
};

const STATUS_STYLES: Record<KycStatus, string> = {
  unverified: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10',
  pending: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  verified: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  rejected: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
};

interface LoadedDoc {
  side: KycDocumentSide;
  url: string;
  isPdf: boolean;
}

/**
 * KYC review queue. Contributors submit documents from their profile
 * (POST /profile/kyc); staff review them here via /staff/kyc. Documents are
 * private and fetched with the staff auth token as blobs.
 */
export const AdminKycPage: React.FC = () => {
  const [rows, setRows] = useState<KycSubmission[]>([]);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [docs, setDocs] = useState<LoadedDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useHideChatWidget(!!selected);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffKycApi.list({ status: filter, search: debouncedSearch || undefined });
      if (res.success) {
        setRows(res.data || []);
        setPendingCount(res.meta?.pending ?? null);
      } else {
        setError(res.message || 'Could not load KYC submissions.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load KYC submissions.'));
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  // Fetch the selected user's documents; revoke object URLs on change/close.
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const created: string[] = [];
    setDocs([]);
    setDocsLoading(true);
    (async () => {
      const loaded: LoadedDoc[] = [];
      for (const side of selected.kyc_documents ?? []) {
        try {
          const blob = await staffKycApi.document(selected.user_id, side);
          const url = URL.createObjectURL(blob);
          created.push(url);
          loaded.push({ side, url, isPdf: blob.type === 'application/pdf' });
        } catch {
          // A missing file is simply not shown.
        }
      }
      if (!cancelled) {
        setDocs(loaded);
        setDocsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [selected?.user_id, selected?.kyc_submitted_at]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (row: KycSubmission) => {
    setSelected(row);
    setReason('');
    setActionError(null);
  };

  const decide = async (decision: 'approve' | 'reject') => {
    if (!selected) return;
    if (decision === 'reject' && !reason.trim()) {
      setActionError('Give the user a reason so they can fix and resubmit.');
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const res = await staffKycApi.decide(selected.user_id, decision, decision === 'reject' ? reason.trim() : undefined);
      if (res.success) {
        setSelected(null);
        void load();
      } else {
        setActionError(res.message || 'Could not record the decision.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not record the decision.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC Review"
        subtitle="Identity documents submitted by contributors. Approving unlocks their withdrawals."
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

      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['pending', 'verified', 'rejected', 'all'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  filter === f
                    ? 'bg-[#07182F] text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
                }`}
              >
                {f}
                {f === 'pending' && pendingCount !== null && <span className="ml-1.5 opacity-70">{pendingCount}</span>}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-red-600 dark:text-red-400 font-semibold">{error}</div>
        ) : loading && rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin inline-block" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={ShieldCheck}
              title={filter === 'pending' ? 'No KYC submissions waiting' : 'Nothing here'}
              description={
                filter === 'pending'
                  ? 'When a contributor uploads identity documents from their profile, they appear here for review.'
                  : 'No submissions match this filter.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => open(r)}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 dark:text-gray-100 block">{r.user?.name}</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">{r.user?.email}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {r.kyc_document_type ? DOC_LABELS[r.kyc_document_type] : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {(r.kyc_documents ?? []).map((s) => SIDE_LABELS[s]).join(', ') || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                          STATUS_STYLES[r.kyc_status ?? 'unverified']
                        }`}
                      >
                        {r.kyc_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {r.kyc_submitted_at ? new Date(r.kyc_submitted_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-2xl h-full bg-white dark:bg-[#0C1322] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/admin/users/${selected.user_id}`}
                  className="text-base font-black text-gray-900 dark:text-gray-100 hover:underline"
                >
                  {selected.user?.name}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selected.user?.email} · {selected.kyc_document_type ? DOC_LABELS[selected.kyc_document_type] : 'Document'}
                  {selected.country_code ? ` · ${selected.country_code}` : ''}
                </p>
                <span
                  className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                    STATUS_STYLES[selected.kyc_status ?? 'unverified']
                  }`}
                >
                  {selected.kyc_status}
                </span>
                {selected.kyc_status === 'rejected' && selected.kyc_rejection_reason && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Reason: {selected.kyc_rejection_reason}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {docsLoading && (
                <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                  <Loader2 className="w-6 h-6 animate-spin inline-block" />
                </div>
              )}
              {!docsLoading && docs.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">No document files could be loaded.</p>
              )}
              {docs.map((d) => (
                <div key={d.side} className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{SIDE_LABELS[d.side]}</p>
                  {d.isPdf ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-[#168BFF] dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <FileText className="w-5 h-5" /> Open PDF in a new tab
                    </a>
                  ) : (
                    <a href={d.url} target="_blank" rel="noreferrer">
                      <img
                        src={d.url}
                        alt={`${SIDE_LABELS[d.side]} of ID document`}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 object-contain max-h-[420px]"
                      />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {selected.kyc_status === 'pending' && (
              <div className="p-5 border-t border-gray-100 dark:border-white/10 space-y-3">
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder="Rejection reason shown to the user (required to reject), e.g. Photo is blurry — please retake."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void decide('reject')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-bold"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void decide('approve')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16B364] hover:bg-[#12995a] disabled:opacity-50 text-white text-xs font-bold"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                  </button>
                </div>
                {actionError && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {actionError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
