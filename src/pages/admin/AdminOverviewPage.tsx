import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Megaphone,
  ShieldCheck,
  Receipt,
  FileCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { AdminDashboardMetrics } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Admin overview. Every number comes from GET /admin/dashboard. There are no
 * GMV charts, no fabricated event streams, and no demo fallbacks — when the
 * API has no data, the queues simply show as empty.
 */
export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [verificationQueue, setVerificationQueue] = useState<unknown[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, ver, fraud] = await Promise.all([
        adminApi.dashboard(),
        adminApi.verificationQueue(),
        adminApi.fraudAlerts(),
      ]);
      if (dash.success) setMetrics(dash.data.metrics);
      if (ver.success) setVerificationQueue((ver.data || []).slice(0, 5));
      if (fraud.success) setFraudAlerts((fraud.data || []).slice(0, 5));
    } catch (e) {
      setError(getApiError(e, 'Could not load admin dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = [
    { icon: Users, label: 'Total Contributors', value: metrics?.total_contributors ?? '—', tone: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Megaphone, label: 'Active Campaigns', value: metrics?.active_campaigns ?? '—', tone: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: FileCheck, label: 'Pending Verification', value: metrics?.pending_verification ?? '—', tone: 'text-amber-600', bg: 'bg-amber-100' },
    { icon: Receipt, label: 'Pending Payouts', value: metrics?.pending_payouts ?? '—', tone: 'text-violet-600', bg: 'bg-violet-100' },
    { icon: ShieldCheck, label: 'Open Fraud Alerts', value: metrics?.fraud_alerts_count ?? '—', tone: 'text-red-600', bg: 'bg-red-100' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading overview…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold text-red-700">Could not load admin dashboard</p>
          <p className="text-red-600 mt-1">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Live platform state — every figure is served by the API.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
            <div className={`p-2 rounded-xl ${c.bg} w-fit mb-3`}>
              <c.icon className={`w-4 h-4 ${c.tone}`} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
            <p className="text-xl font-extrabold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/verification', label: 'Verification queue', count: metrics?.pending_verification ?? 0 },
          { to: '/admin/withdrawals', label: 'Withdrawal queue', count: metrics?.pending_payouts ?? 0 },
          { to: '/admin/fraud', label: 'Fraud alerts', count: metrics?.fraud_alerts_count ?? 0 },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-[#0E1C2F] hover:bg-[#16293f] text-white rounded-2xl p-5 flex items-center justify-between transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-gray-300">{a.label}</p>
              <p className="text-2xl font-extrabold mt-1">{a.count}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#D4AF37]" />
          </Link>
        ))}
      </div>

      {/* Real queues preview */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-gray-900">Latest verification items</h3>
            <Link to="/admin/verification" className="text-[11px] font-bold text-[#168BFF] hover:underline">
              Open queue
            </Link>
          </div>
          {verificationQueue.length === 0 ? (
            <EmptyState icon={FileCheck} title="Queue is clear" description="No submissions waiting for review right now." />
          ) : (
            <div className="space-y-2">
              {(verificationQueue as { id: number; task?: { title?: string }; user?: { name?: string }; created_at: string }[]).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{s.task?.title || `Submission #${s.id}`}</p>
                    <p className="text-[10px] text-gray-400">{s.user?.name || ''} · {new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-gray-900">Latest fraud alerts</h3>
            <Link to="/admin/fraud" className="text-[11px] font-bold text-[#168BFF] hover:underline">
              Open alerts
            </Link>
          </div>
          {fraudAlerts.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No open alerts" description="The fraud service has not raised any alerts." />
          ) : (
            <div className="space-y-2">
              {(fraudAlerts as { id: number; risk_level?: string; reason?: string; created_at?: string }[]).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{a.reason || `Alert #${a.id}`}</p>
                    <p className="text-[10px] text-gray-400">
                      {a.risk_level ? `Risk: ${a.risk_level}` : ''} {a.created_at ? `· ${new Date(a.created_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
