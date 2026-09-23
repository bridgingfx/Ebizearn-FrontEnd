import { api } from './client';
import type { Campaign, TaskSubmission } from '../types';

export const businessApi = {
  dashboard: () => api.get('/business/dashboard').then((r) => r.data as { success: boolean; message?: string; data: any }),
  campaigns: () => api.get('/business/campaigns').then((r) => r.data as { success: boolean; message?: string; data: Campaign[]; meta?: unknown }),
  createCampaign: (payload: Record<string, unknown>) => api.post('/business/campaigns', payload).then((r) => r.data),
  saveCampaignDraft: (payload: Record<string, unknown>) =>
    api.post('/business/campaigns/wizard/draft', payload).then((r) => r.data),
  updateCampaignDraft: (id: number | string, payload: Record<string, unknown>) =>
    api.patch(`/business/campaigns/wizard/draft/${id}`, payload).then((r) => r.data),
  launchDraft: (id: number | string, idempotencyKey?: string) =>
    api.post(`/business/campaigns/${id}/launch`, idempotencyKey ? { idempotency_key: idempotencyKey } : {}).then((r) => r.data),
  campaign: (id: number | string) => api.get(`/business/campaigns/${id}`).then((r) => r.data as { success: boolean; message?: string; data: Campaign }),
  updateCampaignStatus: (id: number | string, status: 'active' | 'paused' | 'cancelled') =>
    api.patch(`/business/campaigns/${id}/status`, { status }).then((r) => r.data as { success: boolean; message?: string; data: Campaign }),
  submissions: () => api.get('/business/submissions').then((r) => r.data as { success: boolean; message?: string; data: TaskSubmission[]; meta?: unknown }),
};
