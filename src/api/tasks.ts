import { api } from './client';
import type { Task, TaskSubmission } from '../types';

export const tasksApi = {
  list: (params?: Record<string, unknown>) => api.get('/tasks', { params }).then((r) => r.data as { success: boolean; message?: string; data: Task[]; meta?: unknown }),
  get: (id: number | string) => api.get(`/tasks/${id}`).then((r) => r.data as { success: boolean; data: Task }),
  start: (id: number | string) => api.post(`/tasks/${id}/start`).then((r) => r.data),
  submit: (id: number | string, payload: { proof_url?: string; proof_screenshot?: string | null; text_answer?: string; note?: string }) =>
    api.post(`/tasks/${id}/submit`, payload).then((r) => r.data),
  contributorDashboard: () => api.get('/contributor/dashboard').then((r) => r.data),
  myTasks: (params?: { status?: string }) =>
    api.get('/contributor/my-tasks', { params }).then((r) => r.data as { success: boolean; data: TaskSubmission[]; meta?: unknown }),
  /** GET /contributor/referrals — referral code/link, 3-level stats, earnings. */
  referrals: () =>
    api.get('/contributor/referrals').then((r) => r.data as {
      success: boolean;
      data: {
        referral_code: string;
        referral_link: string;
        total_referred: number;
        qualified_referrals: number;
        total_earned_cents: number;
        reward_per_referral_cents: number;
        referrals: Array<{
          id: number;
          status: string;
          reward_cents: number;
          created_at: string;
          /** Present once the backend ships multi-level affiliate data. */
          level?: number;
          referred_user?: { id: number; name: string; email: string };
        }>;
      };
    }),
};
