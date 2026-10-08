import { api, type ApiResponse } from './client';

export interface OpsTaskType {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  reward_band_min_cents: number;
  reward_band_max_cents: number;
  is_active: boolean;
}

export interface OpsTaskCategory {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface WizardPreset {
  id: number;
  key: string;
  label: string;
  task_type_key: string | null;
  category_id: number | null;
  category?: { id: number; name: string } | null;
  platform: string | null;
  sort_order?: number;
  is_active?: boolean;
}

type RemoveResult = ApiResponse<{ deleted: boolean; deactivated: boolean }>;

/** Super Admin: options of the managed dropdowns (Task Library → Dropdown lists). */
export const dropdownListsApi = {
  taskTypes: () => api.get<ApiResponse<OpsTaskType[]>>('/ops/task-types').then((r) => r.data),
  createTaskType: (p: { name: string; description?: string; reward_band_min_cents: number; reward_band_max_cents: number }) =>
    api.post<ApiResponse<OpsTaskType>>('/ops/task-types', p).then((r) => r.data),
  updateTaskType: (key: string, p: Partial<Pick<OpsTaskType, 'name' | 'description' | 'reward_band_min_cents' | 'reward_band_max_cents' | 'is_active'>>) =>
    api.patch<ApiResponse<OpsTaskType>>(`/ops/task-types/${key}`, p).then((r) => r.data),
  deleteTaskType: (key: string) => api.delete<RemoveResult>(`/ops/task-types/${key}`).then((r) => r.data),

  categories: () => api.get<ApiResponse<OpsTaskCategory[]>>('/ops/task-categories').then((r) => r.data),
  createCategory: (p: { slug: string; name: string; description?: string }) =>
    api.post<ApiResponse<OpsTaskCategory>>('/ops/task-categories', p).then((r) => r.data),
  updateCategory: (id: number, p: Partial<Pick<OpsTaskCategory, 'name' | 'description' | 'is_active'>>) =>
    api.patch<ApiResponse<OpsTaskCategory>>(`/ops/task-categories/${id}`, p).then((r) => r.data),
  deleteCategory: (id: number) => api.delete<RemoveResult>(`/ops/task-categories/${id}`).then((r) => r.data),

  presets: () => api.get<ApiResponse<WizardPreset[]>>('/ops/wizard-presets').then((r) => r.data),
  createPreset: (p: Omit<WizardPreset, 'id' | 'key' | 'category'> & { key?: string }) =>
    api.post<ApiResponse<WizardPreset>>('/ops/wizard-presets', p).then((r) => r.data),
  updatePreset: (id: number, p: Omit<WizardPreset, 'id' | 'key' | 'category'>) =>
    api.patch<ApiResponse<WizardPreset>>(`/ops/wizard-presets/${id}`, p).then((r) => r.data),
  deletePreset: (id: number) => api.delete<RemoveResult>(`/ops/wizard-presets/${id}`).then((r) => r.data),

  /** Public: active presets (wizard + template form). */
  publicPresets: () => api.get<ApiResponse<WizardPreset[]>>('/wizard-presets').then((r) => r.data),
};
