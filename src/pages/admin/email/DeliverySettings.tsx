import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  FlaskConical,
  Loader2,
  Mail,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import { emailApi, getApiError } from '../../../api';
import type { EmailDriver, EmailProvider, EmailStatus } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../utils/toast';

type Option = {
  driver: EmailDriver;
  label: string;
  tagline: string;
  icon: React.ElementType;
  recommended?: boolean;
  help: React.ReactNode;
};

const OPTIONS: Option[] = [
  {
    driver: 'brevo',
    label: 'Brevo',
    tagline: 'API key · no SMTP needed',
    icon: Sparkles,
    recommended: true,
    help: (
      <>
        In Brevo open <b>SMTP &amp; API → API keys</b> and copy a key (it starts with <code>xkeysib-</code>). The sender
        email must be a verified sender in <b>Brevo → Senders &amp; domains</b>. If IP blocking is on, add your server IP in{' '}
        <b>Security → Authorised IPs</b>.
      </>
    ),
  },
  {
    driver: 'smtp',
    label: 'SMTP',
    tagline: 'Any mail server',
    icon: Server,
    help: <>Use the host, port, username and password from your mail host (cPanel mail, Gmail Workspace, Zoho, Brevo SMTP…).</>,
  },
  {
    driver: 'sendgrid',
    label: 'SendGrid',
    tagline: 'API key',
    icon: Zap,
    help: <>Create an API key with “Mail Send” access in SendGrid → Settings → API Keys and verify the sender.</>,
  },
  {
    driver: 'mailgun',
    label: 'Mailgun',
    tagline: 'Domain + API key',
    icon: Mail,
    help: <>Use your sending domain (e.g. mg.ebizearn.com) and the private API key. Choose “eu” as region for EU accounts.</>,
  },
  {
    driver: 'ses',
    label: 'Amazon SES',
    tagline: 'SMTP credentials',
    icon: Cloud,
    help: <>Use the SES SMTP username and password (not your AWS access keys) and the region your identity is verified in.</>,
  },
  {
    driver: 'log',
    label: 'Test mode',
    tagline: 'Write emails to the log only',
    icon: FlaskConical,
    help: <>Nothing is delivered — every email is written to the server log. Use only while developing.</>,
  },
];

type Form = {
  host: string;
  port: string;
  username: string;
  secret: string;
  encryption: 'tls' | 'ssl' | 'none';
  region: string;
  from_email: string;
  from_name: string;
};

const blankForm = (): Form => ({
  host: '',
  port: '587',
  username: '',
  secret: '',
  encryption: 'tls',
  region: '',
  from_email: 'info@ebizearn.com',
  from_name: 'eBizEarn',
});

const fromProvider = (p: EmailProvider | undefined, fallback: Form): Form =>
  p
    ? {
        host: p.host ?? '',
        port: p.port ? String(p.port) : '587',
        username: p.username ?? '',
        secret: '',
        encryption: p.encryption ?? 'tls',
        region: p.region ?? '',
        from_email: p.from_email,
        from_name: p.from_name,
      }
    : { ...blankForm(), from_email: fallback.from_email, from_name: fallback.from_name };

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 dark:text-gray-500 mt-1">{hint}</span>}
  </label>
);

const SECRET_LABEL: Record<EmailDriver, string> = {
  brevo: 'Brevo API key',
  smtp: 'Password',
  sendgrid: 'SendGrid API key',
  mailgun: 'Mailgun API key',
  ses: 'SMTP password',
  log: '',
};

