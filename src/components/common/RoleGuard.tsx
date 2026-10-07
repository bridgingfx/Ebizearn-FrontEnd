import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ACTIVE_ROLE_KEY } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-slate-500 dark:text-gray-400">Loading…</div>;
  }

  if (!user || !token) {
    // Send unauthenticated visitors to the login portal that matches who they
    // are — never to a generic login hub. Prefer the last known role (it
    // survives session expiry) so a superadmin whose session expired lands
    // back on the superadmin login, not the moderator one. Fall back to the
    // URL area for first-time visitors with no stored role.
    const path = location.pathname;
    const lastRole = (typeof localStorage !== 'undefined'
      ? localStorage.getItem(ACTIVE_ROLE_KEY)
      : null) as UserRole | null;
    const destination =
      lastRole === 'superadmin'
        ? '/secure-control-panel/login'
        : lastRole === 'business'
          ? '/business/login'
          : lastRole === 'admin' || lastRole === 'moderator'
            ? '/moderator/login'
            : lastRole === 'contributor'
              ? '/login'
              : path.startsWith('/business')
                ? '/business/login'
                : path.startsWith('/admin')
                  ? '/moderator/login'
                  : '/login';
    return <Navigate to={destination} replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    const destination = user.role === 'business'
      ? '/business'
      : user.role === 'admin' || user.role === 'superadmin' || user.role === 'moderator'
        ? '/admin'
        : '/app';
    return <Navigate to={destination} replace />;
  }

  // Verified-email route gate: an authenticated user whose /me reports an
  // unverified email cannot enter any portal page — they land on
  // /verify-email instead. /verify-email itself is not wrapped in RoleGuard,
  // so this cannot loop. Moderators/staff are exempt: their sessions come
  // from staff-issued credentials, not self-service signup.
  const isStaff = user.role === 'admin' || user.role === 'superadmin' || user.role === 'moderator';
  if (!isStaff && user.email_verified_at == null) {
    return <Navigate to="/verify-email" replace state={{ from: location.pathname }} />;
  }

  return children;
}
