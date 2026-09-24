import type { PermissionGroup } from '../types';

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
