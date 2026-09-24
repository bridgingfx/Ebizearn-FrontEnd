import React, { useCallback, useEffect, useState } from 'react';
import { Gift, Users, Wallet, Hourglass, Undo2 } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { EmptyState } from '../../components/common/EmptyState';
import { ReferralCommissionSettings } from '../../components/admin/ReferralCommissionSettings';
import { PageHeader, StatCard, StatusBadge, LoadingBlock, ErrorBlock, Card, CardHeader, fmtMoney } from '../../components/common/ui';

interface ReferralOverview {
  totals: {
    referrals_count: number;
    rewards_count: number;
    rewarded_cents: number;
    pending_cents: number;
    reversed_cents: number;
  };
  per_level: { level: number; status: string; rewards_count: number; rewards_cents: number }[];
  recent: {
    id: number;
    level: number;
    amount_cents: number;
    status: string;
    qualified_at: string | null;
    created_at: string;
    referrer?: { id: number; name: string };
    referred_user?: { id: number; name: string };
  }[];
}

/**
 * Phase 11: real platform-wide referral overview from the three-level
 * ledger (GET /admin/referrals/overview). Rewards are only ever credited
 * after valid registration/activity rules — pending rows are not earnings.
 */
export const AdminReferralsPage: React.FC = () => {
  const [data, setData] = useState<ReferralOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.referralOverview();
      if (res.success) setData(res.data);
      else setLoadError(res.message || 'Could not load referral overview.');
    } catch (e) {
      setLoadError(getApiError(e, 'Could not load referral overview.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Referrals" subtitle="Platform-wide affiliate performance and payouts." />
        <LoadingBlock label="Loading referral ledger…" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Referrals" subtitle="Platform-wide affiliate performance and payouts." />
        <ErrorBlock message={loadError ?? 'Could not load referral overview.'} onRetry={() => void load()} />
      </div>
    );
  }

  const { totals, per_level, recent } = data;
  const empty = totals.rewards_count === 0;

  const levelRows = [1, 2, 3].map((lvl) => {
    const rows = per_level.filter((r) => r.level === lvl);
    const sum = (status: string) => rows.filter((r) => r.status === status).reduce((a, r) => a + Number(r.rewards_cents), 0);
    const count = (status: string) => rows.filter((r) => r.status === status).reduce((a, r) => a + Number(r.rewards_count), 0);
    return {
      level: lvl,
      rewarded: sum('rewarded'),
      pending: sum('pending'),
      reversed: sum('reversed'),
      rewardedCount: count('rewarded'),
      pendingCount: count('pending'),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals"
        subtitle="Three-level affiliate ledger. Rewards credit only after valid registration and activity rules — pending rows are not earnings."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Referral links" value={String(totals.referrals_count)} icon={Users} accent="blue" hint="Total referral relationships" />
        <StatCard label="Paid out" value={fmtMoney(totals.rewarded_cents)} icon={Wallet} accent="green" hint={`${totals.rewards_count} reward rows`} />
        <StatCard label="Pending qualification" value={fmtMoney(totals.pending_cents)} icon={Hourglass} accent="amber" hint="Not earnings until qualified" />
        <StatCard label="Reversed" value={fmtMoney(totals.reversed_cents)} icon={Undo2} accent="red" hint="Fraud / ineligible reversals" />
      </div>

      <ReferralCommissionSettings />

      {empty ? (
        <EmptyState
          icon={Gift}
          title="No referral activity yet"
          description="The referral ledger is empty. When contributors invite others and those referrals qualify under the activity rules, rewards appear here per level."
        />
      ) : (
        <>
          <Card>
            <CardHeader title="Rewards by level" subtitle="Per-level breakdown of the affiliate ledger" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                    <th className="px-5 py-3 font-bold">Level</th>
                    <th className="px-5 py-3 font-bold text-right">Paid</th>
                    <th className="px-5 py-3 font-bold text-right">Pending</th>
                    <th className="px-5 py-3 font-bold text-right">Reversed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {levelRows.map((r) => (
                    <tr key={r.level} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-gray-100">Level {r.level}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(r.rewarded)}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({r.rewardedCount})</span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span className="font-bold text-amber-700 dark:text-amber-300">{fmtMoney(r.pending)}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({r.pendingCount})</span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-bold text-red-600 dark:text-red-400">{fmtMoney(r.reversed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent rewards" subtitle="Latest ledger rows, newest first" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                    <th className="px-5 py-3 font-bold">Referrer</th>
                    <th className="px-5 py-3 font-bold">Referred</th>
                    <th className="px-5 py-3 font-bold">Level</th>
                    <th className="px-5 py-3 font-bold text-right">Amount</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {recent.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-gray-100">{r.referrer?.name ?? `#${r.id}`}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{r.referred_user?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">Level {r.level}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900 dark:text-gray-100 tabular-nums">{fmtMoney(r.amount_cents)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
