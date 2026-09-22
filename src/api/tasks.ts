import { api } from './client';
import type { Task, TaskSubmission } from '../types';

export const tasksApi = {
  list: (params?: Record<string, unknown>) => api.get('/tasks', { params }).then((r) => r.data as { success: boolean; data: Task[]; meta?: unknown }),
  get: (id: number | string) => api.get(`/tasks/${id}`).then((r) => r.data as { success: boolean; data: Task }),
  start: (id: number | string) => api.post(`/tasks/${id}/start`).then((r) => r.data),
  submit: (id: number | string, payload: { proof_url: string; proof_screenshot?: string | null; note?: string }) =>
    api.post(`/tasks/${id}/submit`, payload).then((r) => r.data),
  contributorDashboard: () => api.get('/contributor/dashboard').then((r) => r.data),
  myTasks: (params?: { status?: string }) =>
    api.get('/contributor/my-tasks', { params }).then((r) => r.data as { success: boolean; data: TaskSubmission[]; meta?: unknown }),
};
