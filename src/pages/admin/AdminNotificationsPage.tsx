import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { getApiError } from '../../api';
import { staffNotificationsApi, type NotificationCategory } from '../../api/staffNotifications';
import type { AuditLog } from '../../types';
import { ErrorBlock, LoadingBlock, PageHeader } from '../../components/common/ui';
import { EmptyState } from '../../components/common/EmptyState';
import { TONE_DOT } from '../../components/admin/StaffNotificationBell';
import { notificationView, timeAgo } from '../../utils/notificationText';

const FILTERS: { key: NotificationCategory; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'users', label: 'Users' },
  { key: 'kyc', label: 'KYC & verification' },
  { key: 'tasks', label: 'Tasks & proofs' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'money', label: 'Deposits & withdrawals' },
  { key: 'support', label: 'Support' },
  { key: 'staff', label: 'Staff changes' },
];

/**
 * Admin / Super Admin: every notification — sign-ups, KYC, tasks and proofs,
 * campaigns, money movements, tickets and changes made by staff.
 */
export const AdminNotificationsPage: React.FC = () => {
  const [category, setCategory] = useState<NotificationCategory>('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AuditLog[] | null>(null);
  const [meta, setMeta] = useState<{ last_page: number; total: number; seen_at: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    setError(null);
    try {
      const res = await staffNotificationsApi.list({ category, page });
      setRows(res.data);
      setMeta({ last_page: res.meta.last_page, total: res.meta.total, seen_at: res.meta.seen_at });
      if (res.meta.unread > 0) void staffNotificationsApi.markSeen();
    } catch (e) {
      setError(getApiError(e, 'Could not load notifications.'));
    }
  }, [category, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const isNew = (log: AuditLog) => !meta?.seen_at || new Date(log.created_at) > new Date(meta.seen_at);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Everything happening on the platform: sign-ups, KYC, tasks and proofs, campaigns, deposits, withdrawals, tickets and staff changes."
      />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            type="button"
            onClick={() => {
              setCategory(f.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              category === f.key
                ? 'bg-[#07182F] dark:bg-[#168BFF] text-white'
                : 'bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBlock message={error} onRetry={() => void load()} />
      ) : rows === null ? (
        <LoadingBlock label="Loading notifications…" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="New activity on the platform will show up here." />
      ) : (
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {rows.map((log) => {
              const v = notificationView(log);
              const body = (
                <>
                  <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${TONE_DOT[v.tone]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-gray-800 dark:text-gray-200">{v.text}</span>
                    <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {timeAgo(log.created_at)} · {new Date(log.created_at).toLocaleString()}
                    </span>
                  </span>
                  {v.link && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" />}
                </>
              );
              const cls = `flex gap-3 px-5 py-3.5 ${isNew(log) ? 'bg-blue-50/60 dark:bg-blue-500/5' : ''}`;
              return (
                <li key={log.id}>
                  {v.link ? (
                    <Link to={v.link} className={`${cls} hover:bg-gray-50 dark:hover:bg-white/5`}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {meta.last_page} · {meta.total} notifications
          </span>
          <button
            type="button"
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
