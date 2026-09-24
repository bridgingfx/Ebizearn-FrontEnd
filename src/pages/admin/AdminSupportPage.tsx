import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headset, Search, Loader2, X, RefreshCw, Eye } from 'lucide-react';
import { staffSupportApi, getApiError, type StaffTicketCounts } from '../../api';
import type { SupportTicket, TicketPriority, TicketStatus } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/ui';
import { TicketChat } from '../../components/support/TicketChat';
import { useHideChatWidget } from '../../utils/useHideChatWidget';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLES,
  formatTicketTime,
} from '../../utils/supportTickets';

type StatusFilter = 'active' | TicketStatus | 'all';

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
];

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low: 'text-gray-500 dark:text-gray-400',
  normal: 'text-gray-700 dark:text-gray-300',
  high: 'text-amber-600 dark:text-amber-400',
  urgent: 'text-red-600 dark:text-red-400',
};

const fieldClass =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]';

/**
 * Support desk queue. Tickets are opened by contributors / businesses via
 * POST /support/tickets and worked here through /staff/support/tickets.
 */
export const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [counts, setCounts] = useState<StaffTicketCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('active');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Keep the floating chat launcher from covering the drawer's composer.
  useHideChatWidget(!!selected);

  const selectedUuid = selected?.uuid;
  const fetchAttachment = useCallback(
    (messageId: number, index: number) => staffSupportApi.attachment(selectedUuid ?? '', messageId, index),
    [selectedUuid]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffSupportApi.list({ status: filter, search: debouncedSearch || undefined });
      if (res.success) {
        setTickets(res.data || []);
        setCounts(res.meta?.counts ?? null);
      } else {
        setError(res.message || 'Could not load tickets.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load tickets.'));
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyUpdated = (t: SupportTicket) => {
    setSelected(t);
    setTickets((prev) => prev.map((row) => (row.uuid === t.uuid ? { ...row, ...t } : row)));
  };

  const openTicket = async (t: SupportTicket) => {
    setSelected(t);
    setActionError(null);
    setDetailLoading(true);
    try {
      const res = await staffSupportApi.show(t.uuid);
      if (res.success) setSelected(res.data);
    } catch (e) {
      setActionError(getApiError(e, 'Could not load this ticket.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async (text: string, files: File[], internal: boolean): Promise<boolean> => {
    if (!selected) return false;
    setSending(true);
    setActionError(null);
    try {
      const res = await staffSupportApi.reply(selected.uuid, text, internal, files);
      if (res.success) {
        applyUpdated(res.data);
        return true;
      }
      setActionError(res.message || 'Could not send the reply.');
      return false;
    } catch (err) {
      setActionError(getApiError(err, 'Could not send the reply.'));
      return false;
    } finally {
      setSending(false);
    }
  };

  const updateTicket = async (payload: { status?: TicketStatus; priority?: TicketPriority }) => {
    if (!selected) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await staffSupportApi.update(selected.uuid, payload);
      if (res.success) {
        applyUpdated(res.data);
        void load();
      } else {
        setActionError(res.message || 'Could not update the ticket.');
      }
    } catch (err) {
      setActionError(getApiError(err, 'Could not update the ticket.'));
    } finally {
      setBusy(false);
    }
  };

  const countFor = (id: StatusFilter): number | null => {
    if (!counts) return null;
    if (id === 'active') return counts.open + counts.in_progress;
    if (id === 'all') return counts.open + counts.in_progress + counts.resolved + counts.closed;
    return counts[id];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Disputes"
        subtitle="Tickets opened by contributors and businesses. Replies appear in the user's helpdesk."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => {
              const n = countFor(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filter === f.id
                      ? 'bg-[#07182F] text-white'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
                  }`}
                >
                  {f.label}
                  {n !== null && <span className="ml-1.5 opacity-70">{n}</span>}
                </button>
              );
            })}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, TKT-ID, name or email"
              className={`${fieldClass} pl-9`}
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-red-600 dark:text-red-400 font-semibold">{error}</div>
        ) : loading && tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin inline-block" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Headset}
              title="No tickets here"
              description={
                filter === 'active'
                  ? 'No open tickets right now. New tickets from contributors and businesses will appear here.'
                  : 'No tickets match this filter.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {tickets.map((t) => (
                  <tr
                    key={t.uuid}
                    onClick={() => void openTicket(t)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                      selected?.uuid === t.uuid ? 'bg-blue-50/60 dark:bg-blue-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono text-[10px] text-gray-400 block">{t.reference}</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100 block truncate">{t.subject}</span>
                      {t.description && (
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">{t.description}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 block">{t.user?.name ?? '—'}</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block">{t.user?.email}</span>
                      {t.user?.role && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t.user.role}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{TICKET_CATEGORY_LABELS[t.category] ?? t.category}</td>
                    <td className={`py-3 px-4 font-bold ${PRIORITY_STYLES[t.priority]}`}>{TICKET_PRIORITY_LABELS[t.priority]}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${TICKET_STATUS_STYLES[t.status]}`}>
                        {TICKET_STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTicketTime(t.updated_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void openTicket(t);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#07182F] hover:bg-[#168BFF] text-white text-[11px] font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-xl h-full bg-white dark:bg-[#0C1322] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#F9CE34] via-[#EE2A7B] to-[#6228D7] shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#07182F] text-white font-bold text-sm flex items-center justify-center ring-2 ring-white dark:ring-[#0C1322]">
                    {(selected.user?.name || '?').trim()[0]?.toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  {selected.user ? (
                    <Link
                      to={`/admin/users/${selected.user.id}`}
                      className="text-sm font-black text-gray-900 dark:text-gray-100 hover:underline block truncate"
                    >
                      {selected.user.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100 block">Unknown user</span>
                  )}
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    <span className="font-mono">{selected.reference}</span> · {selected.subject} ·{' '}
                    {TICKET_CATEGORY_LABELS[selected.category] ?? selected.category}
                  </p>
                  {selected.assigned_agent && (
                    <p className="text-[10px] text-gray-400">Assigned to {selected.assigned_agent.name}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                <select
                  value={selected.status}
                  disabled={busy}
                  onChange={(e) => void updateTicket({ status: e.target.value as TicketStatus })}
                  className={fieldClass}
                >
                  {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {TICKET_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Priority</span>
                <select
                  value={selected.priority}
                  disabled={busy}
                  onChange={(e) => void updateTicket({ priority: e.target.value as TicketPriority })}
                  className={fieldClass}
                >
                  {(Object.keys(TICKET_PRIORITY_LABELS) as TicketPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {TICKET_PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <TicketChat
              key={selected.uuid}
              messages={selected.messages ?? []}
              viewer="staff"
              counterpartName={selected.user?.name ?? 'User'}
              loading={detailLoading}
              sending={sending}
              error={actionError}
              allowInternal
              fetchAttachment={fetchAttachment}
              onSend={sendReply}
            />
          </div>
        </div>
      )}
    </div>
  );
};
