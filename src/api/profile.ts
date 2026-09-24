import { api, type ApiResponse } from './client';
import type { KycDocumentType, User } from '../types';

export interface ProfileUpdatePayload {
  name?: string;
  /** E.164, e.g. "+971501234567" — spaces/dashes are accepted. */
  phone?: string;
  country_code?: string;
  city?: string | null;
  bio?: string | null;
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

  update: (payload: ProfileUpdatePayload) =>
    api.put<ApiResponse<{ user: User }>>('/profile', payload).then((r) => r.data),

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
