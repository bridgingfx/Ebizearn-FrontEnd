import { api, type ApiResponse } from './client';
import type { KycDocumentType, User } from '../types';

export interface ProfileUpdatePayload {
  name?: string;
  /** E.164, e.g. "+995501234567" — spaces/dashes are accepted. */
  phone?: string;
  country_code?: string;
  city?: string | null;
  bio?: string | null;
  preferred_payout_method?: 'paypal' | 'wise' | 'bank' | 'usdt' | null;
  /** Optional note for staff when requesting a residence-country change. */
  country_change_reason?: string | null;
}

/** A residence-country change waiting for (or decided by) staff. */
export interface CountryChangeRequest {
  id: number;
  user_id: number;
  from_country: string | null;
  to_country: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string; role: string; profile?: { kyc_status: string; country_code: string } | null };
  reviewer?: { id: number; name: string } | null;
}

export interface KycSubmitPayload {
  document_type: KycDocumentType;
  document_front: File;
  document_back?: File | null;
  selfie?: File | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const profileApi = {
  /** Change password; other devices are signed out, this session stays. */
  updatePassword: (payload: ChangePasswordPayload) =>
    api.put<ApiResponse<null>>('/profile/password', payload).then((r) => r.data),

  /** A new country_code is not applied directly: it comes back as a pending request. */
  update: (payload: ProfileUpdatePayload) =>
    api
      .put<ApiResponse<{ user: User; country_change_request?: CountryChangeRequest | null }>>('/profile', payload)
      .then((r) => r.data),

  /** Latest residence-country change request (pending or decided), or null. */
  countryChange: () =>
    api.get<ApiResponse<CountryChangeRequest | null>>('/profile/country-change').then((r) => r.data),

  cancelCountryChange: () =>
    api.delete<ApiResponse<CountryChangeRequest>>('/profile/country-change').then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api
      .post<ApiResponse<{ user: User }>>('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },

  removeAvatar: () => api.delete<ApiResponse<{ user: User }>>('/profile/avatar').then((r) => r.data),

  submitKyc: (payload: KycSubmitPayload) => {
    const form = new FormData();
    form.append('document_type', payload.document_type);
    form.append('document_front', payload.document_front);
    if (payload.document_back) form.append('document_back', payload.document_back);
    if (payload.selfie) form.append('selfie', payload.selfie);
    return api
      .post<ApiResponse<{ user: User }>>('/profile/kyc', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
