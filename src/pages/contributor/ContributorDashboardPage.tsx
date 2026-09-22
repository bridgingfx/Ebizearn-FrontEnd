import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckSquare,
  Clock,
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Compass,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { mapTaskForUi, money } from '../../utils/apiMappers';
import type { UiTask } from '../../types';
import { TaskCard } from '../../components/task/TaskCard';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard, SectionHeader } from '../../components/common/StatCard';

interface DashboardStats {
  available_balance_cents: number;
  pending_balance_cents: number;
  today_earnings_cents: number;
  completed_tasks_count: number;
  pending_tasks_count: number;
}

export const ContributorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recommended, setRecommended] = useState<UiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    tasksApi
      .contributorDashboard()
      .then((res) => {
        if (res.success) {
          setStats(res.data.stats);
          setRecommended((res.data.recommended_tasks || []).map(mapTaskForUi));
          setLoadError(null);
        } else {
          setLoadError('Could not load your dashboard.');
        }
      })
      .catch((error) => setLoadError(getApiError(error, 'Could not load your dashboard.')))
      .finally(() => setLoading(false));
  }, []);

  const levelLabel: Record<string, string> = {
    starter: 'Starter',
    explorer: 'Explorer',
    trusted: 'Trusted',
    pro: 'Pro',
    elite: 'Elite',
  };
  const level = user?.profile?.contributor_level || 'starter';
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <div className="space-y-8 text-left">
      {/* ── Hero greeting ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-navy-gradient p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#168BFF]/30 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-[#7257FF]/25 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] bg-white/10 border border-white/15 text-[#20C4E8] px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16B364]" />
              {levelLabel[level] || 'Starter'} level
            </span>
            <h1 className="mt-3 text-2xl sm:text-[2rem] font-black tracking-tight leading-tight">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-300">
              Your verified tasks and earnings — all from real activity.
            </p>
          </div>
          <Link
            to="/app/tasks"
            className="shrink-0 inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl bg-white text-[#07182F] font-extrabold text-base shadow-lg hover:bg-slate-100 transition-all"
          >
            <Compass className="w-5 h-5 text-[#168BFF]" />
            Find tasks
          </Link>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-[#E7ECF3] p-6 animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-7 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-700">{loadError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Available balance"
            value={money(stats?.available_balance_cents ?? 0)}
            sub="Ready to withdraw"
            icon={Wallet}
            gradient="from-emerald-500 to-teal-600"
            shadow="shadow-lg shadow-emerald-500/25"
            to="/app/wallet"
          />
          <StatCard
            label="Pending review"
            value={money(stats?.pending_balance_cents ?? 0)}
            sub="Approved, releasing soon"
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
            shadow="shadow-lg shadow-amber-500/25"
            to="/app/wallet"
          />
          <StatCard
            label="Tasks completed"
            value={String(stats?.completed_tasks_count ?? 0)}
            sub="Verified completions"
            icon={CheckSquare}
            gradient="from-[#168BFF] to-[#20C4E8]"
            shadow="shadow-lg shadow-blue-500/25"
            to="/app/my-tasks"
          />
          <StatCard
            label="In review"
            value={String(stats?.pending_tasks_count ?? 0)}
            sub="Proof being checked"
            icon={TrendingUp}
            gradient="from-[#7257FF] to-[#9D7BFF]"
            shadow="shadow-lg shadow-violet-500/25"
            to="/app/my-tasks"
          />
        </div>
      )}

      {/* ── Recommended tasks ─────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Recommended for you"
          subtitle="Picked from verified campaigns open right now."
          actionLabel="View all tasks"
          actionTo="/app/tasks"
        />
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[1.5rem] border border-[#E7ECF3] p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : recommended.length === 0 ? (
          <EmptyState
            title="No recommended tasks yet"
            description="Tasks matching your profile will appear here. Browse all available tasks to get started — every reward is paid from real campaign budgets after verification."
            icon={Compass}
            actionLabel="Browse available tasks"
            onAction={() => (window.location.href = '/app/tasks')}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.slice(0, 6).map((task) => (
              <TaskCard key={task.uuid || task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* ── Referral CTA ──────────────────────────────────────────── */}
      <Link
        to="/app/referrals"
        className="group relative overflow-hidden flex items-center gap-5 rounded-[1.75rem] p-6 sm:p-8 text-white bg-navy-gradient transition-all hover:shadow-xl"
      >
        <div className="absolute -top-20 right-10 w-64 h-64 rounded-full bg-[#16B364]/20 blur-3xl group-hover:bg-[#16B364]/30 transition-all" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16B364] to-[#0EA968] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div className="relative flex-1">
          <p className="text-lg font-black tracking-tight">Invite friends, earn together</p>
          <p className="text-sm text-slate-300 mt-1">
            Share your referral link — earn a reward when friends complete verified tasks.
          </p>
        </div>
        <span className="relative w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
          <ArrowRight className="w-5 h-5" />
        </span>
      </Link>
    </div>
  );
};
