import type { PermissionDef, PermissionGroup } from '../types';

export const PERMISSION_GROUP_LABELS: Record<PermissionGroup, string> = {
  staff: 'Staff / admin panel',
  contributor: 'Contributor',
  business: 'Business',
  account: 'All accounts',
  other: 'Other',
};

/** Which permission groups matter for a role (shown first / by default). */
export const RELEVANT_GROUPS: Record<string, PermissionGroup[]> = {
  admin: ['staff'],
  moderator: ['staff'],
  contributor: ['contributor', 'account'],
  business: ['business', 'account'],
};

/**
 * Admin sidebar sections and the permissions behind each one, in sidebar
 * order. The FIRST permission opens the page (sidebar visibility); the rest
 * are actions inside it. Single source of truth for the admin sidebar and
 * the Roles & Permissions matrix.
 */
export const ADMIN_SECTIONS: { label: string; path: string; perms: string[] }[] = [
  { label: 'Users & KYC', path: '/admin/users', perms: ['manage_users', 'create_business_users'] },
  { label: 'KYC Review', path: '/admin/kyc', perms: ['review_kyc'] },
  { label: 'Social Channels', path: '/admin/social-channels', perms: ['review_social_channels'] },
  { label: 'Businesses', path: '/admin/businesses', perms: ['manage_businesses'] },
  { label: 'Verification', path: '/admin/verification', perms: ['review_submissions'] },
  { label: 'Campaigns', path: '/admin/campaigns', perms: ['manage_campaigns', 'post_campaigns', 'edit_campaigns', 'delete_campaigns'] },
  { label: 'Tasks', path: '/admin/tasks', perms: ['manage_task_templates', 'create_tasks', 'edit_tasks', 'delete_tasks'] },
  { label: 'Task Library', path: '/admin/task-library', perms: ['view_task_library', 'manage_task_library'] },
  { label: 'Withdrawals', path: '/admin/withdrawals', perms: ['process_payouts'] },
  { label: 'Deposits', path: '/admin/deposits', perms: ['process_deposits'] },
  { label: 'Wallets', path: '/admin/wallets', perms: ['view_wallets', 'adjust_wallets'] },
  { label: 'Referrals', path: '/admin/referrals', perms: ['view_referrals', 'manage_referral_rules'] },
  { label: 'Demo Requests', path: '/admin/demo-requests', perms: ['view_demo_requests'] },
  { label: 'Reports', path: '/admin/reports', perms: ['view_reports'] },
  { label: 'Fraud & Risk', path: '/admin/fraud', perms: ['view_fraud'] },
  { label: 'Support', path: '/admin/support', perms: ['handle_disputes'] },
  { label: 'Analytics', path: '/admin/analytics', perms: ['view_analytics'] },
  { label: 'Website Traffic', path: '/admin/traffic', perms: ['view_traffic'] },
  { label: 'System Health', path: '/admin/health', perms: ['view_system_health'] },
  { label: 'Roles & Permissions', path: '/admin/permissions', perms: ['manage_roles'] },
  { label: 'Settings', path: '/admin/settings', perms: ['manage_settings'] },
  { label: 'Audit Logs', path: '/admin/audit', perms: ['view_audit_logs'] },
];

/** Sidebar sections that stay Super Admin only (not grantable). */
export const SUPER_ADMIN_ONLY_SECTIONS = ['Contributor Ranks', 'Email & Campaigns', 'Platforms', 'Payment Gateways'];

/** Permission that opens a sidebar page, by path. */
export const sectionPermission = (path: string): string | undefined =>
  ADMIN_SECTIONS.find((s) => s.path === path)?.perms[0];

/**
 * Lay out a permission catalog for a role: staff roles get one block per
 * admin sidebar section; other roles (and the rest, when showAll) by group.
 */
export function groupPermissionsForRole(
  catalog: PermissionDef[],
  role: string,
  showAll: boolean,
): { key: string; title: string; perms: PermissionDef[] }[] {
  const relevant = RELEVANT_GROUPS[role] ?? [];
  const byName = new Map(catalog.map((p) => [p.name, p]));
  const blocks: { key: string; title: string; perms: PermissionDef[] }[] = [];
  const placed = new Set<string>();

  const staffFirst = relevant.includes('staff');
  const addSections = () => {
    ADMIN_SECTIONS.forEach((s) => {
      const perms = s.perms.map((n) => byName.get(n)).filter((p): p is PermissionDef => !!p);
      perms.forEach((p) => placed.add(p.name));
      if (perms.length) blocks.push({ key: `section:${s.path}`, title: `Sidebar · ${s.label}`, perms });
    });
    const leftover = catalog.filter((p) => p.group === 'staff' && !placed.has(p.name));
    leftover.forEach((p) => placed.add(p.name));
    if (leftover.length) blocks.push({ key: 'staff:other', title: 'Other staff permissions', perms: leftover });
  };

  if (staffFirst) addSections();

  const groups: PermissionGroup[] = ['contributor', 'business', 'account', 'other', 'staff'];
  groups
    .sort((a, b) => (relevant.includes(a) ? 0 : 1) - (relevant.includes(b) ? 0 : 1))
    .forEach((g) => {
      if (!showAll && !relevant.includes(g)) return;
      if (g === 'staff') {
        if (!staffFirst) addSections();
        return;
      }
      const perms = catalog.filter((p) => p.group === g && !placed.has(p.name));
      if (perms.length) blocks.push({ key: `group:${g}`, title: PERMISSION_GROUP_LABELS[g], perms });
    });

  return blocks;
}
