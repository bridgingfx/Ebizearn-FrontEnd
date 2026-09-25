import { api, type ApiResponse } from './client';

/** What the login / register pages need to show the Google / Apple buttons. */
export interface AuthProvidersPublic {
  google: { enabled: boolean; client_id: string | null };
  apple: { enabled: boolean; client_id: string | null; redirect_uri: string | null };
}

/** Super Admin view: `source` says where the client ID comes from. */
export interface AuthProvidersAdmin {
  google: { enabled: boolean; client_id: string; source: 'settings' | 'env' | 'none' };
  apple: { enabled: boolean; client_id: string; redirect_uri: string; source: 'settings' | 'env' | 'none' };
}

export interface AuthProvidersInput {
  google: { enabled: boolean; client_id: string };
  apple: { enabled: boolean; client_id: string; redirect_uri: string };
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

export const authProvidersApi = {
  publicConfig: () => unwrap(api.get<ApiResponse<AuthProvidersPublic>>('/config/auth-providers')),
  adminConfig: () => unwrap(api.get<ApiResponse<AuthProvidersAdmin>>('/admin/auth-providers')),
  update: (input: AuthProvidersInput) => unwrap(api.put<ApiResponse<AuthProvidersAdmin>>('/admin/auth-providers', input)),
};
