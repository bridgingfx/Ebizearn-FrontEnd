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
  /** Created by Super Admin (can be deleted); built-in templates are tied to platform events. */
  is_custom?: boolean;
}

export type EmailTemplateInput = Pick<EmailTemplate, 'subject' | 'html_body' | 'text_body' | 'is_enabled'> & { name?: string };

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

/** What is sending email right now. */
export interface EmailStatus {
  source: 'admin' | 'env' | 'none';
  provider_id: number | null;
  name: string | null;
  driver: EmailDriver | null;
  from_email: string | null;
  from_name: string | null;
  env_brevo_key: boolean;
}

export type CampaignAudience = 'all' | 'contributors' | 'businesses';

export interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  heading: string | null;
  body: string;
  button_label: string | null;
  button_url: string | null;
  audience: CampaignAudience;
  /** A custom email template used as the design instead of the standard layout. */
  template_key: string | null;
  status: 'draft' | 'sending' | 'sent' | 'cancelled';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  last_error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export type EmailCampaignInput = Pick<EmailCampaign, 'name' | 'subject' | 'heading' | 'body' | 'button_label' | 'button_url' | 'audience' | 'template_key'>;

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
  createTemplate: (input: { name: string; subject: string }) => unwrap(api.post<ApiResponse<EmailTemplate>>('/admin/email/templates', input)),
  deleteTemplate: (key: string) => unwrap(api.delete<ApiResponse<null>>(`/admin/email/templates/${key}`)),
  /** Sends the template (or the unsaved draft) with sample values. */
  testTemplate: (key: string, input: { to: string; subject?: string; html_body?: string; text_body?: string }) =>
    unwrap(api.post<ApiResponse<null>>(`/admin/email/templates/${key}/test`, input)),
  /** Upload a logo / picture for templates; returns its public URL. */
  uploadAsset: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return unwrap(api.post<ApiResponse<{ url: string; path: string }>>('/admin/email/assets', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },

  logs: () => unwrap(api.get<ApiResponse<EmailLog[]>>('/admin/email/logs')),

  status: () => unwrap(api.get<ApiResponse<EmailStatus>>('/admin/email/status')),
  /** Save the chosen driver's settings and make it the active sender, in one step. */
  apply: (input: Omit<EmailProviderInput, 'name'> & { name?: string }) =>
    unwrap(api.post<ApiResponse<EmailProvider>>('/admin/email/apply', input)),

  campaigns: () => unwrap(api.get<ApiResponse<EmailCampaign[]>>('/admin/email/campaigns')),
  audienceCounts: () => unwrap(api.get<ApiResponse<Record<CampaignAudience, number>>>('/admin/email/campaigns/audiences')),
  createCampaign: (input: EmailCampaignInput) => unwrap(api.post<ApiResponse<EmailCampaign>>('/admin/email/campaigns', input)),
  updateCampaign: (id: number, input: EmailCampaignInput) =>
    unwrap(api.put<ApiResponse<EmailCampaign>>(`/admin/email/campaigns/${id}`, input)),
  deleteCampaign: (id: number) => unwrap(api.delete<ApiResponse<null>>(`/admin/email/campaigns/${id}`)),
  testCampaign: (id: number, to: string) => unwrap(api.post<ApiResponse<null>>(`/admin/email/campaigns/${id}/test`, { to })),
  /** Sends the next batch; call again until status is "sent". */
  sendCampaignBatch: (id: number) => unwrap(api.post<ApiResponse<EmailCampaign>>(`/admin/email/campaigns/${id}/send`)),
  cancelCampaign: (id: number) => unwrap(api.post<ApiResponse<EmailCampaign>>(`/admin/email/campaigns/${id}/cancel`)),
};
