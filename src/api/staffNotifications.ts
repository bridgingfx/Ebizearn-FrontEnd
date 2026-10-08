import { api, type ApiResponse } from './client';
import type { AuditLog } from '../types';

export type NotificationCategory = '' | 'users' | 'kyc' | 'tasks' | 'campaigns' | 'money' | 'support' | 'staff';

/** Admin / Super Admin notification bell — platform activity feed. */
export const staffNotificationsApi = {
  list: (params?: { category?: NotificationCategory; page?: number }) =>
    api
      .get<ApiResponse<AuditLog[]> & { meta: { current_page: number; last_page: number; total: number; unread: number; seen_at: string | null } }>(
        '/admin/notifications',
        { params: { ...params, category: params?.category || undefined } },
      )
      .then((r) => r.data),
  unread: () => api.get<ApiResponse<{ unread: number }>>('/admin/notifications/unread-count').then((r) => r.data),
  markSeen: () => api.post<ApiResponse<{ unread: number }>>('/admin/notifications/seen').then((r) => r.data),
};
