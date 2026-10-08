import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { staffNotificationsApi } from '../../api/staffNotifications';
import type { AuditLog } from '../../types';
import { notificationView, timeAgo, type NotificationTone } from '../../utils/notificationText';

export const TONE_DOT: Record<NotificationTone, string> = {
  blue: 'bg-[#168BFF]',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
  gray: 'bg-gray-400',
};

/**
 * Admin / Super Admin header bell: unread count (checked every minute and
 * on tab focus) and the latest activity. Opening it marks everything seen.
 */
export const StaffNotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AuditLog[] | null>(null);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    staffNotificationsApi
      .unread()
      .then((res) => res.success && setUnread(res.data.unread))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = window.setInterval(refreshCount, 60_000);
    window.addEventListener('focus', refreshCount);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshCount);
    };
  }, [refreshCount]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setItems(null);
    try {
      const res = await staffNotificationsApi.list();
      setItems(res.data.slice(0, 8));
      setSeenAt(res.meta.seen_at);
      if (res.meta.unread > 0) {
        await staffNotificationsApi.markSeen();
        setUnread(0);
      }
    } catch {
      setItems([]);
    }
  };

  const isNew = (log: AuditLog) => !seenAt || new Date(log.created_at) > new Date(seenAt);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => void toggle()}
        className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
        aria-label={unread ? `${unread} new notifications` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-24px))] bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <p className="text-sm font-black text-gray-900 dark:text-gray-100">Notifications</p>
            <Link
              to="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-[#168BFF] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {items === null ? (
              <div className="py-8 text-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin inline-block" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">Nothing new yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/10">
                {items.map((log) => {
                  const v = notificationView(log);
                  return (
                    <li key={log.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          if (v.link) navigate(v.link);
                        }}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-white/5 ${
                          isNew(log) ? 'bg-blue-50/60 dark:bg-blue-500/5' : ''
                        }`}
                      >
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TONE_DOT[v.tone]}`} />
                        <span className="min-w-0">
                          <span className="block text-xs text-gray-800 dark:text-gray-200 leading-snug">{v.text}</span>
                          <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(log.created_at)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
