import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, KeyRound, Loader2, Save } from 'lucide-react';
import { socialConnectApi, getApiError } from '../../api';
import type { SocialConnectAdminConfig, SocialConnectInput, SocialConnectConfigKey } from '../../api';
import { TikTokLogo, XTwitterLogo, FacebookLogo, GoogleLogo, YouTubeLogo } from '../common/PlatformIcons';
import { toast } from '../../utils/toast';

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

/** Same VITE_API_URL the api client uses, minus the /api/v1 suffix. */
const apiOrigin = (() => {
  const raw = ((import.meta.env.VITE_API_URL as string | undefined) || '').replace(/\/api\/v1\/?$/, '');
  return raw || (typeof window !== 'undefined' ? window.location.origin : '');
})();

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

interface ProviderDef {
  key: SocialConnectConfigKey;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  consoleUrl: string;
  consoleLabel: string;
  help: React.ReactNode;
}

const redirectUri = (key: SocialConnectConfigKey) => `${apiOrigin}/oauth/social/${key}/callback`;

const PROVIDERS: ProviderDef[] = [
  {
    key: 'tiktok',
    title: 'TikTok',
    subtitle: '“Connect with TikTok” on the contributor profile',
    icon: <TikTokLogo className="w-5 h-5" />,
    consoleUrl: 'https://developers.tiktok.com/apps/',
    consoleLabel: 'Open TikTok Developers',
    help: (
      <>
        TikTok Developers → your app → enable <b>Login Kit</b> (add the <b>Web</b> platform), request the <b>user.info.basic</b> scope, and register this exact Redirect URI. The channel is auto-verified on login; our robo re-checks it afterwards.{' '}
      </>
    ),
  },
  {
    key: 'x',
    title: 'X',
    subtitle: '“Connect with X” on the contributor profile',
    icon: <XTwitterLogo className="w-5 h-5" />,
    consoleUrl: 'https://developer.x.com/en/portal/dashboard',
    consoleLabel: 'Open X Developer Portal',
    help: (
      <>
        X Developer Portal → your app → enable <b>OAuth 2.0</b> (confidential client) with scopes <b>users.read tweet.read offline.access</b>, and register this exact Redirect URI.{' '}
      </>
    ),
  },
  {
    key: 'facebook',
    title: 'Facebook',
    subtitle: '“Connect with Facebook” on the contributor profile',
    icon: <FacebookLogo className="w-5 h-5" />,
    consoleUrl: 'https://developers.facebook.com/apps/',
    consoleLabel: 'Open Meta Developers',
    help: (
      <>
        Meta Developers → your app → add the <b>Facebook Login</b> product (Web platform), and register this exact Redirect URI under <b>Valid OAuth Redirect URIs</b>. App review may be required for production use.{' '}
      </>
    ),
  },
  {
    key: 'google',
    title: 'Google (YouTube)',
    subtitle: '“Connect with YouTube” on the contributor profile',
    icon: <span className="flex items-center gap-1"><GoogleLogo className="w-4 h-4" /><YouTubeLogo className="w-5 h-5" /></span>,
    consoleUrl: 'https://console.cloud.google.com/apis/credentials',
    consoleLabel: 'Open Google Cloud',
    help: (
      <>
        Google Cloud → APIs &amp; Services → Credentials → <b>OAuth client ID (Web application)</b>. Enable the <b>YouTube Data API v3</b> and the <b>youtube.readonly</b> scope, and register this exact Redirect URI. Warning: Google shows an <b>“unverified app”</b> screen until your app passes Google verification.{' '}
      </>
    ),
  },
];

type FormState = Record<SocialConnectConfigKey, { enabled: boolean; client_id: string; client_secret: string }>;

/**
 * Super Admin → Settings → Social connect (OAuth).
 * Turning a provider on shows its "Connect with …" button on the contributor
 * profile; off hides it (and the API refuses the flow). Secrets stay on the
 * server — leave the field empty to keep the saved one.
 */
