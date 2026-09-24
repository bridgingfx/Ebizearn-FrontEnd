import type { TicketCategory, TicketPriority, TicketStatus } from '../types';

/** Shared display helpers for support tickets (user helpdesk + staff queue). */

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  payout: 'Payout Inquiry',
  dispute: 'Verification Dispute',
  social: 'Social Account',
  bug: 'Bug / Technical',
  account: 'Account',
  kyc: 'KYC Verification',
  business: 'Business / Campaign',
  general: 'General Support',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  in_progress: 'bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] border-blue-200 dark:border-blue-500/30',
  resolved: 'bg-emerald-50 dark:bg-emerald-500/15 text-[#16B364] border-emerald-200 dark:border-emerald-500/30',
  closed: 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const formatTicketTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 60 * 24) return `${Math.round(diffMin / 60)}h ago`;
  return d.toLocaleDateString();
};
