import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckSquare,
  Clock,
  Wallet,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { mapTaskForUi, money } from '../../utils/apiMappers';
import type { UiTask } from '../../types';
import { TaskCard } from '../../components/task/TaskCard';
import { EmptyState } from '../../components/common/EmptyState';

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

  const statCards = [
    {
      label: 'Available balance',
      value: money(stats?.available_balance_cents ?? 0),
      icon: Wallet,
      tint: 'bg-emerald-50 text-emerald-700',
      link: '/app/wallet',
    },
    {
      label: 'Pending review',
      value: money(stats?.pending_balance_cents ?? 0),
      icon: Clock,
      tint: 'bg-amber-50 text-amber-700',
      link: '/app/wallet',
    },
    {
      label: 'Tasks completed',
      value: String(stats?.completed_tasks_count ?? 0),
      icon: CheckSquare,
      tint: 'bg-blue-50 text-blue-700',
      link: '/app/my-tasks',
    },
    {
      label: 'In review',
      value: String(stats?.pending_tasks_count ?? 0),
      icon: TrendingUp,
      tint: 'bg-violet-50 text-violet-700',
      link: '/app/my-tasks',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#101828]">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Your verified tasks and earnings — all from real activity.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-[#07182F] text-white px-3 py-1.5 rounded-full shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16B364]" />
          {levelLabel[level] || 'Starter'}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E7ECF3] p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-red-700">{loadError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.link}
                className="bg-white rounded-3xl border border-[#E7ECF3] p-4 sm:p-5 hover:border-[#168BFF]/40 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 rounded-2xl ${card.tint} flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{card.label}</p>
                <p className="text-lg font-black text-gray-900 mt-0.5">{card.value}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recommended tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-[#101828]">Recommended for you</h2>
          <Link to="/app/tasks" className="inline-flex items-center gap-1 text-xs font-bold text-[#168BFF] hover:underline">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-[#E7ECF3] p-5 animate-pulse h-56" />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.slice(0, 6).map((task) => (
              <TaskCard key={task.uuid || task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Referral CTA */}
      <Link
        to="/app/referrals"
        className="flex items-center gap-4 bg-[#07182F] rounded-3xl p-5 sm:p-6 text-white hover:bg-[#0D2342] transition-colors"
      >
        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-[#16B364]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black">Invite friends, earn together</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Share your referral link — earn a reward when friends complete verified tasks.
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </Link>
    </div>
  );
};
