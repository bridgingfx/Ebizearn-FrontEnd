import { useEffect, useState } from 'react';
import { api, type ApiResponse } from './client';
import { PLATFORM_OPTIONS } from '../components/common/PlatformBrandIcon';

export interface SocialPlatform {
  key: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
}

export interface ManagedSocialPlatform extends SocialPlatform {
  id: number;
  is_active: boolean;
  sort_order: number;
  builtin: boolean;
}

/** Public: active platforms Super Admin configured. Falls back to the built-in set. */
export const platformsApi = {
  list: () => api.get<ApiResponse<SocialPlatform[]>>('/platforms').then((r) => r.data),
  /** Super Admin: every platform including inactive ones. */
  manageList: () =>
    api.get<ApiResponse<ManagedSocialPlatform[]>>('/ops/platforms').then((r) => r.data),
  create: (form: FormData) =>
    api
      .post<ApiResponse<ManagedSocialPlatform>>('/ops/platforms', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
  update: (id: number, form: FormData) => {
    form.append('_method', 'PATCH');
    return api
      .post<ApiResponse<ManagedSocialPlatform>>(`/ops/platforms/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  remove: (id: number) =>
    api.delete<ApiResponse<null>>(`/ops/platforms/${id}`).then((r) => r.data),
};

/**
 * Platforms for pickers: API first, built-in fallback when the API is
 * unreachable or empty (e.g. backend not yet deployed).
 */
export function usePlatforms() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await platformsApi.list();
        if (!cancelled && res.success && res.data && res.data.length > 0) {
          setPlatforms(res.data);
        }
      } catch {
        // Fallback below.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const effective: SocialPlatform[] =
    platforms.length > 0
      ? platforms
      : PLATFORM_OPTIONS.map((p) => ({ key: p.value, name: p.label, logo_url: null, brand_color: null }));

  return { platforms: effective, loaded };
}
