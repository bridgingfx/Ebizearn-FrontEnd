import { api, type ApiResponse } from './client';
import type { PermissionDef, RolePermissions, UserPermissionOverrides } from '../types';

/** Super Admin permission management (/ops, superadmin only). */
export const opsApi = {
  roles: () =>
    api
      .get<ApiResponse<{ roles: RolePermissions[]; permissions: PermissionDef[] }>>('/ops/roles')
      .then((r) => r.data),
  updateRole: (name: RolePermissions['name'], permissions: string[]) =>
    api
      .put<ApiResponse<{ name: string; label: string; permissions: string[] }>>(`/ops/roles/${name}/permissions`, { permissions })
      .then((r) => r.data),
  userPermissions: (userId: number) =>
    api.get<ApiResponse<UserPermissionOverrides>>(`/ops/users/${userId}/permissions`).then((r) => r.data),
  updateUserPermissions: (userId: number, grants: string[], denies: string[]) =>
    api
      .put<ApiResponse<UserPermissionOverrides>>(`/ops/users/${userId}/permissions`, { grants, denies })
      .then((r) => r.data),
};
