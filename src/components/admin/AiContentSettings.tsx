import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Eye, EyeOff, Loader2, PlugZap, Save, Sparkles, Trash2, XCircle } from 'lucide-react';
import { getApiError } from '../../api';
import { aiSettingsApi, type AiProvider, type AiSettingsAdmin } from '../../api/aiSettings';
import { toast } from '../../utils/toast';

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

const PROVIDERS: { key: AiProvider; label: string; keyUrl: string; keyHint: string }[] = [
  { key: 'gemini', label: 'Google Gemini', keyUrl: 'https://aistudio.google.com/app/apikey', keyHint: 'Google AI Studio → Get API key' },
  { key: 'openai', label: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys', keyHint: 'platform.openai.com → API keys (starts with sk-)' },
];

/**
 * Super Admin → Settings → AI content generator. The chosen service writes
 * campaign post content ("Generate with AI", Auto-mode versions) and checks
 * text for offensive language. The key is write-only: saved encrypted and
 * shown back only as ••••last4.
 */
export const AiContentSettings: React.FC = () => {
  const [saved, setSaved] = useState<AiSettingsAdmin | null>(null);
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [model, setModel] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = (s: AiSettingsAdmin) => {
    setSaved(s);
    setProvider(s.provider);
    setModel(s.model === s.default_models[s.provider] ? '' : s.model);
    setEnabled(s.enabled);
    setApiKey('');
  };

  useEffect(() => {
    aiSettingsApi
      .get()
      .then((res) => res.success && apply(res.data))
      .catch((e) => setError(getApiError(e, 'Could not load the AI settings.')));
  }, []);

  const providerInfo = PROVIDERS.find((p) => p.key === provider)!;
  const switchingProvider = !!saved && provider !== saved.provider;

  const save = async () => {
    setSaving(true);
    setError(null);
    setTest(null);
    try {
      const res = await aiSettingsApi.update({ provider, model: model.trim(), enabled, ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}) });
      if (res.success) {
        apply(res.data);
        toast.success(res.message || 'Saved.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save the AI settings.'));
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTest(null);
    try {
      const res = await aiSettingsApi.test();
      setTest({ ok: !!res.success, text: res.message || 'Connected.' });
    } catch (e) {
      setTest({ ok: false, text: getApiError(e, 'Connection failed.') });
    } finally {
      setTesting(false);
    }
  };

  const removeKey = async () => {
    try {
      const res = await aiSettingsApi.removeKey();
      if (res.success) {
        apply(res.data);
        toast.success('API key removed.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not remove the key.'));
    }
  };

  if (!saved) {
    return (
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center text-gray-400">
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : <Loader2 className="w-5 h-5 animate-spin inline-block" />}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-300" /> AI content generator
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Writes campaign post text ("Generate with AI" and each contributor's own version in Auto mode) and checks content for
            offensive language. Changes apply immediately.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="AI content on or off"
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">AI service</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setProvider(p.key)}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                provider === p.key
                  ? 'border-[#168BFF] bg-blue-50 dark:bg-blue-500/10 text-[#168BFF]'
                  : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#168BFF]/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ai-key" className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1.5">
            API key
          </label>
          <div className="relative">
            <input
              id="ai-key"
              type={showKey ? 'text' : 'password'}
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={saved.has_key && !switchingProvider ? `Saved ${saved.key_hint} — paste a new key to replace` : 'Paste the API key'}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 flex flex-wrap items-center gap-x-2">
            <a href={providerInfo.keyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#168BFF] hover:underline">
              Get a key <ExternalLink className="w-3 h-3" />
            </a>
            <span>{providerInfo.keyHint}</span>
          </p>
          {switchingProvider && !apiKey.trim() && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Switching service needs that service's own key.</p>
          )}
          {saved.key_source === 'env' && (
            <p className="text-[11px] text-gray-400 mt-1">Currently using OPENAI_API_KEY from the server .env — a key saved here takes over.</p>
          )}
        </div>
        <div>
          <label htmlFor="ai-model" className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1.5">
            Model <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            id="ai-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={`Default: ${saved.default_models[provider]}`}
            className={inputClass}
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">Leave empty to use the recommended model.</p>
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
      {test && (
        <p className={`text-xs font-semibold flex items-center gap-1.5 ${test.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
          {test.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {test.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
        <button
          type="button"
          disabled={testing || !saved.has_key}
          onClick={() => void runTest()}
          title={saved.has_key ? 'Send one short request with the saved settings' : 'Save a key first'}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" />} Test connection
        </button>
        {saved.has_key && saved.key_source === 'settings' && (
          <button
            type="button"
            onClick={() => void removeKey()}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" /> Remove key
          </button>
        )}
        <span className="text-[11px] text-gray-400 ml-auto">
          {saved.has_key ? `Key saved (${saved.key_hint}) · encrypted, never shown again` : 'No key saved'}
        </span>
      </div>
    </div>
  );
};