/** Super Admin → Email → Delivery: pick a provider, enter its details, apply. */
export const DeliverySettings: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmailDriver>('brevo');
  const [form, setForm] = useState<Form>(blankForm());
  const [applying, setApplying] = useState(false);
  const [testTo, setTestTo] = useState(user?.email ?? '');
  const [testing, setTesting] = useState(false);

  const load = useCallback(async (selectActive = false) => {
    try {
      const [s, p] = await Promise.all([emailApi.status(), emailApi.providers()]);
      setStatus(s.data);
      setProviders(p.data);
      if (selectActive) {
        const driver = s.data.driver ?? 'brevo';
        setSelected(driver);
        setForm(fromProvider(p.data.find((x) => x.driver === driver), blankForm()));
      }
    } catch (err) {
      toast.error(getApiError(err, 'Could not load email settings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const saved = useMemo(() => providers.find((p) => p.driver === selected), [providers, selected]);
  const option = OPTIONS.find((o) => o.driver === selected)!;
  const isActive = !!saved?.is_active;

  const choose = (driver: EmailDriver) => {
    setSelected(driver);
    setForm((f) => fromProvider(providers.find((p) => p.driver === driver), f));
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      const res = await emailApi.apply({
        driver: selected,
        host: form.host || null,
        port: form.port ? Number(form.port) : null,
        username: form.username || null,
        secret: form.secret || undefined,
        encryption: form.encryption,
        region: form.region || null,
        from_email: form.from_email,
        from_name: form.from_name,
      });
      toast.success(res.message || `${option.label} is now active.`);
      setForm((f) => ({ ...f, secret: '' }));
      await load();
    } catch (err) {
      toast.error(getApiError(err, 'Could not apply these settings.'));
    } finally {
      setApplying(false);
    }
  };

  const sendTest = async () => {
    if (!saved) return;
    setTesting(true);
    try {
      const res = await emailApi.testProvider(saved.id, testTo);
      toast.success(res.message || `Test email sent to ${testTo}.`);
    } catch (err) {
      toast.error(getApiError(err, 'Test failed.'));
    } finally {
      setTesting(false);
      load();
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin inline-block" />
      </div>
    );
  }

  const needsKey = selected !== 'log';
  const keyRequired = needsKey && !saved?.has_secret;

  return (
    <div className="space-y-5">
      {/* What is sending right now */}
      {status && (
        <div
          className={`rounded-2xl border p-4 flex items-start gap-3 ${
            status.source === 'none' || status.driver === 'log'
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
              : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
          }`}
        >
          {status.source === 'none' || status.driver === 'log' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 text-sm">
            {status.source === 'none' ? (
              <>
                <p className="font-bold text-amber-800 dark:text-amber-200">No email provider is active</p>
                <p className="text-amber-700 dark:text-amber-300/90 text-xs mt-0.5">
                  Registration codes, password resets and campaigns cannot be delivered. Choose a provider below and press Apply.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-slate-900 dark:text-gray-100">
                  Sending through {OPTIONS.find((o) => o.driver === status.driver)?.label ?? status.name}
                  {status.source === 'env' && <span className="font-medium text-slate-500 dark:text-gray-400"> (BREVO_API_KEY from the server .env)</span>}
                </p>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5 break-all">
                  From {status.from_name} &lt;{status.from_email}&gt; · used for registration, account emails and marketing campaigns.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Provider options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {OPTIONS.map((o) => {
          const on = selected === o.driver;
          const active = providers.some((p) => p.driver === o.driver && p.is_active);
          const Icon = o.icon;
          return (
            <button
              key={o.driver}
              type="button"
              onClick={() => choose(o.driver)}
              aria-pressed={on}
              className={`relative text-left p-4 rounded-2xl border transition-all ${
                on
                  ? 'border-[#168BFF] bg-[#168BFF]/[0.06] dark:bg-[#168BFF]/10 ring-2 ring-[#168BFF]/20'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    on ? 'bg-gradient-to-br from-[#168BFF] to-[#7257FF] text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </span>
                {active ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">● Active</span>
                ) : o.recommended ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300">Recommended</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900 dark:text-gray-100">{o.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">{o.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Settings for the chosen option */}
      <form onSubmit={apply} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">{option.label} settings</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 max-w-2xl leading-relaxed">{option.help}</p>
          </div>
          {saved && (
            <span className="text-[11px] flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
              {saved.status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {saved.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
              {saved.last_tested_at ? `Last test: ${saved.status === 'ok' ? 'delivered' : 'failed'}` : 'Not tested yet'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(selected === 'smtp' || selected === 'mailgun') && (
            <Field label={selected === 'smtp' ? 'SMTP host' : 'Mailgun domain'}>
              <input required value={form.host} onChange={(e) => set('host', e.target.value)} className={inputClass} placeholder={selected === 'smtp' ? 'smtp-relay.brevo.com' : 'mg.ebizearn.com'} />
            </Field>
          )}
          {selected === 'smtp' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Port">
                <input type="number" value={form.port} onChange={(e) => set('port', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Encryption">
                <select value={form.encryption} onChange={(e) => set('encryption', e.target.value as Form['encryption'])} className={inputClass}>
                  <option value="tls">TLS (587)</option>
                  <option value="ssl">SSL (465)</option>
                  <option value="none">None</option>
                </select>
              </Field>
            </div>
          )}
          {(selected === 'smtp' || selected === 'ses') && (
            <Field label="Username">
              <input value={form.username} onChange={(e) => set('username', e.target.value)} className={inputClass} autoComplete="off" />
            </Field>
          )}
          {(selected === 'ses' || selected === 'mailgun') && (
            <Field label="Region">
              <input value={form.region} onChange={(e) => set('region', e.target.value)} className={inputClass} placeholder={selected === 'ses' ? 'us-east-1' : 'us or eu'} />
            </Field>
          )}
          {needsKey && (
            <div className={selected === 'brevo' || selected === 'sendgrid' ? 'sm:col-span-2' : ''}>
              <Field
                label={SECRET_LABEL[selected]}
                hint={saved?.has_secret ? 'A key is saved. Leave blank to keep it, or paste a new one to replace it.' : undefined}
              >
                <input
                  type="password"
                  value={form.secret}
                  onChange={(e) => set('secret', e.target.value)}
                  required={keyRequired}
                  autoComplete="new-password"
                  className={`${inputClass} font-mono`}
                  placeholder={saved?.has_secret ? '•••••••••• saved' : selected === 'brevo' ? 'xkeysib-…' : ''}
                />
              </Field>
            </div>
          )}
          <Field label="Sender email" hint={selected === 'brevo' ? 'Must be a verified sender in Brevo.' : undefined}>
            <input required type="email" value={form.from_email} onChange={(e) => set('from_email', e.target.value)} className={inputClass} placeholder="info@ebizearn.com" />
          </Field>
          <Field label="Sender name">
            <input required value={form.from_name} onChange={(e) => set('from_name', e.target.value)} className={inputClass} placeholder="eBizEarn" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={applying}
            className="h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 shadow-lg shadow-blue-500/20 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isActive ? 'Save changes' : `Apply ${option.label}`}
          </button>
          <span className="text-xs text-slate-500 dark:text-gray-400">
            {isActive ? 'This option is sending all platform emails.' : 'Applying makes this the only active email option.'}
          </span>
        </div>
      </form>

      {/* Test */}
      {saved && selected !== 'log' && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-gray-100">Send a test email</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Checks the saved {option.label} settings end to end. The exact provider error is shown if it fails.</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className={`${inputClass} sm:max-w-sm`} />
            <button
              type="button"
              onClick={sendTest}
              disabled={!testTo || testing}
              className="h-10 px-4 rounded-xl text-sm font-bold bg-[#07182F] dark:bg-white/10 text-white hover:bg-[#0D2342] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send test
            </button>
          </div>
          {saved.last_test_message && (
            <p className={`mt-3 text-xs break-words ${saved.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {saved.last_test_message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
