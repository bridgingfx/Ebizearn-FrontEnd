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
  Plus,
} from 'lucide-react';
import { businessApi, getApiError } from '../../api';
import type { BusinessDashboardData, Campaign, TaskSubmission } from '../../types';
import { money } from '../../utils/apiMappers';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard, SectionHeader } from '../../components/common/StatCard';

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
  const companyName = data?.business?.company_name;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* ── Hero header ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-navy-gradient p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#168BFF]/30 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-[#16B364]/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#20C4E8]">
              Business command center
            </p>
            <h1 className="mt-2 text-2xl sm:text-[2rem] font-black tracking-tight leading-tight">
              {companyName || 'Business Dashboard'}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-300">
              Live campaign performance from your account.
            </p>
          </div>
          <Link
            to="/business/campaigns/create"
            className="shrink-0 inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl bg-gradient-to-r from-[#16B364] to-[#0EA968] text-white font-extrabold text-base shadow-lg shadow-emerald-500/30 hover:brightness-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Launch campaign
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading dashboard…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load dashboard</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 text-sm font-bold text-red-700 underline min-h-[44px]"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Metric cards — real data only ─────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active campaigns"
              value={metrics ? String(metrics.active_campaigns) : '—'}
              sub={metrics ? `${metrics.total_campaigns} total campaigns` : 'Live campaigns right now'}
              icon={Zap}
              gradient="from-[#168BFF] to-[#20C4E8]"
              shadow="shadow-lg shadow-blue-500/25"
            />
            <StatCard
              label="Verified completions"
              value={metrics ? metrics.verified_tasks.toLocaleString() : '—'}
              sub="Verified tasks across your campaigns"
              icon={CheckSquare}
              gradient="from-emerald-500 to-teal-600"
              shadow="shadow-lg shadow-emerald-500/25"
            />
            <StatCard
              label="Budget spent"
              value={metrics ? money(metrics.spent_budget_cents, 'USD') : '—'}
              sub={metrics ? `${money(metrics.remaining_budget_cents, 'USD')} still available` : 'Paid to contributors'}
              icon={Wallet}
              gradient="from-[#7257FF] to-[#9D7BFF]"
              shadow="shadow-lg shadow-violet-500/25"
            />
            <StatCard
              label="Avg. cost / task"
              value={metrics ? money(metrics.average_cost_cents, 'USD') : '—'}
              sub="Across all your campaigns"
              icon={Target}
              gradient="from-amber-500 to-orange-600"
              shadow="shadow-lg shadow-amber-500/25"
            />
          </div>

          {/* ── Active campaigns — real list ──────────────────────── */}
          <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6 sm:p-7">
            <SectionHeader
              title="Active campaigns"
              subtitle="Live campaigns spending right now."
              actionLabel="View all"
              actionTo="/business/campaigns"
            />

            {activeCampaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No active campaigns yet"
                description="Launch your first campaign to see live performance here."
                actionLabel="Create Campaign"
                onAction={() => navigate('/business/campaigns/create')}
              />
            ) : (
              <div className="space-y-3">
                {activeCampaigns.map((c: Campaign) => {
                  const target = c.target_contributors_count || 0;
                  const done = c.completed_contributors_count || 0;
                  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
                  const spent = Math.max(0, (c.total_budget_cents ?? 0) - (c.remaining_budget_cents ?? 0));
                  return (
                    <Link
                      key={c.id}
                      to={`/business/campaigns/${c.id}`}
                      className="group block rounded-2xl border border-slate-100 bg-[#F8FAFD] hover:bg-white dark:hover:bg-[#0C1322] hover:border-[#168BFF]/40 hover:shadow-md p-4 sm:p-5 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-gray-100 truncate group-hover:text-[#168BFF] transition-colors">
                            {c.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                            {money(c.reward_per_task_cents, 'USD')} per task · {done.toLocaleString()} / {target.toLocaleString()} completions
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-900 dark:text-gray-100">{money(spent, 'USD')}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">spent</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#168BFF] to-[#20C4E8] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Recent submissions — real list ────────────────────── */}
          <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6 sm:p-7">
            <SectionHeader
              title="Latest submissions"
              subtitle="Proof submitted by contributors, newest first."
              actionLabel="Open proof gallery"
              actionTo="/business/submissions"
            />

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
                    className="flex items-center justify-between gap-3 px-4 py-3.5 bg-[#F8FAFD] border border-slate-100 rounded-2xl"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#168BFF]/10 text-[#168BFF] flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-gray-100 truncate">
                          {s.task?.title || `Submission #${s.id}`}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-gray-500">
                          {s.user?.name ? `by ${s.user.name} · ` : ''}
                          {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
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