export const SocialConnectSettings: React.FC = () => {
  const [saved, setSaved] = useState<SocialConnectAdminConfig | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    socialConnectApi
      .adminConfig()
      .then((res) => {
        setSaved(res.data);
        const f = {} as FormState;
        (Object.keys(res.data) as SocialConnectConfigKey[]).forEach((k) => {
          f[k] = { enabled: res.data[k].enabled, client_id: res.data[k].client_id, client_secret: '' };
        });
        setForm(f);
      })
      .catch((err) => toast.error(getApiError(err, 'Could not load social connect settings.')));
  }, []);

  if (!form || !saved) {
    return (
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin inline-block" />
      </div>
    );
  }

  const set = <K extends 'enabled' | 'client_id' | 'client_secret'>(p: SocialConnectConfigKey, k: K, v: FormState[SocialConnectConfigKey][K]) =>
    setForm((f) => (f ? { ...f, [p]: { ...f[p], [k]: v } } : f));

  const dirty = (Object.keys(form) as SocialConnectConfigKey[]).some(
    (k) => form[k].enabled !== saved[k].enabled || form[k].client_id !== saved[k].client_id || form[k].client_secret !== '',
  );

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const payload = {} as SocialConnectInput;
      (Object.keys(form) as SocialConnectConfigKey[]).forEach((k) => {
        payload[k] = { enabled: form[k].enabled, client_id: form[k].client_id };
        if (form[k].client_secret !== '') payload[k].client_secret = form[k].client_secret; // omit to keep the saved one
      });
      const res = await socialConnectApi.update(payload);
      setSaved(res.data);
      const f = { ...form };
      (Object.keys(f) as SocialConnectConfigKey[]).forEach((k) => { f[k] = { ...f[k], client_secret: '' }; });
      setForm(f);
      toast.success('Social connect settings saved.');
    } catch (err) {
      const fieldErrors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors ?? {};
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]])));
      toast.error(getApiError(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const providerCard = (def: ProviderDef) => {
    const key = def.key;
    const uri = redirectUri(key);
    return (
      <div key={key} className={`rounded-2xl border p-4 sm:p-5 transition-colors ${form[key].enabled ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/[0.04]' : 'border-gray-200 dark:border-white/10'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">{def.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{def.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {form[key].enabled ? 'Button shown on the contributor profile' : 'Hidden — manual bio-code linking only'}
              </p>
            </div>
          </div>
          <Switch on={form[key].enabled} onChange={(v) => set(key, 'enabled', v)} label={`${def.title} on or off`} />
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">OAuth Client ID</span>
            <input
              value={form[key].client_id}
              onChange={(e) => set(key, 'client_id', e.target.value.trim())}
              placeholder="Paste the client ID from the provider console"
              className={inputClass}
              spellCheck={false}
              autoComplete="off"
            />
            {errors[`${key}.client_id`] && <span className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors[`${key}.client_id`]}</span>}
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">OAuth Client Secret</span>
            <input
              type="password"
              value={form[key].client_secret}
              onChange={(e) => set(key, 'client_secret', e.target.value.trim())}
              placeholder={saved[key].has_secret ? '•••••••• (saved — leave empty to keep)' : 'Paste the client secret'}
              className={inputClass}
              spellCheck={false}
              autoComplete="new-password"
            />
            {errors[`${key}.client_secret`] && <span className="block text-[11px] text-red-600 dark:text-red-400 mt-1">{errors[`${key}.client_secret`]}</span>}
          </label>
          <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3">
            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Register this exact Redirect URI:</p>
            <code className="block text-[11px] font-mono text-[#0B6CD6] dark:text-blue-300 break-all">{uri}</code>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            {def.help}
            <a href={def.consoleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-[#168BFF] hover:underline">
              {def.consoleLabel} <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#168BFF] dark:text-blue-300" /> Social connect (OAuth)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Let contributors link TikTok, X, Facebook and YouTube with the official login instead of the bio code. OAuth channels are auto-verified and our robo re-checks them. Instagram has no official login for personal accounts — it always uses the bio code.
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
        {PROVIDERS.map(providerCard)}
      </div>
    </div>
  );
};
