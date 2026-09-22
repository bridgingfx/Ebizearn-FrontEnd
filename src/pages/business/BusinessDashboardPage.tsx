import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Target,
  Zap,
  CheckSquare,
  Wallet,
  Megaphone,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { businessApi, getApiError } from '../../api';
import type { BusinessDashboardData, Campaign, TaskSubmission } from '../../types';
import { money } from '../../utils/apiMappers';
import { EmptyState } from '../../components/common/EmptyState';

export const BusinessDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessApi.dashboard();
      if (res.success) {
        setData(res.data as BusinessDashboardData);
      } else {
        setError(res.message || 'Could not load dashboard.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = data?.metrics ?? null;
  const activeCampaigns = data?.active_campaigns_list ?? [];
  const recentSubmissions = data?.recent_submissions ?? [];

  const cards = [
    {
      icon: Zap,
      label: 'Active Campaigns',
      value: metrics ? String(metrics.active_campaigns) : '—',
      sub: metrics ? `${metrics.total_campaigns} total campaigns` : 'Live campaigns right now',
      tone: 'text-[#168BFF]',
      bg: 'bg-blue-100',
    },
    {
      icon: CheckSquare,
      label: 'Verified Completions',
      value: metrics ? metrics.verified_tasks.toLocaleString() : '—',
      sub: 'Verified tasks across your campaigns',
      tone: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      icon: Wallet,
      label: 'Budget Spent',
      value: metrics ? money(metrics.spent_budget_cents, 'USD') : '—',
      sub: metrics ? `${money(metrics.remaining_budget_cents, 'USD')} still available` : 'Paid to contributors',
      tone: 'text-violet-600',
      bg: 'bg-violet-100',
    },
    {
      icon: Target,
      label: 'Avg. Cost / Task',
      value: metrics ? money(metrics.average_cost_cents, 'USD') : '—',
      sub: 'Across all your campaigns',
      tone: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Business Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Live campaign performance from your account.</p>
        </div>
        <Link
          to="/business/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <Megaphone className="w-4 h-4" />
          <span>Launch Campaign</span>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading dashboard…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load dashboard</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 text-xs font-bold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Metric Cards — real data only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((c) => (
              <div
                key={c.label}
                className="bg-white rounded-2xl p-5 border border-[#E7ECF3] shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${c.bg}`}>
                    <c.icon className={`w-4 h-4 ${c.tone}`} />
                  </div>
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{c.value}</h3>
                <p className="text-[11px] font-medium text-gray-500 mt-1.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Active campaigns — real list */}
          <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#168BFF]" /> Active Campaigns
              </h3>
              <Link
                to="/business/campaigns"
                className="text-[11px] font-bold text-[#168BFF] hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {activeCampaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No active campaigns yet"
                description="Launch your first campaign to see live performance here."
                actionLabel="Create Campaign"
                onAction={() => navigate('/business/campaigns/create')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="py-2 pr-4 font-bold">Campaign</th>
                      <th className="py-2 pr-4 font-bold">Reward / task</th>
                      <th className="py-2 pr-4 font-bold">Completions</th>
                      <th className="py-2 pr-4 font-bold">Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCampaigns.map((c: Campaign) => (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 pr-4 font-bold text-gray-900">{c.title}</td>
                        <td className="py-3 pr-4 text-gray-600">{money(c.reward_per_task_cents, 'USD')}</td>
                        <td className="py-3 pr-4 text-gray-600">
                          {(c.completed_contributors_count ?? 0)} / {(c.target_contributors_count ?? 0)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {money(Math.max(0, (c.total_budget_cents ?? 0) - (c.remaining_budget_cents ?? 0)), 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent submissions — real list */}
          <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" /> Latest Submissions
              </h3>
              <Link
                to="/business/submissions"
                className="text-[11px] font-bold text-[#168BFF] hover:underline inline-flex items-center gap-1"
              >
                Open Proof Gallery <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No submissions yet"
                description="Once contributors submit proof for your campaigns, it will appear here."
              />
            ) : (
              <div className="space-y-2.5">
                {recentSubmissions.slice(0, 5).map((s: TaskSubmission) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3 bg-[#F7F9FC] border border-[#E7ECF3] rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {s.task?.title || `Submission #${s.id}`}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {s.user?.name ? `by ${s.user.name} · ` : ''}
                        {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                      {String(s.status).replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
