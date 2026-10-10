import { api, type ApiResponse } from './client';

/**
 * "Connect with …" OAuth for contributor social channels.
 * Backend config keys: tiktok, x, facebook, google (google = YouTube),
 * instagram (Instagram API with Instagram Login — professional accounts;
 * personal accounts keep the manual bio-code flow).
 */
export type SocialConnectConfigKey = 'tiktok' | 'x' | 'facebook' | 'google' | 'instagram';

export interface SocialConnectPublicConfig {
  tiktok: { enabled: boolean; label: string };
  x: { enabled: boolean; label: string };
  facebook: { enabled: boolean; label: string };
  google: { enabled: boolean; label: string };
  instagram: { enabled: boolean; label: string };
}

export interface SocialConnectAdminConfig {
  tiktok: { enabled: boolean; client_id: string; has_secret: boolean; label: string };
  x: { enabled: boolean; client_id: string; has_secret: boolean; label: string };
  facebook: { enabled: boolean; client_id: string; has_secret: boolean; label: string };
  google: { enabled: boolean; client_id: string; has_secret: boolean; label: string };
  instagram: { enabled: boolean; client_id: string; has_secret: boolean; label: string };
}

export interface SocialConnectInput {
  tiktok: { enabled: boolean; client_id: string; client_secret?: string };
  x: { enabled: boolean; client_id: string; client_secret?: string };
  facebook: { enabled: boolean; client_id: string; client_secret?: string };
  google: { enabled: boolean; client_id: string; client_secret?: string };
  instagram: { enabled: boolean; client_id: string; client_secret?: string };
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

export const socialConnectApi = {
  /** Public: which "Connect with …" buttons the profile page may show. */
  publicConfig: () => unwrap(api.get<ApiResponse<SocialConnectPublicConfig>>('/config/social-connect')),
  /** Contributor: start OAuth — open data.url in a popup, backend calls back to /app/profile?tab=socials. */
  redirectUrl: (platform: SocialConnectConfigKey) =>
    unwrap(api.get<ApiResponse<{ url: string }>>(`/contributor/social-connect/${platform}/redirect`)),
  /** Super Admin: saved app credentials per provider. */
  adminConfig: () => unwrap(api.get<ApiResponse<SocialConnectAdminConfig>>('/admin/social-connect')),
  /** Super Admin: save. Omit client_secret to keep the saved one. */
  update: (input: SocialConnectInput) => unwrap(api.put<ApiResponse<SocialConnectAdminConfig>>('/admin/social-connect', input)),
};
