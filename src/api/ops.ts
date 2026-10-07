import { api, type ApiResponse } from './client';
import type { PermissionDef, RolePermissions, UserPermissionOverrides, Wallet } from '../types';

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

/** Super Admin wallet operations — directory, inspection, manual credits/debits. */
export const opsWalletsApi = {
  credit: (walletId: number, payload: { amount: number; description?: string }) =>
    api
      .post<ApiResponse<{ wallet: Wallet }>>(`/ops/wallets/${walletId}/credit`, payload)
      .then((r) => r.data),
  debit: (walletId: number, payload: { amount: number; description?: string }) =>
    api
      .post<ApiResponse<{ wallet: Wallet }>>(`/ops/wallets/${walletId}/debit`, payload)
      .then((r) => r.data),
};

/** Departments — organizing staff by team. */
export interface Department {
  id: number;
  name: string;
  label: string | null;
  users_count?: number;
}

export const departmentsApi = {
  list: () => api.get<ApiResponse<Department[]>>('/ops/departments').then((r) => r.data),
  manage: () => api.get<ApiResponse<Department[]>>('/ops/departments/manage').then((r) => r.data),
  create: (payload: { name: string; label?: string }) =>
    api.post<ApiResponse<Department>>('/ops/departments', payload).then((r) => r.data),
  remove: (id: number) => api.delete<ApiResponse<null>>(`/ops/departments/${id}`).then((r) => r.data),
};
