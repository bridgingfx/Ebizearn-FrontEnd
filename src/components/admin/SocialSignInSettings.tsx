import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, KeyRound, Loader2, Save } from 'lucide-react';
import { authProvidersApi, getApiError } from '../../api';
import type { AuthProvidersAdmin, AuthProvidersInput } from '../../api';
import { AppleLogo, GoogleLogo } from '../common/PlatformIcons';
import { toast } from '../../utils/toast';

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15 disabled:opacity-60';

const Switch: React.FC<{ on: boolean; onChange: (v: boolean) => void; label: string }> = ({ on, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={() => onChange(!on)}
    className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${on ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'}`}
  >
    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
  </button>
);

const SourceNote: React.FC<{ source: 'settings' | 'env' | 'none' }> = ({ source }) =>
  source === 'env' ? (
    <span className="text-[11px] text-gray-400">Currently from the server .env — saving here takes over.</span>
  ) : null;

/**
 * Super Admin → Settings → Social sign-in. Turning a provider on shows its
 * button on every login / register page; off hides it (and the API refuses it).
 */
export const SocialSignInSettings: React.FC = () => {
  const [saved, setSaved] = useState<AuthProvidersAdmin | null>(null);
  const [form, setForm] = useState<AuthProvidersInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authProvidersApi
      .adminConfig()
      .then((res) => {
        setSaved(res.data);
        setForm({
          google: { enabled: res.data.google.enabled, client_id: res.data.google.client_id },
          apple: { enabled: res.data.apple.enabled, client_id: res.data.apple.client_id, redirect_uri: res.data.apple.redirect_uri },
        });
      })
      .catch((err) => toast.error(getApiError(err, 'Could not load sign-in settings.')));
  }, []);

  if (!form || !saved) {
    return (
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin inline-block" />
      </div>
    );
  }

  const set = <P extends keyof AuthProvidersInput, K extends keyof AuthProvidersInput[P]>(p: P, k: K, v: AuthProvidersInput[P][K]) =>
    setForm((f) => (f ? { ...f, [p]: { ...f[p], [k]: v } } : f));

  const dirty =
    form.google.enabled !== saved.google.enabled ||
    form.google.client_id !== saved.google.client_id ||
    form.apple.enabled !== saved.apple.enabled ||
    form.apple.client_id !== saved.apple.client_id ||
    form.apple.redirect_uri !== saved.apple.redirect_uri;

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const res = await authProvidersApi.update(form);
      setSaved(res.data);
      try {
        localStorage.removeItem('ebizearn_auth_providers_v1'); // login pages pick up the change immediately
      } catch {
        /* ignore */
      }
    } catch (err) {
      const fieldErrors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors ?? {};
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]])));
    } finally {
      setSaving(false);
    }
  };

  const providerCard = (
    key: 'google' | 'apple',
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
  ) => (
    <div className={`rounded-2xl border p-4 sm:p-5 transition-colors ${form[key].enabled ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/[0.04]' : 'border-gray-200 dark:border-white/10'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center">{icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {form[key].enabled ? 'Shown on the login and register pages' : 'Hidden — only email sign-in is shown'}
            </p>
          </div>
        </div>
        <Switch on={form[key].enabled} onChange={(v) => set(key, 'enabled', v)} label={`${title} on or off`} />
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#168BFF] dark:text-blue-300" /> Social sign-in
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Let people register and sign in with Google or Apple on the contributor, business and moderator pages. Turn a provider off to hide its button everywhere.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-[#07182F] dark:bg-[#168BFF] hover:bg-[#168BFF] disabled:opacity-40 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : dirty ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {dirty ? 'Apply changes' : 'Saved'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {providerCard('google', 'Google', <GoogleLogo className="w-5 h-5" />, (
          <>
            <label className="block">
              <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">OAuth Client ID</span>
              <input
                value={form.google.client_id}
                onChange={(e) => set('google', 'client_id', e.target.value.trim())}
                placeholder="1234567890-abc123.apps.googleusercontent.com"
                className={inputClass}
                spellCheck={false}
              />
              {errors['google.client_id'] ? (
                <span className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors['google.client_id']}</span>
              ) : (
                <SourceNote source={saved.google.source} />
              )}
            </label>
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Google Cloud → APIs &amp; Services → Credentials → <b>OAuth client ID (Web application)</b>. Add{' '}
              <code className="px-1 rounded bg-gray-100 dark:bg-white/10">https://ebizearn.com</code> under Authorized JavaScript origins, and set the consent screen to <b>In production</b>. Only the Client ID is needed — never paste the client secret.{' '}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-[#168BFF] hover:underline">
                Open console <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </>
        ))}

        {providerCard('apple', 'Apple', <AppleLogo className="w-5 h-5 text-gray-900 dark:text-white" />, (
          <>
            <label className="block">
              <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Services ID</span>
              <input
                value={form.apple.client_id}
                onChange={(e) => set('apple', 'client_id', e.target.value.trim())}
                placeholder="com.ebizearn.web"
                className={inputClass}
                spellCheck={false}
              />
              {errors['apple.client_id'] ? (
                <span className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors['apple.client_id']}</span>
              ) : (
                <SourceNote source={saved.apple.source} />
              )}
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Return URL</span>
              <input
                value={form.apple.redirect_uri}
                onChange={(e) => set('apple', 'redirect_uri', e.target.value.trim())}
                placeholder="https://ebizearn.com/login"
                className={inputClass}
                spellCheck={false}
              />
              {errors['apple.redirect_uri'] && <span className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors['apple.redirect_uri']}</span>}
            </label>
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Apple Developer → Certificates, IDs &amp; Profiles → <b>Services IDs</b>. Enable “Sign in with Apple”, add the domain <code className="px-1 rounded bg-gray-100 dark:bg-white/10">ebizearn.com</code> and this exact Return URL. Needs a paid Apple Developer account.{' '}
              <a href="https://developer.apple.com/account/resources/identifiers/list/serviceId" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-[#168BFF] hover:underline">
                Open Apple Developer <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </>
        ))}
      </div>
    </div>
  );
};
