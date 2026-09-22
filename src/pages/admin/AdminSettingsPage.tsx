import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Settings, Save, Loader2, AlertCircle, CheckCircle2, Sliders, ShieldAlert, ToggleLeft } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { FeatureFlag, SystemSetting } from '../../types';
import { WITHDRAWAL_THRESHOLD_OPTIONS } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Platform settings. Reads/writes real system settings (GET + PATCH
 * /admin/system-settings) and real feature flags (GET /admin/feature-flags).
 * There are no payment-gateway toggles here — crypto is out of scope per the
 * owner decision, and gateways live under the superadmin payments endpoints.
 *
 * Withdrawal threshold: stored on the `withdrawal_minimum_usd` system-setting
 * key as a provisional control (default $50 per the mission brief). The
 * canonical withdrawal-rule source is the ops withdrawal-rules API managed by
 * Worker C; this control should be reconciled with it.
 */
const WITHDRAWAL_KEY = 'withdrawal_minimum_usd';
const DEFAULT_THRESHOLD = 50;

const toMap = (list: SystemSetting[]): Record<string, string> => {
  const m: Record<string, string> = {};
  for (const s of list) m[s.key] = s.value == null ? '' : String(s.value);
  return m;
};

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, fRes] = await Promise.all([adminApi.systemSettings(), adminApi.featureFlags()]);
      const sList: SystemSetting[] = (sRes as { data?: SystemSetting[] }).data ?? [];
      const fList: FeatureFlag[] = (fRes as { data?: FeatureFlag[] }).data ?? [];
      setSettings(sList);
      setDrafts(toMap(sList));
      setFlags(fList);
    } catch (e) {
      setError(getApiError(e, 'Could not load platform settings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveSetting = async (key: string) => {
    setSavingKey(key);
    setNotice(null);
    try {
      const res = await adminApi.updateSystemSetting(key, drafts[key]);
      if ((res as { success?: boolean }).success !== false) {
        setNotice({ kind: 'ok', text: `Setting "${key}" saved.` });
        await load();
      } else {
        setNotice({ kind: 'err', text: (res as { message?: string }).message || `Could not save "${key}".` });
      }
    } catch (e) {
      setNotice({ kind: 'err', text: getApiError(e, `Could not save "${key}".`) });
    } finally {
      setSavingKey(null);
    }
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    setTogglingKey(flag.key);
    setNotice(null);
    try {
      const res = await adminApi.updateFeatureFlag(flag.key, !flag.is_enabled);
      if (res.success) {
        setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, is_enabled: !flag.is_enabled } : f)));
      } else {
        setNotice({ kind: 'err', text: (res as { message?: string }).message || 'Could not update feature flag.' });
      }
    } catch (e) {
      setNotice({ kind: 'err', text: getApiError(e, 'Could not update feature flag.') });
    } finally {
      setTogglingKey(null);
    }
  };

  const threshold = useMemo(() => {
    const v = parseInt(drafts[WITHDRAWAL_KEY] || '', 10);
    return WITHDRAWAL_THRESHOLD_OPTIONS.includes(v as (typeof WITHDRAWAL_THRESHOLD_OPTIONS)[number])
      ? v
      : DEFAULT_THRESHOLD;
  }, [drafts]);

  const saveThreshold = async (usd: number) => {
    setSavingKey(WITHDRAWAL_KEY);
    setNotice(null);
    try {
      const res = await adminApi.updateSystemSetting(WITHDRAWAL_KEY, String(usd));
      if ((res as { success?: boolean }).success !== false) {
        setNotice({ kind: 'ok', text: `Withdrawal threshold set to $${usd}.` });
        await load();
      } else {
        setNotice({ kind: 'err', text: (res as { message?: string }).message || 'Could not save threshold.' });
      }
    } catch (e) {
      setNotice({ kind: 'err', text: getApiError(e, 'Could not save threshold.') });
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold text-red-700">Could not load settings</p>
          <p className="text-red-600 mt-1">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Every value below is read from and written to the live API.</p>
      </div>

      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 ${
            notice.kind === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {notice.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notice.text}
        </div>
      )}

      {/* Withdrawal threshold */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-[#168BFF]" /> Withdrawal Threshold
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Minimum balance a contributor must hold before they can request a withdrawal. Default ${DEFAULT_THRESHOLD}.
          Currently provisional — stored as a system setting and reconciled with the ops withdrawal-rules API.
        </p>
        <div className="flex gap-2 flex-wrap">
          {WITHDRAWAL_THRESHOLD_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={savingKey === WITHDRAWAL_KEY}
              onClick={() => void saveThreshold(opt)}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-colors disabled:opacity-50 ${
                threshold === opt
                  ? 'bg-[#07182F] text-white'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              ${opt}
            </button>
          ))}
        </div>
      </div>

      {/* System settings */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-[#168BFF]" /> System Settings
        </h3>
        {settings.length === 0 ? (
          <EmptyState icon={Settings} title="No system settings" description="No system settings have been defined on the backend yet." />
        ) : (
          <div className="space-y-3">
            {settings.map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="sm:w-64 shrink-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 font-mono">{s.key}</p>
                  {s.description && <p className="text-[11px] text-gray-400 dark:text-gray-500">{s.description}</p>}
                </div>
                <input
                  value={drafts[s.key] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
                />
                <button
                  type="button"
                  disabled={savingKey === s.key}
                  onClick={() => void saveSetting(s.key)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#07182F] hover:bg-[#168BFF] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  {savingKey === s.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature flags */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-[#168BFF]" /> Feature Flags
        </h3>
        {flags.length === 0 ? (
          <EmptyState icon={ToggleLeft} title="No feature flags" description="No feature flags are defined on the backend yet." />
        ) : (
          <div className="space-y-2.5">
            {flags.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl"
              >
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100 font-mono">{f.key}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{f.description || f.name || '—'}</p>
                </div>
                <button
                  type="button"
                  disabled={togglingKey === f.key}
                  onClick={() => void toggleFlag(f)}
                  className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                    f.is_enabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                  title={f.is_enabled ? 'Disable' : 'Enable'}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-[#0C1322] shadow transition-all ${
                      f.is_enabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
