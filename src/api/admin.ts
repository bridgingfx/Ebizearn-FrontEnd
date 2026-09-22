import { api } from './client';
import type { AuditLog, FeatureFlag, FraudEvent, TaskSubmission, User, WithdrawalRequest } from '../types';

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  verificationQueue: (params?: { status?: string; search?: string }) =>
    api.get('/admin/verification-queue', { params }).then((r) => r.data as { success: boolean; message?: string; data: TaskSubmission[]; meta?: unknown }),
  submissionDetail: (submissionId: number | string) =>
    api.get(`/admin/submissions/${submissionId}`).then((r) => r.data as { success: boolean; data: TaskSubmission }),
  recordDecision: (submissionId: number | string, payload: { decision: string; notes?: string }) =>
    api.post(`/admin/submissions/${submissionId}/decision`, payload).then((r) => r.data),
  fraudAlerts: () => api.get('/admin/fraud-alerts').then((r) => r.data as { success: boolean; message?: string; data: FraudEvent[]; meta?: unknown }),
  payouts: (params?: { status?: string }) =>
    api.get('/admin/payouts', { params }).then((r) => r.data as { success: boolean; message?: string; data: WithdrawalRequest[]; meta?: unknown }),
  processPayout: (payoutId: number | string, payload: { action: 'approve' | 'reject'; reason?: string; provider_tx_id?: string }) =>
    api.post(`/admin/payouts/${payoutId}/process`, payload).then((r) => r.data as { success: boolean; message?: string; data: WithdrawalRequest }),
  featureFlags: () => api.get('/admin/feature-flags').then((r) => r.data as { success: boolean; data: FeatureFlag[] }),
  updateFeatureFlag: (key: string, is_enabled: boolean) =>
    api.patch(`/admin/feature-flags/${key}`, { is_enabled }).then((r) => r.data as { success: boolean; data: FeatureFlag }),
  systemSettings: () => api.get('/admin/system-settings').then((r) => r.data),
  updateSystemSetting: (key: string, value: unknown) =>
    api.patch('/admin/system-settings', { key, value }).then((r) => r.data),
  auditLogs: () => api.get('/admin/audit-logs').then((r) => r.data as { success: boolean; message?: string; data: AuditLog[]; meta?: unknown }),
  users: (params?: { role?: string; search?: string }) =>
    api.get('/admin/users', { params }).then((r) => r.data as { success: boolean; message?: string; data: User[]; meta?: unknown }),
  updateUserStatus: (userId: number | string, status: 'active' | 'suspended' | 'pending_verification') =>
    api.patch(`/admin/users/${userId}/status`, { status }).then((r) => r.data as { success: boolean; message?: string; data: User }),
  health: () => api.get('/admin/health').then((r) => r.data),
  paymentGateways: () => api.get('/admin/payments/gateways').then((r) => r.data),
  createPaymentGateway: (payload: unknown) => api.post('/admin/payments/gateways', payload).then((r) => r.data),
  updatePaymentGateway: (id: number | string, payload: unknown) => api.put(`/admin/payments/gateways/${id}`, payload).then((r) => r.data),
  deletePaymentGateway: (id: number | string) => api.delete(`/admin/payments/gateways/${id}`).then((r) => r.data),
  setPaymentGatewayActive: (id: number | string, is_active: boolean) =>
    api.post(`/admin/payments/gateways/${id}/active`, { is_active }).then((r) => r.data),
  testPaymentGateway: (id: number | string) => api.post(`/admin/payments/gateways/${id}/test`).then((r) => r.data),
  paymentLogs: () => api.get('/admin/payments/logs').then((r) => r.data),
  // Phase 11: staff campaign oversight (GET /staff/campaigns). Paginated by
  // the backend; returns { data: { data: Campaign[], ... } } (Laravel pager).
  staffCampaigns: (params?: { status?: string; search?: string; business_id?: number; per_page?: number; page?: number }) =>
    api.get('/staff/campaigns', { params }).then((r) => r.data),
  updateStaffCampaignStatus: (id: number | string, status: 'active' | 'paused' | 'cancelled') =>
    api.patch(`/staff/campaigns/${id}/status`, { status }).then((r) => r.data),
  // Phase 11: platform-wide referral overview (read-only aggregate).
  referralOverview: () =>
    api.get('/admin/referrals/overview').then((r) => r.data),
};
