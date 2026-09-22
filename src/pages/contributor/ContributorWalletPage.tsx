import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Info,
  X,
} from 'lucide-react';
import { walletApi, tasksApi, getApiError } from '../../api';
import { money, mapTaskForUi } from '../../utils/apiMappers';
import type { WalletTransaction } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

interface WalletState {
  available_balance_cents: number;
  pending_balance_cents: number;
  lifetime_earnings_cents: number;
  total_withdrawn_cents: number;
  currency: string;
  is_locked: boolean;
}

/** Crypto is out of the MVP — only real fiat rails are offered. */
const PAYOUT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer', hint: 'IBAN / account number' },
  { value: 'paypal', label: 'PayPal', hint: 'PayPal email' },
  { value: 'wise', label: 'Wise', hint: 'Wise email or account ID' },
];

export const ContributorWalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [minWithdrawalCents, setMinWithdrawalCents] = useState(5000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [submissions, setSubmissions] = useState<{ status: string; reward: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Withdrawal form
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [details, setDetails] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, tRes, mRes] = await Promise.all([
        walletApi.index(),
        walletApi.transactions(),
        tasksApi.myTasks().catch(() => ({ success: false as const, data: [] as [] })),
      ]);
      if (wRes.success) {
        const w = wRes.data.wallet as unknown as WalletState;
        setWallet(w);
        setMinWithdrawalCents(wRes.data.min_withdrawal_cents || 5000);
      }
      if (tRes.success) {
        const list = (tRes.data?.data || tRes.data?.transactions || tRes.data) as WalletTransaction[];
        setTransactions(Array.isArray(list) ? list : []);
      }
      if (mRes.success && mRes.data) {
        setSubmissions(
          mRes.data.map((s) => ({
            status: s.status,
            reward: s.task ? mapTaskForUi(s.task).reward_cents : 0,
          }))
        );
      }
    } catch (err) {
      setError(getApiError(err, 'Could not load your wallet.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const underReviewCents = useMemo(
    () => submissions.filter((s) => ['submitted', 'under_review'].includes(s.status)).reduce((sum, s) => sum + s.reward, 0),
    [submissions]
  );
  const rejectedCents = useMemo(
    () => submissions.filter((s) => s.status === 'rejected').reduce((sum, s) => sum + s.reward, 0),
    [submissions]
  );

  const filteredTxns = useMemo(
    () => (filterType === 'all' ? transactions : transactions.filter((t) => t.type === filterType)),
    [transactions, filterType]
  );

  const availableCents = wallet?.available_balance_cents ?? 0;
  const currency = wallet?.currency || 'USD';

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents < minWithdrawalCents) {
      setWithdrawError(`Minimum withdrawal is ${money(minWithdrawalCents, currency)}.`);
      return;
    }
    if (amountCents > availableCents) {
      setWithdrawError('Amount exceeds your available balance.');
      return;
    }
    if (!details.trim()) {
      setWithdrawError('Please enter your payout details.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await walletApi.withdraw({
        amount_cents: amountCents,
        payout_method: method,
        currency,
        payout_details: { account: details.trim() },
      });
      if (res.success) {
        setWithdrawSuccess('Withdrawal request submitted. It will be reviewed and paid out manually by the platform team.');
        setWithdrawOpen(false);
        setAmount('');
        setDetails('');
        fetchAll();
      } else {
        setWithdrawError(res.message || 'Withdrawal request failed.');
      }
    } catch (err) {
      setWithdrawError(getApiError(err, 'Withdrawal request failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const buckets = [
    { label: 'Available', value: money(availableCents, currency), icon: WalletIcon, tint: 'bg-emerald-50 text-emerald-700', hint: 'Ready to withdraw' },
    { label: 'Pending', value: money(wallet?.pending_balance_cents ?? 0, currency), icon: Clock, tint: 'bg-amber-50 text-amber-700', hint: 'Approved, releasing soon' },
    { label: 'Under review', value: money(underReviewCents, currency), icon: ShieldCheck, tint: 'bg-blue-50 text-blue-700', hint: 'Proof being verified' },
    { label: 'Rejected', value: money(rejectedCents, currency), icon: XCircle, tint: 'bg-red-50 text-red-700', hint: 'Did not pass review' },
    { label: 'Lifetime earnings', value: money(wallet?.lifetime_earnings_cents ?? 0, currency), icon: TrendingUp, tint: 'bg-violet-50 text-violet-700', hint: 'All-time approved rewards' },
  ];

  const txnMeta: Record<string, { icon: typeof ArrowDownLeft; tint: string; sign: string }> = {
    task_reward: { icon: ArrowDownLeft, tint: 'bg-emerald-50 text-emerald-700', sign: '+' },
    referral_reward: { icon: ArrowDownLeft, tint: 'bg-violet-50 text-violet-700', sign: '+' },
    bonus: { icon: ArrowDownLeft, tint: 'bg-blue-50 text-blue-700', sign: '+' },
    withdrawal: { icon: ArrowUpRight, tint: 'bg-gray-100 text-gray-700', sign: '−' },
    withdrawal_reversal: { icon: ArrowDownLeft, tint: 'bg-amber-50 text-amber-700', sign: '+' },
    admin_adjustment: { icon: ArrowDownLeft, tint: 'bg-gray-100 text-gray-700', sign: '' },
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#101828]">Wallet</h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Real balances from your account — every figure below comes from the platform ledger.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E7ECF3] p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchAll}
            className="mt-3 px-5 py-2 rounded-xl bg-[#07182F] text-white text-xs font-bold hover:bg-[#168BFF] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {buckets.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="bg-white rounded-3xl border border-[#E7ECF3] p-4">
                  <div className={`w-9 h-9 rounded-2xl ${b.tint} flex items-center justify-center mb-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{b.label}</p>
                  <p className="text-base sm:text-lg font-black text-gray-900 mt-0.5">{b.value}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{b.hint}</p>
                </div>
              );
            })}
          </div>

          {wallet?.is_locked && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-px" />
              <p className="text-[11px] text-red-700">Your wallet is currently locked. Contact support for assistance.</p>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-[#E7ECF3] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900">Withdraw earnings</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Minimum withdrawal: <span className="font-bold text-gray-700">{money(minWithdrawalCents, currency)}</span>.
                Payouts are processed manually by the platform team after review — no instant or crypto payouts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setWithdrawError(null);
                setWithdrawSuccess(null);
                setWithdrawOpen(true);
              }}
              disabled={availableCents < minWithdrawalCents || wallet?.is_locked}
              title={
                wallet?.is_locked
                  ? 'Wallet is locked'
                  : availableCents < minWithdrawalCents
                    ? `Available balance is below the ${money(minWithdrawalCents, currency)} minimum`
                    : 'Request a withdrawal'
              }
              className="px-6 py-2.5 rounded-xl bg-[#16B364] hover:bg-[#12995a] text-white text-xs font-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Request withdrawal
            </button>
          </div>

          {withdrawSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-px" />
              <p className="text-[11px] text-emerald-800">{withdrawSuccess}</p>
            </div>
          )}

          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-[#101828]">Transaction history</h2>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#168BFF]"
                aria-label="Filter transactions"
              >
                <option value="all">All</option>
                <option value="task_reward">Task rewards</option>
                <option value="referral_reward">Referral rewards</option>
                <option value="withdrawal">Withdrawals</option>
              </select>
            </div>
            {filteredTxns.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Your ledger is empty. Complete a verified task and the reward will appear here — nothing is estimated or simulated."
                icon={WalletIcon}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-[#E7ECF3] divide-y divide-gray-100 overflow-hidden">
                {filteredTxns.map((t) => {
                  const meta = txnMeta[t.type] || txnMeta.admin_adjustment;
                  const Icon = meta.icon;
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-9 h-9 rounded-2xl ${meta.tint} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{t.description}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}
                          {t.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <p className={`text-xs font-black shrink-0 ${t.amount_cents < 0 ? 'text-gray-700' : 'text-emerald-700'}`}>
                        {meta.sign}{money(Math.abs(t.amount_cents), t.currency || currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Withdrawal modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setWithdrawOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900">Request withdrawal</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Available: {money(availableCents, currency)} · Minimum: {money(minWithdrawalCents, currency)}
                </p>
              </div>
              <button type="button" onClick={() => setWithdrawOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {withdrawError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{withdrawError}</div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  min={(minWithdrawalCents / 100).toFixed(2)}
                  max={(availableCents / 100).toFixed(2)}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={(minWithdrawalCents / 100).toFixed(2)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payout method</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYOUT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        method === m.value ? 'border-[#168BFF] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-[11px] font-black text-gray-900">{m.label}</p>
                      <p className="text-[10px] text-gray-400">{m.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payout details</label>
                <input
                  type="text"
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={method === 'bank_transfer' ? 'Full name + IBAN / account number' : 'Account email'}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-px" />
                <p className="text-[11px] text-blue-800">
                  Withdrawals are queued and paid manually by the platform team after a compliance check. You'll see the status in your transaction history.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#16B364] hover:bg-[#12995a] text-white font-black text-sm rounded-xl transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit withdrawal request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
