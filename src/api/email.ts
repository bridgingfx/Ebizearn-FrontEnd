import { api, type ApiResponse } from './client';

export type EmailDriver = 'smtp' | 'brevo' | 'sendgrid' | 'mailgun' | 'ses' | 'log';

export interface EmailProvider {
  id: number;
  name: string;
  driver: EmailDriver;
  host: string | null;
  port: number | null;
  username: string | null;
  encryption: 'tls' | 'ssl' | 'none' | null;
  region: string | null;
  from_email: string;
  from_name: string;
  is_active: boolean;
  status: 'untested' | 'ok' | 'failed';
  last_tested_at: string | null;
  last_test_message: string | null;
  has_secret: boolean;
}

/** Fields the admin can edit. The secret is write-only; leave it blank to keep the stored value. */
export type EmailProviderInput = Pick<EmailProvider, 'name' | 'driver' | 'from_email' | 'from_name'> &
  Partial<Pick<EmailProvider, 'host' | 'port' | 'username' | 'encryption' | 'region'>> & { secret?: string };

export interface EmailTemplate {
  id: number;
  event_key: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
  is_enabled: boolean;
}

export type EmailTemplateInput = Pick<EmailTemplate, 'subject' | 'html_body' | 'text_body' | 'is_enabled'>;

export interface EmailLog {
  id: number;
  event_key: string;
  provider_name: string | null;
  to_email: string;
  subject: string | null;
  status: 'sent' | 'failed' | 'logged' | 'skipped';
  error: string | null;
  created_at: string;
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

export const emailApi = {
  providers: () => unwrap(api.get<ApiResponse<EmailProvider[]>>('/admin/email/providers')),
  createProvider: (input: EmailProviderInput) => unwrap(api.post<ApiResponse<EmailProvider>>('/admin/email/providers', input)),
  updateProvider: (id: number, input: EmailProviderInput) =>
    unwrap(api.put<ApiResponse<EmailProvider>>(`/admin/email/providers/${id}`, input)),
  deleteProvider: (id: number) => unwrap(api.delete<ApiResponse<null>>(`/admin/email/providers/${id}`)),
  setActive: (id: number, isActive: boolean) =>
    unwrap(api.post<ApiResponse<EmailProvider>>(`/admin/email/providers/${id}/active`, { is_active: isActive })),
  testProvider: (id: number, to: string) =>
    unwrap(api.post<ApiResponse<EmailProvider>>(`/admin/email/providers/${id}/test`, { to })),

  templates: () => unwrap(api.get<ApiResponse<EmailTemplate[]>>('/admin/email/templates')),
  updateTemplate: (key: string, input: EmailTemplateInput) =>
    unwrap(api.put<ApiResponse<EmailTemplate>>(`/admin/email/templates/${key}`, input)),
  resetTemplate: (key: string) => unwrap(api.post<ApiResponse<EmailTemplate>>(`/admin/email/templates/${key}/reset`)),

  logs: () => unwrap(api.get<ApiResponse<EmailLog[]>>('/admin/email/logs')),
};
