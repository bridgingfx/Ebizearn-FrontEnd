import { api } from './client';
import type { TaskTemplate, TaskTemplateInput } from '../types';

type ListResponse = { success: boolean; message?: string; data: TaskTemplate[]; meta?: { can_manage?: boolean } };
type OneResponse = { success: boolean; message?: string; data: TaskTemplate };

/**
 * Task Library templates. Visibility is decided server-side: businesses get
 * templates marked visible_to_business, staff get visible_to_admin, and
 * holders of manage_task_library (Super Admin) get all of them.
 */
export const taskTemplatesApi = {
  businessList: () => api.get('/business/task-templates').then((r) => r.data as ListResponse),
  staffList: () => api.get('/staff/task-templates').then((r) => r.data as ListResponse),
  create: (payload: TaskTemplateInput) => api.post('/staff/task-templates', payload).then((r) => r.data as OneResponse),
  update: (id: number, payload: TaskTemplateInput) =>
    api.patch(`/staff/task-templates/${id}`, payload).then((r) => r.data as OneResponse),
  remove: (id: number) => api.delete(`/staff/task-templates/${id}`).then((r) => r.data as { success: boolean; message?: string }),
};
