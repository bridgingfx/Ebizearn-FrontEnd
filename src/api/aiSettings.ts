import { api, type ApiResponse } from './client';

export type AiProvider = 'gemini' | 'openai';

/** Super Admin view of the AI content generator — the key itself is never returned. */
export interface AiSettingsAdmin {
  provider: AiProvider;
  model: string;
  default_models: Record<AiProvider, string>;
  enabled: boolean;
  has_key: boolean;
  /** e.g. "••••yE-w" */
  key_hint: string | null;
  key_source: 'settings' | 'env' | 'none';
}

export interface AiSettingsInput {
  provider: AiProvider;
  model: string;
  enabled: boolean;
  /** Blank keeps the saved key. */
  api_key?: string;
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

export const aiSettingsApi = {
  get: () => unwrap(api.get<ApiResponse<AiSettingsAdmin>>('/admin/ai-settings')),
  update: (input: AiSettingsInput) => unwrap(api.put<ApiResponse<AiSettingsAdmin>>('/admin/ai-settings', input)),
  test: () => unwrap(api.post<ApiResponse<{ reply: string; ms: number }>>('/admin/ai-settings/test')),
  removeKey: () => unwrap(api.delete<ApiResponse<AiSettingsAdmin>>('/admin/ai-settings/key')),
  /** Runs exactly what "Generate with AI" runs; `detail` explains a failure. */
  tryGenerate: (brief: string, platform?: string) =>
    unwrap(
      api.post<ApiResponse<{ content: string | null; detail: string | null; provider: string; model: string; ms: number }>>('/admin/ai-settings/try', {
        brief,
        platform,
      }),
    ),
};
