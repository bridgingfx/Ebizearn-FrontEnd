import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Search, Users, X } from 'lucide-react';
import type { FollowPerson, PagedPeople } from '../../api';
import { UserAvatar } from '../common/UserAvatar';

interface FollowListModalProps {
  open: boolean;
  title: string;
  /** Loads one page of people (followers or following). */
  fetchPage: (page: number, search: string) => Promise<PagedPeople>;
  /** Optional action per row (follow back, unfollow, open user…). */
  renderAction?: (person: FollowPerson, update: (next: Partial<FollowPerson> | null) => void) => React.ReactNode;
  /** Optional link per row (staff: open that user's page). */
  personHref?: (person: FollowPerson) => string | undefined;
  onClose: () => void;
}

/** Followers / following popup: searchable, paged user list. Closes on Escape or backdrop click. */
export const FollowListModal: React.FC<FollowListModalProps> = ({ open, title, fetchPage, renderAction, personHref, onClose }) => {
  const [people, setPeople] = useState<FollowPerson[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number, q: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPage(nextPage, q);
        setPeople((list) => (nextPage === 1 ? res.data : [...list, ...res.data]));
        setPage(res.meta.current_page);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total);
      } catch {
        setError('Could not load this list.');
      } finally {
        setLoading(false);
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    if (open) void load(1, query);
  }, [open, query, load]);

  // Debounce the search box.
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setQuery('');
      setPeople([]);
    }
  }, [open]);

  if (!open) return null;

  const update = (id: number) => (next: Partial<FollowPerson> | null) =>
    setPeople((list) => (next === null ? list.filter((p) => p.id !== id) : list.map((p) => (p.id === id ? { ...p, ...next } : p))));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-list-title"
        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-white dark:bg-[#0C1322] text-left shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/10">
          <h3 id="follow-list-title" className="text-base font-black text-[#101828] dark:text-gray-100">
            {title} <span className="text-gray-400 dark:text-gray-500 font-bold">· {total}</span>
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1">
          {error && <p className="text-xs text-red-600 dark:text-red-400 py-2">{error}</p>}
          {!loading && !error && people.length === 0 && (
            <div className="py-10 text-center text-gray-400 dark:text-gray-500">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-bold">{query ? 'Nobody matches that search.' : 'Nobody here yet.'}</p>
            </div>
          )}
          {people.map((p) => {
            const href = personHref?.(p);
            const who = (
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar src={p.avatar_url} name={p.name} email={p.email} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {[p.email, p.country_code, p.role].filter(Boolean).join(' · ')}
                    {p.mutual && <span className="ml-1 text-[#168BFF] font-bold">· mutual</span>}
                  </p>
                </div>
              </div>
            );
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
                {href ? (
                  <a href={href} className="min-w-0 hover:opacity-80">
                    {who}
                  </a>
                ) : (
                  who
                )}
                {renderAction && <div className="shrink-0">{renderAction(p, update(p.id))}</div>}
              </div>
            );
          })}
          {loading && (
            <div className="py-4 text-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin inline-block" />
            </div>
          )}
          {!loading && page < lastPage && (
            <button
              type="button"
              onClick={() => void load(page + 1, query)}
              className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10"
            >
              Load more
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
