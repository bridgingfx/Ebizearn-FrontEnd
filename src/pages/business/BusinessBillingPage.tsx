import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, Loader2, Plus, Receipt, RefreshCw, Wallet } from 'lucide-react';
import { depositsApi, formatUsd, getApiError } from '../../api';
import type { BusinessDepositsOverview, DepositMethod, DepositStatus } from '../../api';
import { EmptyState } from '../../components/common/EmptyState';
import { DepositModal, METHOD_ICONS } from '../../components/business/DepositModal';
import { toast } from '../../utils/toast';

const STATUS_STYLES: Record<DepositStatus, string> = {
  pending: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  approved: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  rejected: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
};

const STATUS_LABEL: Record<DepositStatus, string> = { pending: 'Awaiting confirmation', approved: 'Credited', rejected: 'Rejected' };

const TX_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  campaign_funding: 'Campaign funding',
  campaign_refund: 'Campaign refund',
  admin_adjustment: 'Adjustment',
  bonus: 'Bonus',
};

const date = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const BusinessBillingPage: React.FC = () => {
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [overview, setOverview] = useState<BusinessDepositsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [tab, setTab] = useState<'deposits' | 'activity'>('deposits');

  const load = useCallback(async () => {
    try {
      const [m, o] = await Promise.all([depositsApi.methods(), depositsApi.overview()]);
      setMethods(m.data);
      setOverview(o.data);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load your billing details.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDeposit = () => {
    if (methods.length === 0) {
      toast.info('Deposits are not available yet. Please contact support@ebizearn.com to fund your wallet.');
      return;
    }
    setShowDeposit(true);
  };

  const wallet = overview?.wallet;
  const pending = overview?.deposits.filter((d) => d.status === 'pending') ?? [];
  const pendingCents = pending.reduce((sum, d) => sum + d.amount_cents, 0);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">Billing &amp; Payments</h1>
          <p className="text-xs sm:text-sm text-[#475467] dark:text-gray-400 mt-0.5">Add funds to your campaign wallet and track every deposit and payment.</p>
        </div>
        <button
          type="button"
          onClick={openDeposit}
          className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 text-white text-sm font-bold shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add funds
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin inline-block" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Balance */}
            <div className="p-6 rounded-3xl bg-[#07182F] text-white border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4">
              <div className="absolute -top-6 -right-6 w-36 h-36 bg-[#168BFF]/25 rounded-full blur-2xl pointer-events-none" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Available campaign balance</span>
              <div>
                <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">{wallet ? formatUsd(wallet.available_balance_cents, wallet.currency) : '—'}</span>
                <span className="text-xs text-gray-300 block mt-1">Used to fund your campaigns.</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400">{pending.length > 0 ? `${formatUsd(pendingCents)} awaiting confirmation` : 'No pending deposits'}</span>
                <button type="button" onClick={openDeposit} className="text-[#20C4E8] font-bold hover:underline">+ Deposit</button>
              </div>
            </div>

            {/* Methods */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex flex-col gap-4">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ways to pay</span>
              {methods.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">No deposit methods are available yet. Contact <b>support@ebizearn.com</b> to fund your wallet.</p>
              ) : (
                <div className="space-y-2 flex-1">
                  {methods.map((m) => {
                    const Icon = METHOD_ICONS[m.key];
                    return (
                      <button key={m.key} type="button" onClick={openDeposit} className="w-full flex items-center gap-3 p-2.5 -mx-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left">
                        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{m.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex flex-col justify-between gap-4">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending deposits</span>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{pending.length}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {pending.length > 0 ? 'Our finance team is confirming these payments. Your wallet updates automatically.' : 'Deposits you submit appear here until they are confirmed.'}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-[11px] font-semibold text-gray-400 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Usually confirmed within one business day
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Transactions</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your deposits and every movement of your campaign wallet.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
                  {([['deposits', 'Deposits'], ['activity', 'Wallet activity']] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setTab(id)} className={`h-8 px-3 rounded-lg text-xs font-bold ${tab === id ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => void load()} title="Refresh" className="h-9 w-9 rounded-xl border border-gray-200 dark:border-white/10 inline-flex items-center justify-center text-gray-500 hover:text-[#168BFF]">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {tab === 'deposits' ? (
              overview && overview.deposits.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-white/10">
                  {overview.deposits.map((d) => {
                    const Icon = METHOD_ICONS[d.method];
                    return (
                      <li key={d.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {methods.find((m) => m.key === d.method)?.title ?? d.method}
                            {d.reference && <span className="ml-2 font-mono text-xs font-normal text-gray-500 dark:text-gray-400 break-all">{d.reference}</span>}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{date(d.created_at)}</p>
                          {d.status === 'rejected' && d.review_note && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Reason: {d.review_note}</p>}
                        </div>
                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100 tabular-nums w-28 text-right">{formatUsd(d.amount_cents, d.currency)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-6">
                  <EmptyState icon={Receipt} title="No deposits yet" description="Add funds with any of the payment methods above — your deposits will be listed here." />
                </div>
              )
            ) : overview && overview.transactions.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-white/10">
                {overview.transactions.map((t) => {
                  const credit = t.amount_cents > 0;
                  return (
                    <li key={t.id} className="px-5 py-4 flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${credit ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}>
                        {credit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{t.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{TX_LABELS[t.type] ?? t.type.replace(/_/g, ' ')} · {date(t.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black tabular-nums ${credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {credit ? '+' : '−'}{formatUsd(Math.abs(t.amount_cents), t.currency)}
                        </p>
                        <p className="text-[11px] text-gray-400 tabular-nums">Balance {formatUsd(t.balance_after_cents, t.currency)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6">
                <EmptyState icon={Wallet} title="No wallet activity yet" description="Deposits and campaign payments will show here." />
              </div>
            )}
          </div>
        </>
      )}

      {showDeposit && <DepositModal methods={methods} onClose={() => setShowDeposit(false)} onSubmitted={() => void load()} />}
    </div>
  );
};
