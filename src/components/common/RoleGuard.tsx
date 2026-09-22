import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-slate-500">Loading…</div>;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    const destination = user.role === 'business'
      ? '/business'
      : user.role === 'admin' || user.role === 'superadmin'
        ? '/admin'
        : '/app';
    return <Navigate to={destination} replace />;
  }

  return children;
}
