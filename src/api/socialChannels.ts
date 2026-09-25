import { api, type ApiResponse } from './client';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x';
export type SocialChannelStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface SocialChannel {
  id: number;
  user_id: number;
  platform: SocialPlatform;
  handle: string;
  profile_url: string;
  followers: number | null;
  verification_code: string;
  status: SocialChannelStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  created_at: string;
  user?: { id: number; uuid: string; name: string; email: string; role: string; status: string };
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

/** Contributor: profile → Connected Social Accounts. */
export const socialChannelsApi = {
  list: () => unwrap(api.get<ApiResponse<SocialChannel[]>>('/contributor/social-channels')),
  /** Add or replace the channel for a platform; returns it with a bio code. */
  save: (input: { platform: SocialPlatform; profile_url: string; followers?: number | null }) =>
    unwrap(api.post<ApiResponse<SocialChannel>>('/contributor/social-channels', input)),
  submit: (id: number) => unwrap(api.post<ApiResponse<SocialChannel>>(`/contributor/social-channels/${id}/submit`)),
  remove: (id: number) => unwrap(api.delete<ApiResponse<null>>(`/contributor/social-channels/${id}`)),
};

/** Staff (review_kyc): social channel review queue. */
export const staffSocialChannelsApi = {
  list: (params: { status?: SocialChannelStatus | 'all'; search?: string; user_id?: number; page?: number }) =>
    api
      .get<ApiResponse<SocialChannel[]> & { meta: { total: number; last_page: number; pending: number } }>('/staff/social-channels', { params })
      .then((r) => r.data),
  decide: (id: number, decision: 'approve' | 'reject', extra: { reason?: string; followers?: number | null } = {}) =>
    unwrap(api.post<ApiResponse<SocialChannel>>(`/staff/social-channels/${id}/decision`, { decision, ...extra })),
};
