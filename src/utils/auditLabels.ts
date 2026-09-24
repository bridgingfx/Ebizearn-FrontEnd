import type { AuditLog } from '../types';

/**
 * Human-readable audit entries: which admin page an action belongs to,
 * the short model name, and a link to the record when one exists.
 * Replaces raw class paths like "App\Models\User #6".
 */

export interface AuditPage {
  label: string;
  path?: string;
}

/** Action prefix → page. First match wins (most specific first). */
const ACTION_PAGES: [RegExp, AuditPage][] = [
  [/^kyc\./, { label: 'KYC Review', path: '/admin/kyc' }],
  [/^support_ticket\./, { label: 'Support', path: '/admin/support' }],
  [/^(role|user)\.permissions/, { label: 'Roles & Permissions', path: '/admin/permissions' }],
  [/^(submission|verification)\./, { label: 'Verification', path: '/admin/verification' }],
  [/^(payout|withdrawal)/, { label: 'Withdrawals', path: '/admin/withdrawals' }],
  [/^(wallet|ledger)/, { label: 'Wallets', path: '/admin/wallets' }],
  [/^campaign/, { label: 'Campaigns', path: '/admin/campaigns' }],
  [/^(task_type|task)\./, { label: 'Tasks', path: '/admin/tasks' }],
  [/^referral/, { label: 'Referrals', path: '/admin/referrals' }],
  [/^(email_provider|email_template|email)\./, { label: 'Email Settings', path: '/admin/email' }],
  [/^(payment_gateway|payment)/, { label: 'Payment Settings', path: '/admin/settings' }],
  [/^(feature_flag|settings|system_setting|platform_setting)/, { label: 'Settings', path: '/admin/settings' }],
  [/^(staff|superadmin)\./, { label: 'Staff Accounts', path: '/admin/users' }],
  [/^user\./, { label: 'Users', path: '/admin/users' }],
];

/** Model → page, used when the action prefix is not recognised. */
const MODEL_PAGES: Record<string, AuditPage> = {
  User: { label: 'Users', path: '/admin/users' },
  Profile: { label: 'Users', path: '/admin/users' },
  Campaign: { label: 'Campaigns', path: '/admin/campaigns' },
  Task: { label: 'Tasks', path: '/admin/tasks' },
  TaskType: { label: 'Tasks', path: '/admin/tasks' },
  TaskSubmission: { label: 'Verification', path: '/admin/verification' },
  WithdrawalRequest: { label: 'Withdrawals', path: '/admin/withdrawals' },
  Wallet: { label: 'Wallets', path: '/admin/wallets' },
  SupportTicket: { label: 'Support', path: '/admin/support' },
  Role: { label: 'Roles & Permissions', path: '/admin/permissions' },
  EmailProvider: { label: 'Email Settings', path: '/admin/email' },
  EmailTemplate: { label: 'Email Settings', path: '/admin/email' },
  PaymentGateway: { label: 'Payment Settings', path: '/admin/settings' },
  FeatureFlag: { label: 'Settings', path: '/admin/settings' },
};

/** "App\\Models\\TaskSubmission" → "TaskSubmission" (fallback when the API didn't send entity_model). */
export const auditModel = (log: AuditLog): string =>
  log.entity_model || (log.entity_type || '').split('\\').pop() || 'Record';

/** "TaskSubmission" → "Task Submission". */
export const humanizeModel = (model: string): string => model.replace(/([a-z])([A-Z])/g, '$1 $2');

export const auditPage = (log: AuditLog): AuditPage => {
  const hit = ACTION_PAGES.find(([re]) => re.test(log.action || ''));
  if (hit) return hit[1];
  return MODEL_PAGES[auditModel(log)] ?? { label: 'System' };
};

/** Deep link to the exact record, when there's a page for it. */
export const auditEntityLink = (log: AuditLog): string | undefined => {
  const model = auditModel(log);
  if (model === 'User' && log.entity_id) return `/admin/users/${log.entity_id}`;
  return auditPage(log).path;
};

/** "kyc.approved" → "KYC approved", "user.status_changed" → "User status changed". */
export const humanizeAction = (action: string): string => {
  const text = action.replace(/[._]/g, ' ').trim().replace(/\bkyc\b/gi, 'KYC');
  return text.charAt(0).toUpperCase() + text.slice(1);
};
