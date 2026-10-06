import type { User } from '../types';

/**
 * Whether the signed-in user holds a permission. Super Admin holds every
 * permission. The backend enforces the same rule — this only hides
 * controls the server would refuse anyway.
 */
export const can = (user: User | null | undefined, permission: string): boolean =>
  user?.role === 'superadmin' || (user?.permissions?.includes(permission) ?? false);
