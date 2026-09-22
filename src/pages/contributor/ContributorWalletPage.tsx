import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Info,
  X,
  Landmark,
  Eye,
  EyeOff,
  BadgeCheck,
} from 'lucide-react';
import { walletApi, tasksApi, getApiError } from '../../api';
import { money, mapTaskForUi } from '../../utils/apiMappers';
import type { WalletTransaction } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard } from '../../components/common/StatCard';
import { useRequireVerifiedEmail } from '../../components/auth/EmailVerification';

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
  { value: 'bank_transfer', label: 'Bank transfer', hint: 'IBAN / account number', icon: Landmark },
  { value: 'paypal', label: 'PayPal', hint: 'PayPal email', icon: WalletIcon },
  { value: 'wise', label: 'Wise', hint: 'Wise email or account ID', icon: TrendingUp },
];

type TxnTab = 'all' | 'earnings' | 'withdrawals';

const EARNING_TYPES = ['task_reward', 'referral_reward', 'bonus', 'withdrawal_reversal', 'admin_adjustment'];
const WITHDRAWAL_TYPES = ['withdrawal'];

export const ContributorWalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [minWithdrawalCents, setMinWithdrawalCents] = useState(5000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [submissions, setSubmissions] = useState<{ status: string; reward: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TxnTab>('all');
  const [balanceHidden, setBalanceHidden] = useState(false);

  // Withdrawal form
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [details, setDetails] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { requireVerified, gate } = useRequireVerifiedEmail();

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

  const filteredTxns = useMemo(() => {
    if (tab === 'earnings') return transactions.filter((t) => EARNING_TYPES.includes(t.type));
    if (tab === 'withdrawals') return transactions.filter((t) => WITHDRAWAL_TYPES.includes(t.type));
    return transactions;
  }, [transactions, tab]);

  const availableCents = wallet?.available_balance_cents ?? 0;
  const pendingCents = wallet?.pending_balance_cents ?? 0;
  const totalCents = availableCents + pendingCents;
  const currency = wallet?.currency || 'USD';

  const displayMoney = (cents: number) => (balanceHidden ? '••••••' : money(cents, currency));

  const openWithdraw = () => {
    if (!requireVerified()) return;
    setWithdrawError(null);
    setWithdrawSuccess(null);
    setWithdrawOpen(true);
  };

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

  const txnMeta: Record<string, { icon: typeof ArrowDownLeft; tint: string; sign: string }> = {
    task_reward: { icon: ArrowDownLeft, tint: 'bg-emerald-100 text-emerald-700', sign: '+' },
    referral_reward: { icon: ArrowDownLeft, tint: 'bg-violet-100 text-violet-700', sign: '+' },
    bonus: { icon: ArrowDownLeft, tint: 'bg-blue-100 text-blue-700', sign: '+' },
    withdrawal: { icon: ArrowUpRight, tint: 'bg-slate-200 text-slate-700', sign: '−' },
    withdrawal_reversal: { icon: ArrowDownLeft, tint: 'bg-amber-100 text-amber-700', sign: '+' },
    admin_adjustment: { icon: ArrowDownLeft, tint: 'bg-slate-200 text-slate-700', sign: '' },
  };

  const canWithdraw = availableCents >= minWithdrawalCents && !wallet?.is_locked;

  return (
    <div className="space-y-6 text-left">
      {gate}

      {/* ── Balance hero — neobank style ──────────────────────────── */}
      {loading ? (
        <div className="rounded-[1.75rem] bg-slate-200 animate-pulse h-64" />
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-[1.75rem] p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchAll}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#07182F] text-white text-sm font-bold hover:bg-[#168BFF] transition-colors min-h-[48px]"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-navy-gradient text-white p-6 sm:p-8">
            <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-[#168BFF]/35 blur-3xl" />
            <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-[#16B364]/25 blur-3xl" />
            {/* subtle card sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-300 flex items-center gap-2">
                  <WalletIcon className="w-4 h-4 text-[#20C4E8]" /> eBizEarn Wallet
                </p>
                <button
                  type="button"
                  onClick={() => setBalanceHidden((h) => !h)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={balanceHidden ? 'Show balances' : 'Hide balances'}
                >
                  {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Total balance</p>
              <p className="mt-1 text-[2.75rem] sm:text-5xl font-black tracking-tight leading-none tabular-nums">
                {displayMoney(totalCents)}
              </p>

              {/* Available vs pending breakdown */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.07] border border-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#16B364]">Available</p>
                  <p className="mt-1 text-xl font-black tabular-nums">{displayMoney(availableCents)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ready to withdraw</p>
                </div>
                <div className="rounded-2xl bg-white/[0.07] border border-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-300">Pending</p>
                  <p className="mt-1 text-xl font-black tabular-nums">{displayMoney(pendingCents)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Releasing soon</p>
                </div>
              </div>

              {/* Withdraw CTA */}
              <button
                type="button"
                onClick={openWithdraw}
                disabled={!canWithdraw}
                title={
                  wallet?.is_locked
                    ? 'Wallet is locked'
                    : availableCents < minWithdrawalCents
                      ? `Available balance is below the ${money(minWithdrawalCents, currency)} minimum`
                      : 'Request a withdrawal'
                }
                className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-2xl bg-gradient-to-r from-[#16B364] to-[#0EA968] text-white font-extrabold text-base shadow-lg shadow-emerald-500/30 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-5 h-5" />
                Withdraw funds
              </button>
              <p className="mt-2.5 text-[11px] text-slate-400">
                Minimum withdrawal {money(minWithdrawalCents, currency)} · manual review by the platform team
              </p>
            </div>
          </div>

          {wallet?.is_locked && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">Your wallet is currently locked. Contact support for assistance.</p>
            </div>
          )}

          {withdrawSuccess && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 font-medium">{withdrawSuccess}</p>
            </div>
          )}

          {/* ── Breakdown cards ───────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Lifetime earnings"
              value={displayMoney(wallet?.lifetime_earnings_cents ?? 0)}
              sub="All-time approved rewards"
              icon={TrendingUp}
              gradient="from-[#7257FF] to-[#9D7BFF]"
              shadow="shadow-lg shadow-violet-500/25"
            />
            <StatCard
              label="Under review"
              value={displayMoney(underReviewCents)}
              sub="Proof being verified"
              icon={ShieldCheck}
              gradient="from-[#168BFF] to-[#20C4E8]"
              shadow="shadow-lg shadow-blue-500/25"
            />
            <StatCard
              label="Total withdrawn"
              value={displayMoney(wallet?.total_withdrawn_cents ?? 0)}
              sub="Paid out to you"
              icon={Landmark}
              gradient="from-emerald-500 to-teal-600"
              shadow="shadow-lg shadow-emerald-500/25"
            />
            <StatCard
              label="Rejected"
              value={displayMoney(rejectedCents)}
              sub="Did not pass review"
              icon={XCircle}
              gradient="from-slate-500 to-slate-700"
              shadow="shadow-lg shadow-slate-500/25"
            />
          </div>

          {/* ── Transactions ──────────────────────────────────────── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Activity</h2>
              <div className="inline-flex rounded-2xl bg-slate-100 p-1 w-fit" role="tablist" aria-label="Transaction filter">
                {(
                  [
                    { value: 'all', label: 'All' },
                    { value: 'earnings', label: 'Earnings' },
                    { value: 'withdrawals', label: 'Withdrawals' },
                  ] as { value: TxnTab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.value}
                    onClick={() => setTab(t.value)}
                    className={`min-h-[44px] px-5 rounded-xl text-sm font-bold transition-all ${
                      tab === t.value ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTxns.length === 0 ? (
              <EmptyState
                title={tab === 'all' ? 'No transactions yet' : tab === 'earnings' ? 'No earnings yet' : 'No withdrawals yet'}
                description={
                  tab === 'withdrawals'
                    ? 'You have not requested a withdrawal yet. When you do, the full history appears here.'
                    : 'Your ledger is empty. Complete a verified task and the reward will appear here — nothing is estimated or simulated.'
                }
                icon={WalletIcon}
              />
            ) : (
              <div className="bg-white rounded-[1.5rem] border border-[#E7ECF3] card-shadow divide-y divide-slate-100 overflow-hidden">
                {filteredTxns.map((t) => {
                  const meta = txnMeta[t.type] || txnMeta.admin_adjustment;
                  const Icon = meta.icon;
                  const positive = t.amount_cents > 0;
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className={`w-12 h-12 rounded-2xl ${meta.tint} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{t.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}
                          {t.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-base font-black ${positive ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {meta.sign}{balanceHidden ? '••••' : money(Math.abs(t.amount_cents), t.currency || currency)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Bal {balanceHidden ? '••••' : money(t.balance_after_cents, t.currency || currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trust strip */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <BadgeCheck className="w-5 h-5 text-[#168BFF] shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 leading-relaxed">
              <span className="font-bold">Ledger-backed balances.</span> Every figure above comes from your
              platform ledger — no estimates. Withdrawals are queued and paid manually after a compliance check.
            </p>
          </div>
        </>
      )}

      {/* ── Withdrawal modal (same endpoint, same validation) ────── */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setWithdrawOpen(false)}>
          <div className="bg-white rounded-[1.75rem] w-full max-w-md p-6 sm:p-7 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Request withdrawal</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Available: <span className="font-extrabold text-emerald-600">{money(availableCents, currency)}</span>
                  {' · '}Minimum: {money(minWithdrawalCents, currency)}
                </p>
              </div>
              <button type="button" onClick={() => setWithdrawOpen(false)} className="p-2.5 rounded-xl hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {withdrawError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium rounded-2xl" role="alert">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-5">
              <div>
                <label htmlFor="withdraw-amount" className="block text-sm font-bold text-slate-800 mb-2">
                  Amount ({currency})
                </label>
                <input
                  id="withdraw-amount"
                  type="number"
                  min={(minWithdrawalCents / 100).toFixed(2)}
                  max={(availableCents / 100).toFixed(2)}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={(minWithdrawalCents / 100).toFixed(2)}
                  inputMode="decimal"
                  className="w-full min-h-[52px] px-4 text-base bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/15 transition-all"
                />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 mb-2">Payout method</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {PAYOUT_METHODS.map((m) => {
                    const MIcon = m.icon;
                    const active = method === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMethod(m.value)}
                        aria-pressed={active}
                        className={`p-3 rounded-2xl border-2 text-left transition-all min-h-[76px] ${
                          active ? 'border-[#168BFF] bg-blue-50/60' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <MIcon className={`w-5 h-5 ${active ? 'text-[#168BFF]' : 'text-slate-400'}`} />
                        <p className="text-xs font-extrabold text-slate-900 mt-1.5">{m.label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{m.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="withdraw-details" className="block text-sm font-bold text-slate-800 mb-2">
                  Payout details
                </label>
                <input
                  id="withdraw-details"
                  type="text"
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={method === 'bank_transfer' ? 'Full name + IBAN / account number' : 'Account email'}
                  className="w-full min-h-[52px] px-4 text-base bg-white border-2 border-slate-200 rounded-2xl placeholder:text-slate-400 focus:outline-none focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/15 transition-all"
                />
              </div>
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[13px] text-blue-800 leading-relaxed">
                  Withdrawals are queued and paid manually by the platform team after a compliance check. You'll see the status in your activity history.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[54px] bg-gradient-to-r from-[#16B364] to-[#0EA968] hover:brightness-105 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
