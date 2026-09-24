import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Send,
  FileText,
  LifeBuoy,
  Loader2,
  Paperclip,
  Eye,
  X,
} from 'lucide-react';
import { supportApi, getApiError } from '../../api';
import { TicketChat } from '../../components/support/TicketChat';
import { useHideChatWidget } from '../../utils/useHideChatWidget';
import type { SupportTicket, TicketCategory } from '../../types';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLES,
  formatTicketTime,
} from '../../utils/supportTickets';

const fieldClass =
  'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]';

export const ContributorSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // New Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('payout');
  const [ticketDescription, setTicketDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Ticket detail / conversation
  const [ticketFiles, setTicketFiles] = useState<File[]>([]);

  const [openTicket, setOpenTicket] = useState<SupportTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Keep the floating chat launcher from covering the Send button.
  useHideChatWidget(!!openTicket || showNewTicketModal);

  const openUuid = openTicket?.uuid;
  const fetchAttachment = useCallback(
    (messageId: number, index: number) => supportApi.attachment(openUuid ?? '', messageId, index),
    [openUuid]
  );

  const faqs = [
    {
      q: 'Why did my task submission get flagged by the AI scanner?',
      a: 'Submissions are checked by computer vision OCR for live timestamps, correct hashtags, and your verified username. If you cropped the header or submitted a screenshot older than 24 hours, the AI may flag it. You can dispute any decision here for human review.',
    },
    {
      q: 'How long does a withdrawal take to reach me?',
      a: 'Payouts are processed to your chosen method — PayPal, Wise, direct bank transfer, or digital currency. Processing times vary by method; withdrawals are queued for manual processing and you can track the status in your wallet.',
    },
    {
      q: 'Can I change my connected TikTok or Instagram account?',
      a: 'Yes, head to your Profile -> Connected Social Accounts tab to submit a handle change. Our compliance team verifies handle ownership before the change goes live.',
    },
    {
      q: 'What is the minimum cashout threshold?',
      a: 'The minimum withdrawal is $50.00. We never charge withdrawal fees or account maintenance fees. Withdrawals are queued for manual processing.',
    },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await supportApi.list();
      setTickets(res.success ? res.data || [] : []);
      if (!res.success) setLoadError(res.message || 'Could not load your tickets.');
    } catch (e) {
      setLoadError(getApiError(e, 'Could not load your tickets.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter === 'open' && !(t.status === 'open' || t.status === 'in_progress')) return false;
      if (statusFilter === 'resolved' && !(t.status === 'resolved' || t.status === 'closed')) return false;
      if (!q) return true;
      return t.subject.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q);
    });
  }, [tickets, searchQuery, statusFilter]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      const res = await supportApi.create({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        message: ticketDescription.trim(),
        attachments: ticketFiles,
      });
      if (!res.success) {
        setCreateError(res.message || 'Could not submit your ticket.');
        return;
      }
      setTickets((prev) => [res.data, ...prev]);
      setTicketSubmitted(true);
      setTimeout(() => {
        setTicketSubmitted(false);
        setShowNewTicketModal(false);
        setTicketSubject('');
        setTicketDescription('');
        setTicketFiles([]);
      }, 1200);
    } catch (err) {
      setCreateError(getApiError(err, 'Could not submit your ticket.'));
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (t: SupportTicket) => {
    setOpenTicket(t);
    setReplyError(null);
    setDetailLoading(true);
    try {
      const res = await supportApi.show(t.uuid);
      if (res.success) setOpenTicket(res.data);
    } catch (err) {
      setReplyError(getApiError(err, 'Could not load this ticket.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReply = async (text: string, files: File[]): Promise<boolean> => {
    if (!openTicket) return false;
    setReplying(true);
    setReplyError(null);
    try {
      const res = await supportApi.reply(openTicket.uuid, text, files);
      if (res.success) {
        setOpenTicket(res.data);
        setTickets((prev) => prev.map((t) => (t.uuid === res.data.uuid ? { ...t, ...res.data } : t)));
        return true;
      }
      setReplyError(res.message || 'Could not send your reply.');
      return false;
    } catch (err) {
      setReplyError(getApiError(err, 'Could not send your reply.'));
      return false;
    } finally {
      setReplying(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="space-y-6 text-left font-sans max-w-6xl mx-auto">

      {/* =========================================================================
          1. HEADER & ACTION
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">
            Contributor Helpdesk & Support
          </h1>
          <p className="text-xs sm:text-sm text-[#475467] mt-0.5">
            Resolve task verification disputes, payout inquiries, and account questions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateError(null);
            setShowNewTicketModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1277dc] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Ticket</span>
        </button>
      </div>

      {/* =========================================================================
          2. SUMMARY STAT CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">Total Tickets</span>
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5 block">{tickets.length}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">In Progress / Open</span>
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5 block">{openCount}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-[#16B364] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">Email Support</span>
            <a href="mailto:support@ebizearn.com" className="text-sm font-black text-[#168BFF] hover:underline mt-0.5 block break-all">
              support@ebizearn.com
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TICKETS TABLE & SEARCH
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your tickets by subject or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'open', 'resolved'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  statusFilter === filter
                    ? 'bg-[#07182F] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Ticket ID</th>
                <th className="py-3.5 px-5">Subject</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Updated</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-xs">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-600 dark:text-red-400 font-semibold">
                    {loadError}{' '}
                    <button type="button" onClick={() => void load()} className="underline">
                      Retry
                    </button>
                  </td>
                </tr>
              )}
              {!loading && !loadError && visibleTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">
                    {tickets.length === 0 ? 'You have not opened any tickets yet.' : 'No tickets match this filter.'}
                  </td>
                </tr>
              )}
              {!loading &&
                visibleTickets.map((t) => (
                  <tr
                    key={t.uuid}
                    onClick={() => void openDetail(t)}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-gray-900 dark:text-gray-100">{t.reference}</td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-gray-900 dark:text-gray-100 block">{t.subject}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {t.messages_count ?? 1} {t.messages_count === 1 ? 'message' : 'messages'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-600 dark:text-gray-400 font-medium">
                      {TICKET_CATEGORY_LABELS[t.category] ?? t.category}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${TICKET_STATUS_STYLES[t.status]}`}>
                        {TICKET_STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 dark:text-gray-400 font-mono">{formatTicketTime(t.updated_at)}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void openDetail(t);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#168BFF]/10 hover:bg-[#168BFF] text-[#168BFF] hover:text-white text-[11px] font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          4. FREQUENTLY ASKED QUESTIONS
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <LifeBuoy className="w-5 h-5 text-[#168BFF]" />
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Instant Answers & Knowledge Base</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
                      isOpen ? 'rotate-180 text-[#168BFF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 border-t border-gray-100 dark:border-white/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL: CREATE NEW TICKET
         ========================================================================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-white/10 relative space-y-5 animate-scale-up">
            <button
              type="button"
              onClick={() => setShowNewTicketModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Open Support Ticket</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Our support team replies right here in your helpdesk.</p>
              </div>
            </div>

            {ticketSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-[#16B364] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Ticket Submitted!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Our support desk is reviewing your submission.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as TicketCategory)}
                    className={fieldClass}
                  >
                    <option value="payout">Payout Inquiry & Withdrawal Status</option>
                    <option value="dispute">OCR Task Proof Verification Dispute</option>
                    <option value="kyc">Identity / KYC Verification</option>
                    <option value="social">Connected Social Account Issue</option>
                    <option value="account">Account & Login</option>
                    <option value="bug">Platform Bug or Technical Error</option>
                    <option value="general">Something else</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Subject</label>
                  <input
                    type="text"
                    placeholder="E.g. Task #4928 proof verification rejected unfairly"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className={fieldClass}
                    minLength={3}
                    maxLength={191}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Detailed Description</label>
                  <textarea
                    rows={4}
                    placeholder="Explain what happened, include task IDs or transaction references..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className={fieldClass}
                    minLength={5}
                    maxLength={5000}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Screenshots or files <span className="font-normal text-gray-400">(optional, up to 5 · 10MB each)</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/15 hover:border-[#168BFF] text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer transition-colors">
                    <Paperclip className="w-4 h-4" />
                    {ticketFiles.length ? `${ticketFiles.length} file(s) attached — click to change` : 'Attach images, PDF or documents'}
                    <input
                      type="file"
                      multiple
                      hidden
                      accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                      onChange={(e) => setTicketFiles(Array.from(e.target.files ?? []).slice(0, 5))}
                    />
                  </label>
                  {ticketFiles.length > 0 && (
                    <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                      {ticketFiles.map((f) => (
                        <li key={f.name} className="truncate">• {f.name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {createError && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {createError}
                  </p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-[#168BFF] hover:bg-[#1277dc] disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{creating ? 'Submitting…' : 'Submit Ticket'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TICKET CONVERSATION
         ========================================================================= */}
      {openTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl max-w-2xl w-full h-[88vh] flex flex-col shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#F9CE34] via-[#EE2A7B] to-[#6228D7] shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#07182F] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0C1322]">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100">eBizEarn Support</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TICKET_STATUS_STYLES[openTicket.status]}`}>
                      {TICKET_STATUS_LABELS[openTicket.status]}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    <span className="font-mono">{openTicket.reference}</span> · {openTicket.subject} ·{' '}
                    {TICKET_CATEGORY_LABELS[openTicket.category] ?? openTicket.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenTicket(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TicketChat
              key={openTicket.uuid}
              messages={openTicket.messages ?? []}
              viewer="user"
              counterpartName="eBizEarn Support"
              loading={detailLoading}
              sending={replying}
              error={replyError}
              closedNote={openTicket.status === 'closed' ? 'This ticket is closed. Open a new ticket if you need more help.' : null}
              fetchAttachment={fetchAttachment}
              onSend={(text, files) => handleReply(text, files)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
