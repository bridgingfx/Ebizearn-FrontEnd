import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Check,
  AlertCircle,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { WithdrawalRequest } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Withdrawal queue. Data comes only from GET /admin/payouts — no mock
 * payouts, no fabricated "variance" banners. The backend processes payouts
 * through its ledger service; this page approves/rejects requests only.
 */
export const AdminPayoutsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.payouts(filterStatus === 'all' ? undefined : { status: filterStatus });
      if (res.success) {
        setPayouts(res.data || []);
      } else {
        setLoadError(res.message || 'Could not load payout queue.');
      }
    } catch (e) {
      setLoadError(getApiError(e, 'Could not load payout queue.'));
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (id: number, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(id);
    setActionError(null);
    try {
      const res = await adminApi.processPayout(id, { action, reason });
      if (res.success && res.data) {
        setPayouts((items) => items.map((item) => (item.id === id ? res.data : item)));
      } else {
        setActionError(res.message || 'Could not process this payout.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not process this payout. Nothing was applied.'));
    } finally {
      setProcessingId(null);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const handleBatchApprove = async () => {
    const pending = payouts.filter((p) => p.status === 'requested' || p.status === 'processing');
    for (const p of pending) {
      await handleAction(p.id, 'approve');
    }
  };

  const filteredPayouts = useMemo(
    () =>
      payouts.filter((p) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            (p.user?.name || '').toLowerCase().includes(q) ||
            (p.user?.email || '').toLowerCase().includes(q) ||
            (p.payout_method || '').toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [payouts, searchQuery],
  );

  const pendingList = payouts.filter((p) => p.status === 'requested' || p.status === 'processing');
  const pendingCount = pendingList.length;
  const pendingTotalCents = pendingList.reduce((acc, p) => acc + p.amount_cents, 0);

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-50 text-red-600';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">Withdrawals</h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Review and action contributor withdrawal requests. Amounts are debited by the server ledger —
            this page only approves or rejects.
          </p>
        </div>

        {pendingCount > 0 && (
          <button
            type="button"
            onClick={() => void handleBatchApprove()}
            className="px-5 py-2.5 bg-[#16B364] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve All Pending ({pendingCount} · {fmt(pendingTotalCents)})</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'requested', 'processing', 'paid', 'rejected', 'failed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                filterStatus === s ? 'bg-[#07182F] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user or method…"
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
          />
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load payout queue</p>
            <p className="text-red-600 mt-1">{loadError}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold text-red-700">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading payout queue…
        </div>
      )}

      {!loading && !loadError && filteredPayouts.length === 0 && (
        <EmptyState
          icon={Wallet}
          title={payouts.length === 0 ? 'No withdrawal requests' : 'No requests match your filter'}
          description={
            payouts.length === 0
              ? 'Contributor withdrawal requests will appear here when they are made.'
              : 'Try a different status or search term.'
          }
        />
      )}

      {!loading && filteredPayouts.length > 0 && (
        <div className="space-y-3">
          {filteredPayouts.map((p) => {
            const isPending = p.status === 'requested' || p.status === 'processing';
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-5 flex flex-col lg:flex-row lg:items-center gap-4"
              >
                <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 w-fit">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle(p.status)}`}
                    >
                      {p.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
                    {p.user?.profile?.kyc_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <ShieldCheck className="w-3 h-3" /> KYC verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    {p.user?.name || 'Contributor'} · {p.currency || 'USD'} {fmt(p.amount_cents)}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {p.payout_method || 'method not specified'}
                    {p.payout_details_json && Object.keys(p.payout_details_json).length > 0 && (
                      <> · {Object.entries(p.payout_details_json).map(([k, v]) => `${k}: ${v}`).join(' / ')}</>
                    )}
                    <span className="text-gray-400 dark:text-gray-500"> · fee {fmt(p.fee_cents)}</span>
                  </p>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={processingId === p.id}
                      onClick={() => void handleAction(p.id, 'approve')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#16B364] hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      {processingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={processingId === p.id}
                      onClick={() => setRejectingId(p.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectingId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRejectingId(null)} />
          <div className="relative bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Reject withdrawal</h3>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Reason (shown to the contributor)</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Payout details do not match the verified identity."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || processingId != null}
                onClick={() => void handleAction(rejectingId, 'reject', rejectReason.trim())}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-[11px] text-gray-400 dark:text-gray-500">
        <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Approving sends the request to the payout service; rejecting returns the amount to the contributor's
          balance. All movements are recorded in the platform ledger and audit log.
        </span>
      </div>
    </div>
  );
};
