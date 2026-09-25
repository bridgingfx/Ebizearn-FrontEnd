import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Megaphone, Pencil, Plus, Send, Square, Trash2, Users } from 'lucide-react';
import { emailApi, getApiError } from '../../../api';
import type { CampaignAudience, EmailCampaign, EmailCampaignInput, EmailTemplate } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../utils/toast';

const AUDIENCE_LABELS: Record<CampaignAudience, string> = {
  all: 'All users (contributors + businesses)',
  contributors: 'Contributors',
  businesses: 'Businesses',
};

const STATUS_STYLES: Record<EmailCampaign['status'], string> = {
  draft: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300',
  sending: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
  sent: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

const emptyForm = (): EmailCampaignInput => ({
  name: '',
  subject: '',
  heading: '',
  body: 'Hi {{ user_name }},\n\n',
  button_label: '',
  button_url: '',
  audience: 'all',
  template_key: null,
});

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

const fill = (s: string, name: string) => s.replace(/\{\{\s*user_name\s*\}\}/g, name).replace(/\{\{\s*app_name\s*\}\}/g, 'eBizEarn');

/** Preview of a custom template chosen as the campaign design (sample values filled in). */
const TemplatePreview: React.FC<{ template: EmailTemplate; subject: string; name: string }> = ({ template, subject, name }) => {
  const origin = window.location.origin;
  const values: Record<string, string> = {
    user_name: name,
    app_name: 'eBizEarn',
    support_email: 'support@ebizearn.com',
    logo_url: `${origin}/assets/email-logo.png`,
    app_url: origin,
    help_url: `${origin}/faq`,
    terms_url: `${origin}/terms`,
    privacy_url: `${origin}/privacy`,
    login_url: `${origin}/login`,
    year: String(new Date().getFullYear()),
  };
  const html = template.html_body.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k: string) => values[k] ?? m);
  return (
    <div className="rounded-2xl bg-slate-100 dark:bg-black/30 p-4">
      <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-2 truncate">
        <b>Subject:</b> {fill(subject, name) || '—'}
      </p>
      <iframe title="Campaign preview" srcDoc={html} sandbox="" className="w-full bg-white rounded-xl" style={{ height: 620, border: 0 }} />
    </div>
  );
};

/** Email preview that mirrors the layout the server sends. */
const Preview: React.FC<{ form: EmailCampaignInput; name: string }> = ({ form, name }) => (
  <div className="rounded-2xl bg-slate-100 dark:bg-black/30 p-4">
    <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-2 truncate">
      <b>Subject:</b> {fill(form.subject, name) || '—'}
    </p>
    <div className="rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-[#07182F] px-5 py-3 text-white font-extrabold">eBizEarn</div>
      <div className="p-5">
        {form.heading && <h2 className="text-lg font-bold text-[#07182F] mb-3 leading-snug">{fill(form.heading, name)}</h2>}
        {(form.body || '')
          .trim()
          .split(/\n{2,}/)
          .map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-slate-700 mb-3 whitespace-pre-line">
              {fill(p, name)}
            </p>
          ))}
        {form.button_label && form.button_url && (
          <span className="inline-block mt-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#168BFF] to-[#7257FF]">
            {fill(form.button_label, name)}
          </span>
        )}
      </div>
      <div className="px-5 py-3 border-t border-slate-200 text-[10px] text-slate-400">
        You are receiving this because you have an eBizEarn account. <u>Unsubscribe from marketing emails</u>
      </div>
    </div>
  </div>
);

