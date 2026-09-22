import { api, type ApiResponse } from './client';
import type { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'business';
  country_code?: string;
  referral_code?: string;
  company_name?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

/** Dedicated portal a login page signs into. Sent to /auth/login so the API
 *  can reject cross-portal attempts (403) with its own message. */
export type LoginPortal = 'contributor' | 'business' | 'moderator' | 'superadmin';

export const authApi = {
  login: (email: string, password: string, portal?: LoginPortal) =>
    api.post<ApiResponse<AuthSession>>('/auth/login', { email, password, ...(portal ? { portal } : {}) }).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthSession>>('/auth/register', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<ApiResponse<{ user: User }>>('/auth/me').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ reset_url?: string }>>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (payload: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post<ApiResponse<null>>('/auth/reset-password', payload).then((r) => r.data),
};
