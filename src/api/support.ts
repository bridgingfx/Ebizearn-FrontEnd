import { api, type ApiResponse } from './client';
import type { KycDocumentSide, KycSubmission, SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../types';

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  attachments?: File[];
}

export interface StaffTicketCounts {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

/** Build a multipart body; `attachments[]` carries the files. */
function toForm(fields: Record<string, string | boolean | undefined>, files?: File[]): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v === undefined) return;
    form.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v);
  });
  (files ?? []).forEach((f) => form.append('attachments[]', f));
  return form;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

/** Contributor / business side: own tickets only. */
export const supportApi = {
  list: () => api.get<ApiResponse<SupportTicket[]>>('/support/tickets').then((r) => r.data),
  create: ({ attachments, ...fields }: CreateTicketPayload) =>
    api.post<ApiResponse<SupportTicket>>('/support/tickets', toForm({ ...fields }, attachments), multipart).then((r) => r.data),
  show: (uuid: string) => api.get<ApiResponse<SupportTicket>>(`/support/tickets/${uuid}`).then((r) => r.data),
  reply: (uuid: string, message: string, attachments?: File[]) =>
    api
      .post<ApiResponse<SupportTicket>>(`/support/tickets/${uuid}/messages`, toForm({ message: message || undefined }, attachments), multipart)
      .then((r) => r.data),
  /** Attachments are private — fetched with the auth header as a Blob. */
  attachment: (uuid: string, messageId: number, index: number) =>
    api.get<Blob>(`/support/tickets/${uuid}/messages/${messageId}/attachments/${index}`, { responseType: 'blob' }).then((r) => r.data),
};

/** Staff side (moderator / admin / superadmin with handle_disputes). */
export const staffSupportApi = {
  list: (params?: { status?: TicketStatus | 'active' | 'all'; search?: string; page?: number }) =>
    api
      .get<ApiResponse<SupportTicket[]> & { meta: { total: number; last_page: number; counts: StaffTicketCounts } }>(
        '/staff/support/tickets',
        { params }
      )
      .then((r) => r.data),
  show: (uuid: string) => api.get<ApiResponse<SupportTicket>>(`/staff/support/tickets/${uuid}`).then((r) => r.data),
  reply: (uuid: string, message: string, internal = false, attachments?: File[]) =>
    api
      .post<ApiResponse<SupportTicket>>(
        `/staff/support/tickets/${uuid}/messages`,
        toForm({ message: message || undefined, internal }, attachments),
        multipart
      )
      .then((r) => r.data),
  update: (uuid: string, payload: { status?: TicketStatus; priority?: TicketPriority }) =>
    api.patch<ApiResponse<SupportTicket>>(`/staff/support/tickets/${uuid}`, payload).then((r) => r.data),
  attachment: (uuid: string, messageId: number, index: number) =>
    api
      .get<Blob>(`/staff/support/tickets/${uuid}/messages/${messageId}/attachments/${index}`, { responseType: 'blob' })
      .then((r) => r.data),
};

/** Staff KYC review queue (review_kyc). */
export const staffKycApi = {
  list: (params?: { status?: 'pending' | 'verified' | 'rejected' | 'all'; search?: string; page?: number }) =>
    api
      .get<ApiResponse<KycSubmission[]> & { meta: { total: number; last_page: number; pending: number } }>('/staff/kyc', {
        params,
      })
      .then((r) => r.data),
  /** Documents are private — fetched with the auth header, returned as a Blob. */
  document: (userId: number, side: KycDocumentSide) =>
    api.get<Blob>(`/staff/kyc/${userId}/documents/${side}`, { responseType: 'blob' }).then((r) => r.data),
  decide: (userId: number, decision: 'approve' | 'reject', reason?: string) =>
    api.post<ApiResponse<KycSubmission>>(`/staff/kyc/${userId}/decision`, { decision, reason }).then((r) => r.data),
};
