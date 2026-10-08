import { api, type ApiResponse } from './client';

export interface TeamPermission {
  name: string;
  label: string;
  /** The owner holds it, so it can be given to a member. */
  available: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  permissions: string[];
}

export interface BusinessTeam {
  permissions: TeamPermission[];
  max_members: number;
  members: TeamMember[];
}

/** Business owner: team members and the sections each one can use. */
export const businessTeamApi = {
  get: () => api.get<ApiResponse<BusinessTeam>>('/business/team').then((r) => r.data),
  add: (payload: { name: string; email: string; password: string; permissions: string[] }) =>
    api.post<ApiResponse<BusinessTeam>>('/business/team', payload).then((r) => r.data),
  updatePermissions: (id: number, permissions: string[]) =>
    api.put<ApiResponse<BusinessTeam>>(`/business/team/${id}/permissions`, { permissions }).then((r) => r.data),
  setStatus: (id: number, status: 'active' | 'suspended') =>
    api.patch<ApiResponse<BusinessTeam>>(`/business/team/${id}/status`, { status }).then((r) => r.data),
  remove: (id: number) => api.delete<ApiResponse<BusinessTeam>>(`/business/team/${id}`).then((r) => r.data),
};
