import type { AuditLog } from '../types';
import { auditEntityLink, humanizeAction } from './auditLabels';

export type NotificationTone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'gray';

export interface NotificationView {
  text: string;
  tone: NotificationTone;
  link?: string;
}

const money = (cents?: number | null) => (typeof cents === 'number' ? `$${(cents / 100).toFixed(2)}` : '');

/** One readable sentence per platform event for the staff notification bell. */
export function notificationView(log: AuditLog): NotificationView {
  const who = log.actor?.name || 'System';
  const what = log.entity_name ? `“${log.entity_name}”` : '';
  const after = (log.after_state_json ?? {}) as Record<string, unknown>;
  const link = auditEntityLink(log);

  const map: Record<string, () => NotificationView> = {
    'user.registered': () => ({ text: `${log.entity_name || 'Someone'} signed up as a ${String(after.role || 'user')}`, tone: 'blue' }),
    'user.team_member_joined': () => ({ text: `${who} added team member ${log.entity_name ?? ''}`.trim(), tone: 'blue' }),
    'business_user.created': () => ({ text: `${who} created business account ${what}`, tone: 'blue' }),
    'kyc.submitted': () => ({ text: `${who} submitted KYC documents for review`, tone: 'amber', link: '/admin/kyc' }),
    'kyc.approved': () => ({ text: `${who} approved KYC for ${log.entity_name ?? 'a user'}`, tone: 'green', link: '/admin/kyc' }),
    'kyc.rejected': () => ({ text: `${who} rejected KYC for ${log.entity_name ?? 'a user'}`, tone: 'red', link: '/admin/kyc' }),
    'profile.country_change_requested': () => ({ text: `${who} asked to change their country`, tone: 'amber', link: '/admin/kyc' }),
    'submission.created': () => ({ text: `${who} submitted proof for ${what || 'a task'}`, tone: 'amber', link: '/admin/verification' }),
    'withdrawal.requested': () => ({ text: `${who} requested a withdrawal ${money(after.amount_cents as number)}`.trim(), tone: 'amber', link: '/admin/withdrawals' }),
    'deposit.requested': () => ({ text: `${who} submitted a deposit for approval`, tone: 'amber', link: '/admin/deposits' }),
    'campaign.created': () => ({ text: `${who} created campaign ${what}`, tone: 'violet' }),
    'campaign.updated': () => ({ text: `${who} edited campaign ${what}`, tone: 'violet' }),
    'campaign.content_approved': () => ({ text: `${who} approved the post content of ${what}`, tone: 'green' }),
    'campaign.content_rejected': () => ({ text: `${who} rejected the post content of ${what}`, tone: 'red' }),
    'task.created': () => ({ text: `${who} created task ${what}`, tone: 'violet', link: '/admin/tasks' }),
    'support_ticket.created': () => ({ text: `${who} opened support ticket ${log.entity_name ?? ''}`.trim(), tone: 'amber', link: '/admin/support' }),
    'social_channel.submitted': () => ({ text: `${who} linked a social account for verification`, tone: 'amber', link: '/admin/social-channels' }),
    'user.status_changed': () => ({ text: `${who} changed the account status of ${log.entity_name ?? 'a user'}`, tone: 'gray' }),
    'user.permissions_updated': () => ({ text: `${who} changed the permissions of ${log.entity_name ?? 'a user'}`, tone: 'gray' }),
    'role.permissions_updated': () => ({ text: `${who} changed role permissions for ${log.entity_name ?? 'a role'}`, tone: 'gray' }),
  };

  const hit = map[log.action]?.();
  if (hit) return { link, ...hit };

  const tone: NotificationTone = /rejected|failed|removed|deleted|suspended/.test(log.action)
    ? 'red'
    : /approved|verified|completed/.test(log.action)
      ? 'green'
      : 'gray';
  return { text: `${who} · ${humanizeAction(log.action)}${what ? ` · ${what}` : ''}`, tone, link };
}

/** "5 min ago", "2 h ago", "3 d ago". */
export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString();
}
