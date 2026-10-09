import { api, type ApiResponse } from './client';

/** GET /businesses/{id}/profile — the business card on the task page (real counts). */
export interface BusinessProfile {
  id: number;
  uuid: string;
  name: string;
  handle: string;
  industry: string | null;
  website: string | null;
  verified: boolean;
  avatar_url: string | null;
  stats: { posts: number; followers: number; following: number };
  /** Campaign post images, newest first. */
  images: { campaign_uuid: string; title: string; url: string; created_at: string }[];
  /** Verified social channels of the business. */
  socials: { platform: string; handle: string; profile_url: string; followers: number | null }[];
  /** null for the business's own view. */
  viewer: { is_following: boolean; alerts_on: boolean; follows_you: boolean } | null;
}

/** One row of a followers / following list. */
export interface FollowPerson {
  id: number;
  uuid: string;
  name: string;
  /** Staff lists only. */
  email: string | null;
  role: string;
  country_code: string | null;
  avatar_url: string | null;
  followed_at: string;
  /** Followers list: the account follows them back. Following list: they follow the account. */
  mutual: boolean;
}

export interface PagedPeople {
  success: boolean;
  data: FollowPerson[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

/** In-app notification (new follower, follow back, new task from a business you follow). */
export interface AppNotification {
  id: string;
  kind: 'new_follower' | 'followed_back' | 'new_task' | string;
  title: string;
  body: string;
  link: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

/** Contributor side: view a business, follow it, toggle its bell. */
export const businessProfileApi = {
  get: (id: string | number) => unwrap(api.get<ApiResponse<BusinessProfile>>(`/businesses/${id}/profile`)),
  follow: (id: string | number) => unwrap(api.post<ApiResponse<BusinessProfile>>(`/businesses/${id}/follow`)),
  unfollow: (id: string | number) => unwrap(api.delete<ApiResponse<BusinessProfile>>(`/businesses/${id}/follow`)),
  setAlerts: (id: string | number, enabled: boolean) =>
    unwrap(api.post<ApiResponse<BusinessProfile>>(`/businesses/${id}/alerts`, { enabled })),
};

/** Business side: own profile, followers / following, follow back. */
export const businessFollowApi = {
  profile: () => unwrap(api.get<ApiResponse<BusinessProfile>>('/business/profile')),
  people: (type: 'followers' | 'following', params: { page?: number; search?: string } = {}) =>
    api.get<PagedPeople>(`/business/${type}`, { params }).then((r) => r.data),
  followBack: (userId: number) =>
    unwrap(api.post<ApiResponse<{ stats: BusinessProfile['stats'] }>>(`/business/following/${userId}`)),
  unfollow: (userId: number) =>
    unwrap(api.delete<ApiResponse<{ stats: BusinessProfile['stats'] }>>(`/business/following/${userId}`)),
};

/** Staff: followers / following of any account (user page popup). */
export const staffFollowApi = {
  people: (userId: number, type: 'followers' | 'following', params: { page?: number; search?: string } = {}) =>
    api.get<PagedPeople>(`/admin/users/${userId}/follows`, { params: { type, ...params } }).then((r) => r.data),
};

/** Contributors and businesses: in-app notifications. */
export const notificationsApi = {
  list: (params: { page?: number; per_page?: number } = {}) =>
    api
      .get<{ success: boolean; data: AppNotification[]; meta: { current_page: number; last_page: number; total: number; unread: number } }>('/notifications', { params })
      .then((r) => r.data),
  unread: () => unwrap(api.get<ApiResponse<{ unread: number }>>('/notifications/unread-count')),
  markRead: (ids?: string[]) => unwrap(api.post<ApiResponse<{ unread: number }>>('/notifications/read', ids ? { ids } : {})),
};
