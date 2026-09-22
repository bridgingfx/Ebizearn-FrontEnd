import { api, type ApiResponse } from './client';
import type { User } from '../types';

export const profileApi = {
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api
      .post<ApiResponse<{ user: User }>>('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },

  removeAvatar: () => api.delete<ApiResponse<{ user: User }>>('/profile/avatar').then((r) => r.data),
};
