import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Clock, Inbox, Loader2, UserPlus } from 'lucide-react';
import { notificationsApi } from '../../api';
import type { AppNotification } from '../../api';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';

const relativeTime = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (Number.isNaN(mins)) return 'recently';
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString();
};

/** Business → Notifications: new followers (with who they are) and other account updates. */
export const BusinessNotificationsPage: React.FC = () => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = async (next: number) => {
    setLoading(true);
    try {
      const res = await notificationsApi.list({ page: next });
      setItems((list) => (next === 1 ? res.data : [...list, ...res.data]));
      setPage(res.meta.current_page);
      setLastPage(res.meta.last_page);
    } catch {
      /* the list stays empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
  }, []);

  const unread = items.filter((n) => !n.read_at).length;

  const markAll = async () => {
    try {
      await notificationsApi.markRead();
      setItems((list) => list.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      window.dispatchEvent(new Event('ebiz:notifications-read'));
    } catch {
      /* toasted by the API client */
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#168BFF]" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unread > 0 ? `${unread} unread` : 'You are all caught up.'} New followers show here — follow them back from your{' '}
            <Link to="/business/profile" className="text-[#168BFF] font-bold hover:underline">profile</Link>.
          </p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAll} className="text-xs font-bold text-[#168BFF] hover:underline shrink-0 pt-1">
            Mark all read
          </button>
        )}
      </div>

      {!loading && items.length === 0 ? (
        <EmptyState icon={Inbox} title="No notifications yet" description="When contributors follow your business, you'll see who they are here." />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const person = n.data?.user as { name?: string; avatar_url?: string | null } | undefined;
            const inner = (
              <div
                className={`flex items-start gap-3.5 rounded-2xl border p-4 ${
                  n.read_at ? 'bg-white dark:bg-[#0C1322] border-[#E7ECF3] dark:border-white/10' : 'bg-blue-50/40 dark:bg-blue-500/10 border-[#168BFF]/30'
                }`}
              >
                {person ? (
                  <UserAvatar src={person.avatar_url} name={person.name} size="md" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-[#168BFF]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-100">{n.title}</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {relativeTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{n.body}</p>
                </div>
                {!n.read_at && <span className="w-2 h-2 rounded-full bg-[#168BFF] shrink-0 mt-1.5" />}
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
          {loading && (
            <div className="py-4 text-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin inline-block" />
            </div>
          )}
          {!loading && page < lastPage && (
            <button type="button" onClick={() => void load(page + 1)} className="w-full py-2 rounded-xl text-xs font-bold text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10">
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
};