/** Super Admin → Email → Campaigns: marketing emails through the active provider. */
export const EmailCampaigns: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [counts, setCounts] = useState<Record<CampaignAudience, number> | null>(null);
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    emailApi
      .templates()
      .then((res) => setCustomTemplates(res.data.filter((t) => t.is_custom)))
      .catch(() => undefined);
  }, []);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailCampaign | 'new' | null>(null);
  const [form, setForm] = useState<EmailCampaignInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState(user?.email ?? '');
  const [busyId, setBusyId] = useState<number | null>(null);
  const stopRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([emailApi.campaigns(), emailApi.audienceCounts()]);
      setCampaigns(c.data);
      setCounts(a.data);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load campaigns.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      stopRef.current = true;
    };
  }, [load]);

  const open = (c: EmailCampaign | 'new') => {
    setEditing(c);
    setForm(
      c === 'new'
        ? emptyForm()
        : { name: c.name, subject: c.subject, heading: c.heading ?? '', body: c.body, button_label: c.button_label ?? '', button_url: c.button_url ?? '', audience: c.audience, template_key: c.template_key ?? null },
    );
  };

  const set = <K extends keyof EmailCampaignInput>(key: K, value: EmailCampaignInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const payload = (): EmailCampaignInput => ({
    ...form,
    heading: form.heading || null,
    button_label: form.button_label || null,
    button_url: form.button_url || null,
  });

  /** Save the form and return the stored campaign. */
  const persist = async (): Promise<EmailCampaign | null> => {
    setSaving(true);
    try {
      const res = editing && editing !== 'new' ? await emailApi.updateCampaign(editing.id, payload()) : await emailApi.createCampaign(payload());
      setEditing(res.data);
      return res.data;
    } catch (err) {
      toast.error(getApiError(err, 'Could not save the campaign.'));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await persist();
    if (saved) {
      toast.success('Draft saved.');
      load();
    }
  };

  const sendTest = async () => {
    const saved = await persist();
    if (!saved) return;
    setBusyId(saved.id);
    try {
      const res = await emailApi.testCampaign(saved.id, testTo);
      toast.success(res.message || `Test sent to ${testTo}.`);
    } catch (err) {
      toast.error(getApiError(err, 'Test failed.'));
    } finally {
      setBusyId(null);
      load();
    }
  };

  /** Sends batch after batch until the server reports the campaign as sent. */
  const runSend = async (campaign: EmailCampaign) => {
    stopRef.current = false;
    setBusyId(campaign.id);
    let current = campaign;
    try {
      do {
        const res = await emailApi.sendCampaignBatch(current.id);
        current = res.data;
        setCampaigns((list) => [current, ...list.filter((c) => c.id !== current.id)].sort((a, b) => b.id - a.id));
      } while (current.status === 'sending' && !stopRef.current);

      if (current.status === 'sent') {
        if (current.failed_count > 0) {
          toast.error(`Sent ${current.sent_count}, failed ${current.failed_count}. ${current.last_error ?? ''}`);
        } else {
          toast.success(`Campaign sent to ${current.sent_count} users.`);
        }
      }
    } catch (err) {
      toast.error(getApiError(err, 'Sending stopped. Press Continue to resume.'));
    } finally {
      setBusyId(null);
      load();
    }
  };

  const sendNow = async () => {
    const audienceCount = counts?.[form.audience] ?? 0;
    if (!window.confirm(`Send "${form.subject}" to ${audienceCount} ${form.audience === 'all' ? 'users' : form.audience}? This cannot be undone.`)) return;
    const saved = await persist();
    if (!saved) return;
    setEditing(null);
    runSend(saved);
  };

  const cancel = async (c: EmailCampaign) => {
    stopRef.current = true;
    try {
      await emailApi.cancelCampaign(c.id);
      toast.success('Campaign cancelled.');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      load();
    }
  };

  const remove = async (c: EmailCampaign) => {
    if (!window.confirm(`Delete campaign "${c.name}"?`)) return;
    try {
      await emailApi.deleteCampaign(c.id);
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin inline-block" />
      </div>
    );
  }

  if (editing) {
    const previewName = (user?.name ?? 'Sarah').split(' ')[0];
    const chosenTemplate = form.template_key ? customTemplates.find((t) => t.event_key === form.template_key) ?? null : null;
    const isDraft = editing === 'new' || editing.status === 'draft';
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-gray-100">
          <ArrowLeft className="w-4 h-4" /> All campaigns
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-5 items-start">
          <form onSubmit={saveDraft} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">{editing === 'new' ? 'New campaign' : editing.name}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Campaign name (internal)</span>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="October promo" disabled={!isDraft} />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Send to</span>
                <select value={form.audience} onChange={(e) => set('audience', e.target.value as CampaignAudience)} className={inputClass} disabled={!isDraft}>
                  {(Object.keys(AUDIENCE_LABELS) as CampaignAudience[]).map((a) => (
                    <option key={a} value={a}>
                      {AUDIENCE_LABELS[a]}
                      {counts ? ` — ${counts[a]}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Subject</span>
              <input required value={form.subject} onChange={(e) => set('subject', e.target.value)} className={inputClass} placeholder="New paid tasks are live, {{ user_name }}" disabled={!isDraft} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Email design</span>
              <select
                value={form.template_key ?? ''}
                onChange={(e) => set('template_key', e.target.value || null)}
                className={inputClass}
                disabled={!isDraft}
              >
                <option value="">Standard eBizEarn layout — write the message below</option>
                {customTemplates.map((t) => (
                  <option key={t.event_key} value={t.event_key}>Custom template: {t.name}</option>
                ))}
              </select>
              <span className="block text-[11px] text-slate-400 mt-1">
                {customTemplates.length === 0
                  ? 'Create custom designs in the Templates tab (with your own images) to use them here.'
                  : 'A custom template is sent as designed; an unsubscribe link is added automatically.'}
              </span>
            </label>

            {!form.template_key && (
            <>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Heading (optional)</span>
              <input value={form.heading ?? ''} onChange={(e) => set('heading', e.target.value)} className={inputClass} placeholder="Fresh campaigns just dropped" disabled={!isDraft} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Message</span>
              <textarea
                required
                rows={8}
                value={form.body}
                onChange={(e) => set('body', e.target.value)}
                disabled={!isDraft}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15 resize-y"
              />
              <span className="block text-[11px] text-slate-400 mt-1">Leave an empty line between paragraphs. {'{{ user_name }}'} becomes each user’s first name.</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Button text (optional)</span>
                <input value={form.button_label ?? ''} onChange={(e) => set('button_label', e.target.value)} className={inputClass} placeholder="Browse tasks" disabled={!isDraft} />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Button link</span>
                <input type="url" value={form.button_url ?? ''} onChange={(e) => set('button_url', e.target.value)} className={inputClass} placeholder="https://ebizearn.com/contributor" disabled={!isDraft} />
              </label>
            </div>
            </>
            )}

            {isDraft && (
              <>
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 flex flex-col sm:flex-row gap-2">
                  <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className={inputClass} placeholder="Send a test to…" />
                  <button type="button" onClick={sendTest} disabled={!testTo || saving || busyId !== null} className="h-10 px-4 rounded-xl text-sm font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:border-slate-300 disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0">
                    {busyId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send test
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="button" onClick={sendNow} disabled={saving || !form.name || !form.subject || (!form.template_key && !form.body)} className="h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 shadow-lg shadow-blue-500/20 disabled:opacity-50 inline-flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Send to {counts?.[form.audience] ?? 0} users
                  </button>
                  <button type="submit" disabled={saving} className="h-10 px-4 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save draft'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="xl:sticky xl:top-4">
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">Preview</p>
            {chosenTemplate ? <TemplatePreview template={chosenTemplate} subject={form.subject} name={previewName} /> : <Preview form={form} name={previewName} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-gray-400 max-w-xl">
          Marketing emails go through the active provider (Delivery tab) to active, verified users who haven’t unsubscribed. Every email has an unsubscribe link.
        </p>
        <button type="button" onClick={() => open('new')} className="h-10 px-4 rounded-xl text-sm font-bold text-white bg-[#07182F] hover:bg-[#168BFF] inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-10 text-center">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="mt-2 text-sm font-bold text-slate-700 dark:text-gray-200">No campaigns yet</p>
          <p className="text-xs text-slate-500 dark:text-gray-400">Create one to announce new tasks, promotions or updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const done = c.sent_count + c.failed_count;
            const pct = c.total_recipients ? Math.min(100, Math.round((done / c.total_recipients) * 100)) : 0;
            const running = busyId === c.id;
            return (
              <div key={c.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-gray-100 truncate">{c.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">{c.subject}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {AUDIENCE_LABELS[c.audience]}
                      {c.completed_at && ` · ${new Date(c.completed_at).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.status === 'draft' && (
                      <button type="button" onClick={() => open(c)} className="h-8 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-200 inline-flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    {c.status === 'sending' && !running && (
                      <button type="button" onClick={() => runSend(c)} className="h-8 px-3 rounded-lg text-xs font-bold bg-[#168BFF] text-white inline-flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Continue
                      </button>
                    )}
                    {(c.status === 'sending' || c.status === 'draft') && (
                      <button type="button" onClick={() => cancel(c)} title="Cancel" className="h-8 px-3 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 inline-flex items-center gap-1.5">
                        <Square className="w-3.5 h-3.5" /> {c.status === 'sending' ? 'Stop' : 'Cancel'}
                      </button>
                    )}
                    {c.status !== 'sending' && (
                      <button type="button" onClick={() => remove(c)} title="Delete" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 inline-flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {c.status !== 'draft' && (
                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#168BFF] to-[#7257FF] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {running && <Loader2 className="w-3 h-3 animate-spin" />}
                        {c.sent_count} sent{c.failed_count > 0 && <span className="text-red-600 dark:text-red-400"> · {c.failed_count} failed</span>} of {c.total_recipients}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    {c.last_error && c.failed_count > 0 && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 break-words">Last error: {c.last_error}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
