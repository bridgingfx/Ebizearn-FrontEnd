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
  /** GET /contributor/referrals — referral code/link, per-level stats, earnings. Backend shape (source of truth):
   *  data: { referral_code, referral_link, levels, total_referred, by_level: { [level]: { total, rewarded, reward_cents, ... } }, total_earned_cents, referrals: [...] } */
  referrals: () =>
    api.get('/contributor/referrals').then((r) => r.data as {
      success: boolean;
      data: {
        referral_code: string;
        referral_link: string;
        levels: number;
        total_referred: number;
        by_level: Record<number, { total: number; rewarded: number; reward_cents: number; reward_mode?: string; reward_description?: string }>;
        total_earned_cents: number;
        referrals: Array<{
          id: number;
          level: number;
          status: string;
          reward_cents: number;
          qualified_at?: string | null;
          referred_user?: { id: number; name: string; joined_at: string } | null;
        }>;
      };
    }),
};
