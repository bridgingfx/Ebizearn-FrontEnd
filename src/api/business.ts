import { api } from './client';
import type { Campaign, TaskSubmission } from '../types';

export const businessApi = {
  dashboard: () => api.get('/business/dashboard').then((r) => r.data),
  campaigns: () => api.get('/business/campaigns').then((r) => r.data as { success: boolean; data: Campaign[]; meta?: unknown }),
  createCampaign: (payload: Record<string, unknown>) => api.post('/business/campaigns', payload).then((r) => r.data),
  campaign: (id: number | string) => api.get(`/business/campaigns/${id}`).then((r) => r.data),
  updateCampaignStatus: (id: number | string, status: 'active' | 'paused' | 'cancelled') =>
    api.patch(`/business/campaigns/${id}/status`, { status }).then((r) => r.data as { success: boolean; data: Campaign }),
  submissions: () => api.get('/business/submissions').then((r) => r.data as { success: boolean; data: TaskSubmission[]; meta?: unknown }),
};
