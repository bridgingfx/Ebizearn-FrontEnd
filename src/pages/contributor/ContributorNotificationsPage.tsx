import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet as WalletIcon,
  Users,
  ArrowRight,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { walletApi, tasksApi, getApiError } from '../../api';
import { mapTaskForUi } from '../../utils/apiMappers';
import type { WalletTransaction, TaskSubmission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';

interface NotificationItem {
  id: string;
  kind: 'approved' | 'rejected' | 'action_required' | 'reward' | 'withdrawal' | 'referral' | 'info';
  title: string;
  description: string;
  amount?: string;
  createdAt: string;
  link?: string;
}

const READ_KEY = 'ebiz.notifications.read';

function getReadSet(userId?: number | string): Set<string> {
  try {
    const raw = localStorage.getItem(`${READ_KEY}.${userId || 'anon'}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveReadSet(userId: number | string | undefined, set: Set<string>) {
  try {
    localStorage.setItem(`${READ_KEY}.${userId || 'anon'}`, JSON.stringify([...set]));
  } catch {
    /* private-mode storage — non-fatal */
  }
}

const fmtMoney = (cents: number, currency: string) => `${currency} ${(cents / 100).toFixed(2)}`;

const kindIcon = (kind: NotificationItem['kind']) => {
  switch (kind) {
    case 'approved':
    case 'reward':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'action_required':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'withdrawal':
      return <WalletIcon className="w-5 h-5 text-[#168BFF]" />;
    case 'referral':
      return <Users className="w-5 h-5 text-violet-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
  }
};

const relativeTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'recently';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Notifications center for contributors.
 *
 * There is no dedicated notifications API — events are aggregated from the
 * contributor's own real data: submission decisions, wallet transactions,
 * and referral activity. Read state is stored locally per account.
 */
export const ContributorNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(getReadSet(user?.id));
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [txRes, myRes, refRes] = await Promise.all([
          walletApi.transactions().catch(() => ({ success: false as const, data: [] })),
          tasksApi.myTasks().catch(() => ({ success: false as const, data: [] as TaskSubmission[] })),
          tasksApi.referrals().catch(() => ({ success: false as const, data: null })),
        ]);

        const out: NotificationItem[] = [];

        if (myRes.success && Array.isArray(myRes.data)) {
          for (const s of myRes.data) {
            if (!s.created_at) continue;
            const task = s.task ? mapTaskForUi(s.task) : null;
            const title = task?.title || `Task #${s.task_id}`;
            if (s.status === 'approved') {
              out.push({
                id: `sub-approved-${s.id}`,
                kind: 'approved',
                title: 'Proof approved',
                description: `Your proof for "${title}" was approved. Reward credited to your wallet.`,
                amount: task ? fmtMoney(task.reward_cents, 'USD') : undefined,
                createdAt: s.reviewed_at || s.created_at,
                link: `/app/tasks/${task?.uuid || task?.id || ''}`,
              });
            } else if (s.status === 'rejected') {
              out.push({
                id: `sub-rejected-${s.id}`,
                kind: 'rejected',
                title: 'Proof rejected',
                description: `Your proof for "${title}" was rejected.${s.review_notes ? ` Reviewer: ${s.review_notes}` : ''}`,
                createdAt: s.reviewed_at || s.created_at,
                link: `/app/tasks/${task?.uuid || task?.id || ''}`,
              });
            } else if (s.status === 'action_required') {
              out.push({
                id: `sub-action-${s.id}`,
                kind: 'action_required',
                title: 'Resubmission requested',
                description: `A reviewer needs changes on "${title}".${s.review_notes ? ` ${s.review_notes}` : ''}`,
                createdAt: s.reviewed_at || s.created_at,
                link: `/app/tasks/${task?.uuid || task?.id || ''}`,
              });
            } else if (s.status === 'under_review' || s.status === 'submitted') {
              out.push({
                id: `sub-review-${s.id}`,
                kind: 'info',
                title: 'Proof under review',
                description: `Your proof for "${title}" is being verified.`,
                createdAt: s.created_at,
                link: `/app/tasks/${task?.uuid || task?.id || ''}`,
              });
            }
          }
        }

        const txData = (txRes as { success?: boolean; data?: unknown }).data;
        const txList = (txData as { data?: WalletTransaction[] })?.data
          || (txData as WalletTransaction[])
          || [];
        if (Array.isArray(txList)) {
          for (const t of txList.slice(0, 20)) {
            const desc = t.description || '';
            if (t.type === 'withdrawal') {
              out.push({
                id: `tx-${t.id}`,
                kind: 'withdrawal',
                title: 'Withdrawal requested',
                description: `Payout of ${fmtMoney(t.amount_cents, t.currency)} is on its way${desc ? ` — ${desc}` : ''}.`,
                amount: fmtMoney(t.amount_cents, t.currency),
                createdAt: t.created_at,
                link: '/app/wallet',
              });
            } else if (t.type === 'referral_reward') {
              out.push({
                id: `tx-${t.id}`,
                kind: 'referral',
                title: 'Referral reward earned',
                description: `You earned ${fmtMoney(t.amount_cents, t.currency)} from a referral.${desc ? ` ${desc}` : ''}`,
                amount: fmtMoney(t.amount_cents, t.currency),
                createdAt: t.created_at,
                link: '/app/referrals',
              });
            } else if (t.type === 'task_reward') {
              out.push({
                id: `tx-${t.id}`,
                kind: 'reward',
                title: 'Reward credited',
                description: `${fmtMoney(t.amount_cents, t.currency)} credited${desc ? ` — ${desc}` : ''}.`,
                amount: fmtMoney(t.amount_cents, t.currency),
                createdAt: t.created_at,
                link: '/app/wallet',
              });
            }
          }
        }

        const refData = (refRes as { success?: boolean; data?: { referrals?: { id: number; created_at: string; referred_user?: { name: string } }[] } }).data;
        if (refData?.referrals) {
          for (const r of refData.referrals.slice(0, 10)) {
            out.push({
              id: `ref-${r.id}`,
              kind: 'referral',
              title: 'New referral',
              description: `${r.referred_user?.name || 'Someone'} joined using your referral link.`,
              createdAt: r.created_at,
              link: '/app/referrals',
            });
          }
        }

        out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(out.slice(0, 60));
      } catch (err) {
        setError(getApiError(err, 'Could not load notifications.'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const unread = useMemo(() => items.filter((i) => !readIds.has(i.id)), [items, readIds]);

  const markAllRead = () => {
    const next = new Set(readIds);
    items.forEach((i) => next.add(i.id));
    setReadIds(next);
    saveReadSet(user?.id, next);
  };

  const markOneRead = (id: string) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadSet(user?.id, next);
  };

  if (loading) {
    return (
      <div className="space-y-3 max-w-3xl">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 p-5 animate-pulse flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-1/3" />
              <div className="h-3 bg-gray-50 dark:bg-white/5 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#168BFF] text-white flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-gray-100">Notifications</h1>
            <p className="text-xs text-[#667085] mt-0.5">
              {unread.length > 0 ? `${unread.length} unread update${unread.length === 1 ? '' : 's'}` : 'You are all caught up.'}
            </p>
          </div>
        </div>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-bold text-[#168BFF] hover:underline shrink-0 pt-1"
          >
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications yet"
          description="Verification decisions, payouts, and referral activity will appear here once you start completing tasks."
          actionLabel="Browse tasks"
          onAction={() => (window.location.href = '/app/tasks')}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const isRead = readIds.has(n.id);
            const inner = (
              <div
                className={`flex items-start gap-3.5 bg-white dark:bg-[#0C1322] rounded-2xl border p-4 transition-all ${
                  isRead ? 'border-[#E7ECF3] dark:border-white/10' : 'border-[#168BFF]/30 shadow-sm bg-blue-50/30'
                }`}
                onClick={() => markOneRead(n.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isRead ? 'bg-gray-50 dark:bg-white/5' : 'bg-white dark:bg-[#0C1322]'}`}>
                  {kindIcon(n.kind)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-100">{n.title}</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{n.description}</p>
                  {n.amount && <p className="text-xs font-black text-[#16B364] mt-1.5">+ {n.amount}</p>}
                </div>
                {!isRead && <span className="w-2 h-2 rounded-full bg-[#168BFF] shrink-0 mt-1.5" />}
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} className="block hover:translate-y-[-1px] transition-transform">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="text-center">
          <Link to="/app/tasks" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline">
            Find more tasks to earn <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

/** Unread count helper for the shell bell badge — cheap, local, no extra API. */
export function useUnreadNotifications(): number | null {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [myRes, refRes] = await Promise.all([
          tasksApi.myTasks().catch(() => ({ success: false as const, data: [] as TaskSubmission[] })),
          tasksApi.referrals().catch(() => ({ success: false as const, data: null })),
        ]);
        const ids: string[] = [];
        if (myRes.success && Array.isArray(myRes.data)) {
          for (const s of myRes.data) {
            if (!s.created_at) continue;
            if (['approved', 'rejected', 'action_required'].includes(s.status)) {
              ids.push(`sub-${s.status === 'action_required' ? 'action' : s.status}-${s.id}`);
            }
          }
        }
        const refData = (refRes as { data?: { referrals?: { id: number }[] } }).data;
        refData?.referrals?.forEach((r) => ids.push(`ref-${r.id}`));
        const read = getReadSet(user?.id);
        setCount(ids.filter((id) => !read.has(id)).length);
      } catch {
        setCount(null);
      }
    };
    if (user) void load();
  }, [user]);

  return count;
}
