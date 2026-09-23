import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Pencil, Plus, Power, Send, Trash2, X, XCircle } from 'lucide-react';
import { emailApi, getApiError } from '../../../api';
import type { EmailDriver, EmailProvider, EmailProviderInput } from '../../../api';
import { useAuth } from '../../../context/AuthContext';

const DRIVER_LABELS: Record<EmailDriver, string> = {
  smtp: 'SMTP',
  brevo: 'Brevo',
  sendgrid: 'SendGrid',
  mailgun: 'Mailgun',
  ses: 'Amazon SES',
  log: 'Log / Test mode',
};

const SECRET_LABELS: Record<EmailDriver, string> = {
  smtp: 'Password',
  brevo: 'API key',
  sendgrid: 'API key',
  mailgun: 'API key',
  ses: 'SMTP password',
  log: '',
};

const emptyForm = (): EmailProviderInput => ({
  name: '',
  driver: 'smtp',
  host: '',
  port: 587,
  username: '',
  secret: '',
  encryption: 'tls',
  region: '',
  from_email: '',
  from_name: 'EbizEarn',
});

const inputClass = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#168BFF]';

export const ProviderManager: React.FC = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<EmailProvider | 'new' | null>(null);
  const [form, setForm] = useState<EmailProviderInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testTo, setTestTo] = useState(user?.email || '');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await emailApi.providers();
      setProviders(res.data);
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err, 'Could not load email providers.') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (provider: EmailProvider | 'new') => {
    setNotice(null);
    setEditing(provider);
    setForm(
      provider === 'new'
        ? emptyForm()
        : {
            name: provider.name,
            driver: provider.driver,
            host: provider.host ?? '',
            port: provider.port ?? undefined,
            username: provider.username ?? '',
            secret: '',
            encryption: provider.encryption ?? 'tls',
            region: provider.region ?? '',
            from_email: provider.from_email,
            from_name: provider.from_name,
          },
    );
  };

  const set = <K extends keyof EmailProviderInput>(key: K, value: EmailProviderInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      if (editing === 'new') {
        await emailApi.createProvider(form);
      } else if (editing) {
        await emailApi.updateProvider(editing.id, form);
      }
      setEditing(null);
      setNotice({ ok: true, text: 'Email provider saved.' });
      await load();
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err, 'Could not save provider.') });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: EmailProvider) => {
    setBusyId(p.id);
    try {
      await emailApi.setActive(p.id, !p.is_active);
      await load();
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: EmailProvider) => {
    if (!window.confirm(`Delete provider "${p.name}"?`)) return;
    setBusyId(p.id);
    try {
      await emailApi.deleteProvider(p.id);
      await load();
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err) });
    } finally {
      setBusyId(null);
    }
  };

  const sendTest = async (p: EmailProvider) => {
    setBusyId(p.id);
    setNotice(null);
    try {
      const res = await emailApi.testProvider(p.id, testTo);
      setNotice({ ok: true, text: res.message || 'Test email sent.' });
      setTestingId(null);
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err, 'Test failed.') });
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const driver = form.driver;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The active provider sends all platform emails. With none active, emails are written to the server log.
        </p>
        <button
          type="button"
          onClick={() => openForm('new')}
          className="px-4 py-2 bg-[#07182F] hover:bg-[#168BFF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add provider</span>
        </button>
      </div>

      {notice && (
        <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold ${notice.ok ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'}`}>
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : providers.length === 0 ? (
        <div className="p-6 rounded-2xl border border-dashed border-gray-300 dark:border-white/20 text-center text-xs text-gray-500 dark:text-gray-400">
          No providers yet. Add one to start sending real emails.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => (
            <div key={p.id} className={`p-4 rounded-2xl border space-y-3 ${p.is_active ? 'bg-white dark:bg-[#0C1322] border-emerald-300' : 'bg-white dark:bg-[#0C1322] border-slate-200 dark:border-white/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300">{DRIVER_LABELS[p.driver]}</span>
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 mt-1.5 truncate">{p.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono truncate">{p.from_name} {'<'}{p.from_email}{'>'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.is_active ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400'}`}>
                  {p.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>

              <div className="text-[11px] flex items-start gap-1.5">
                {p.status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                {p.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                <span className="text-slate-600 dark:text-gray-400 break-words min-w-0">
                  {p.last_tested_at
                    ? `Last test ${new Date(p.last_tested_at).toLocaleString()}: ${p.last_test_message ?? p.status}`
                    : 'Not tested yet'}
                </span>
              </div>

              {testingId === p.id && (
                <div className="flex gap-2">
                  <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Send test to…" className={inputClass} />
                  <button
                    type="button"
                    disabled={!testTo || busyId === p.id}
                    onClick={() => sendTest(p)}
                    className="px-3 py-2 rounded-xl bg-[#168BFF] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {busyId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => toggleActive(p)} disabled={busyId === p.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${p.is_active ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                  <Power className="w-3.5 h-3.5" />{p.is_active ? 'Disable' : 'Set active'}
                </button>
                <button type="button" onClick={() => setTestingId(testingId === p.id ? null : p.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 dark:bg-blue-500/15 flex items-center gap-1.5 cursor-pointer">
                  <Send className="w-3.5 h-3.5" />Test
                </button>
                <button type="button" onClick={() => openForm(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />Edit
                </button>
                <button type="button" onClick={() => remove(p)} disabled={busyId === p.id} title="Delete"
                  className="ml-auto p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:bg-red-500/10 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white dark:bg-[#0C1322] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">{editing === 'new' ? 'Add email provider' : 'Edit email provider'}</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">Name
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={`${inputClass} mt-1 font-normal`} placeholder="Production SMTP" />
            </label>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">Driver
              <select value={driver} onChange={(e) => set('driver', e.target.value as EmailDriver)} className={`${inputClass} mt-1 font-normal`}>
                {(Object.keys(DRIVER_LABELS) as EmailDriver[]).map((d) => <option key={d} value={d}>{DRIVER_LABELS[d]}</option>)}
              </select>
            </label>

            {(driver === 'smtp' || driver === 'mailgun') && (
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">{driver === 'smtp' ? 'SMTP host' : 'Mailgun domain'}
                <input required value={form.host ?? ''} onChange={(e) => set('host', e.target.value)} className={`${inputClass} mt-1 font-normal`} placeholder={driver === 'smtp' ? 'mail.example.com' : 'mg.example.com'} />
              </label>
            )}
            {driver === 'smtp' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">Port
                  <input type="number" value={form.port ?? ''} onChange={(e) => set('port', e.target.value ? Number(e.target.value) : undefined)} className={`${inputClass} mt-1 font-normal`} />
                </label>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">Encryption
                  <select value={form.encryption ?? 'tls'} onChange={(e) => set('encryption', e.target.value as 'tls' | 'ssl' | 'none')} className={`${inputClass} mt-1 font-normal`}>
                    <option value="tls">TLS (STARTTLS, 587)</option>
                    <option value="ssl">SSL (465)</option>
                    <option value="none">None</option>
                  </select>
                </label>
              </div>
            )}
            {(driver === 'smtp' || driver === 'ses') && (
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">Username
                <input value={form.username ?? ''} onChange={(e) => set('username', e.target.value)} className={`${inputClass} mt-1 font-normal`} autoComplete="off" />
              </label>
            )}
            {(driver === 'ses' || driver === 'mailgun') && (
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">{driver === 'ses' ? 'AWS region' : 'Region'}
                <input value={form.region ?? ''} onChange={(e) => set('region', e.target.value)} className={`${inputClass} mt-1 font-normal`} placeholder={driver === 'ses' ? 'us-east-1' : 'us or eu'} />
              </label>
            )}
            {driver !== 'log' && (
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">{SECRET_LABELS[driver]}
                <input
                  type="password"
                  value={form.secret ?? ''}
                  onChange={(e) => set('secret', e.target.value)}
                  required={editing === 'new'}
                  autoComplete="new-password"
                  className={`${inputClass} mt-1 font-normal`}
                  placeholder={editing !== 'new' && editing.has_secret ? 'Saved — leave blank to keep' : ''}
                />
              </label>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">From email
                <input required type="email" value={form.from_email} onChange={(e) => set('from_email', e.target.value)} className={`${inputClass} mt-1 font-normal`} placeholder="info@ebizearn.com" />
              </label>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400">From name
                <input required value={form.from_name} onChange={(e) => set('from_name', e.target.value)} className={`${inputClass} mt-1 font-normal`} />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#07182F] hover:bg-[#168BFF] text-white disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving…' : 'Save provider'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
