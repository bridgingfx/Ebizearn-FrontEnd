import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Percent,
  DollarSign,
  Lock,
  Loader2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  ClipboardCheck,
  KeyRound,
} from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { ReferralRule, ReferralRuleInput, ReferralRulesResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';

/** Editable form state per level (dollars / percent as strings for inputs). */
interface LevelDraft {
  level: number;
  mode: 'flat' | 'percent';
  amount: string; // dollars, e.g. "1.00"
  percent: string; // e.g. "10"
  enabled: boolean;
}

const LEVEL_COPY: Record<number, { title: string; chain: string }> = {
  1: { title: 'Direct referral', chain: 'You → your friend' },
  2: { title: 'Second level', chain: 'You → friend → their friend' },
  3: { title: 'Third level', chain: 'You → friend → friend → theirs' },
};

const toDraft = (r: ReferralRule): LevelDraft => ({
  level: r.level,
  mode: r.reward_mode,
  amount: ((r.reward_cents ?? 0) / 100).toFixed(2),
  percent: String((r.percent_bps ?? 0) / 100),
  enabled: r.is_enabled,
});

const sameDraft = (a: LevelDraft, b: LevelDraft) =>
  a.mode === b.mode &&
  a.enabled === b.enabled &&
  (a.mode === 'flat' ? Number(a.amount) === Number(b.amount) : Number(a.percent) === Number(b.percent));

/** Returns an error message, or null when the level is valid. */
const validate = (d: LevelDraft): string | null => {
  if (d.mode === 'flat') {
    const v = Number(d.amount);
    if (d.amount.trim() === '' || Number.isNaN(v)) return 'Enter an amount';
    if (v < 0 || v > 10000) return 'Between $0 and $10,000';
  } else {
    const v = Number(d.percent);
    if (d.percent.trim() === '' || Number.isNaN(v)) return 'Enter a percentage';
    if (v < 0 || v > 100) return 'Between 0% and 100%';
  }
  return null;
};

const preview = (d: LevelDraft) => {
  // The API falls back to the platform default when a level's rule is off.
  if (!d.enabled) return 'Custom rate off — the platform default applies. To pay nothing, keep it on and set 0.';
  if (d.mode === 'flat') return `Earns $${(Number(d.amount) || 0).toFixed(2)} per qualified referral`;
  return `Earns ${Number(d.percent) || 0}% of the referral's first approved task reward`;
};

/**
 * Referral commissions (L1 / L2 / L3). Super Admin can always edit; an
 * admin can edit only after Super Admin grants "Change referral
 * commissions" (manage_referral_rules). Everyone else sees it read-only.
 */
export const ReferralCommissionSettings: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ReferralRulesResponse | null>(null);
  const [saved, setSaved] = useState<LevelDraft[]>([]);
  const [drafts, setDrafts] = useState<LevelDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.referralRules();
      if (res.success) {
        const list = Object.values(res.data.rules).sort((a, b) => a.level - b.level).map(toDraft);
        setData(res.data);
        setSaved(list);
        setDrafts(list);
      } else {
        setError(res.message || 'Could not load commissions.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load commissions.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canEdit = !!data?.can_edit;
  const changed = useMemo(() => drafts.filter((d, i) => saved[i] && !sameDraft(d, saved[i])), [drafts, saved]);
  const errors = useMemo(() => Object.fromEntries(drafts.map((d) => [d.level, validate(d)])), [drafts]);
  const hasErrors = changed.some((d) => errors[d.level]);

  const patch = (level: number, next: Partial<LevelDraft>) => {
    setMsg(null);
    setDrafts((prev) => prev.map((d) => (d.level === level ? { ...d, ...next } : d)));
  };

  const save = async () => {
    if (!changed.length || hasErrors) return;
    setSaving(true);
    setMsg(null);
    const levels: ReferralRuleInput[] = changed.map((d) =>
      d.mode === 'flat'
        ? { level: d.level, reward_mode: 'flat', reward_cents: Math.round(Number(d.amount) * 100), is_enabled: d.enabled }
        : { level: d.level, reward_mode: 'percent', percent_bps: Math.round(Number(d.percent) * 100), is_enabled: d.enabled }
    );
    try {
      const res = await adminApi.updateReferralRules(levels);
      if (res.success) {
        setMsg({ ok: true, text: `Saved ${levels.length} level${levels.length > 1 ? 's' : ''}. New qualifications use these rates.` });
        await load();
      } else {
        setMsg({ ok: false, text: res.message || 'Could not save commissions.' });
      }
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not save commissions.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Referral commissions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xl">
            What a referrer earns when someone in their chain qualifies. Changes apply to future qualifications only —
            rewards already paid never change.
          </p>
        </div>
        {data &&
          (canEdit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> You can edit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[11px] font-bold">
              <Lock className="w-3.5 h-3.5" /> Read only
            </span>
          ))}
      </div>

      {loading ? (
        <div className="py-14 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin inline-block" />
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
          <button type="button" onClick={() => void load()} className="underline font-bold">Retry</button>
        </div>
      ) : (
        <>
          {!canEdit && (
            <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[12px] text-amber-800 dark:text-amber-200">
                Only Super Admin can change commissions. Super Admin can give you access under{' '}
                <b>Roles &amp; Permissions → “Change referral commissions”</b>.
              </p>
            </div>
          )}

          {/* Level cards */}
          <div className={`p-6 grid gap-4 ${drafts.length >= 3 ? 'md:grid-cols-3' : drafts.length === 2 ? 'md:grid-cols-2' : ''}`}>
            {drafts.map((d, i) => {
              const copy = LEVEL_COPY[d.level] ?? { title: `Level ${d.level}`, chain: '' };
              const dirty = saved[i] && !sameDraft(d, saved[i]);
              const err = errors[d.level];
              return (
                <div
                  key={d.level}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    dirty
                      ? 'border-[#168BFF] ring-2 ring-[#168BFF]/15'
                      : 'border-gray-200 dark:border-white/10'
                  } ${d.enabled ? 'bg-white dark:bg-white/[0.03]' : 'bg-gray-50 dark:bg-white/[0.02] opacity-80'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#07182F] to-[#168BFF] text-white font-black text-sm flex items-center justify-center shadow-sm">
                        L{d.level}
                      </span>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100">{copy.title}</p>
                        <p className="text-[10px] text-gray-400">{copy.chain}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={d.enabled}
                      aria-label={`Level ${d.level} enabled`}
                      disabled={!canEdit}
                      onClick={() => patch(d.level, { enabled: !d.enabled })}
                      className={`relative w-10 h-6 rounded-full shrink-0 transition-colors disabled:cursor-not-allowed ${
                        d.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${d.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Mode */}
                  <div className="mt-4 grid grid-cols-2 gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/10 text-[11px] font-bold">
                    {(['flat', 'percent'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => patch(d.level, { mode: m })}
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-colors disabled:cursor-not-allowed ${
                          d.mode === m
                            ? 'bg-white dark:bg-[#0C1322] text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {m === 'flat' ? <DollarSign className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                        {m === 'flat' ? 'Fixed amount' : 'Percentage'}
                      </button>
                    ))}
                  </div>

                  {/* Value */}
                  <div className="mt-3">
                    <div
                      className={`flex items-center rounded-xl border bg-gray-50 dark:bg-white/5 px-3 ${
                        err && dirty ? 'border-red-400' : 'border-gray-200 dark:border-white/10 focus-within:border-[#168BFF]'
                      }`}
                    >
                      {d.mode === 'flat' && <span className="text-lg font-black text-gray-400">$</span>}
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={d.mode === 'flat' ? 10000 : 100}
                        step={d.mode === 'flat' ? 0.01 : 0.1}
                        disabled={!canEdit}
                        value={d.mode === 'flat' ? d.amount : d.percent}
                        onChange={(e) => patch(d.level, d.mode === 'flat' ? { amount: e.target.value } : { percent: e.target.value })}
                        aria-label={`Level ${d.level} ${d.mode === 'flat' ? 'amount in dollars' : 'percentage'}`}
                        className="w-full bg-transparent py-2.5 px-1.5 text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums focus:outline-none disabled:cursor-not-allowed"
                      />
                      {d.mode === 'percent' && <span className="text-lg font-black text-gray-400">%</span>}
                    </div>
                    {err && dirty && <p className="text-[11px] font-semibold text-red-600 mt-1">{err}</p>}
                  </div>

                  <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{preview(d)}</p>
                  {dirty && (
                    <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full bg-[#168BFF] text-white text-[9px] font-black uppercase tracking-wider">
                      Edited
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gray-50/60 dark:bg-white/[0.02]">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-600 dark:text-gray-300">Qualifies when:</span>
              {data?.qualification.require_email_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                  <MailCheck className="w-3 h-3" /> email verified
                </span>
              )}
              {data?.qualification.require_first_task_approved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                  <ClipboardCheck className="w-3 h-3" /> first task approved
                </span>
              )}
            </div>

            {canEdit ? (
              <div className="flex items-center gap-2">
                {msg && (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
                    {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
                  </span>
                )}
                <button
                  type="button"
                  disabled={!changed.length || saving}
                  onClick={() => {
                    setDrafts(saved);
                    setMsg(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  type="button"
                  disabled={!changed.length || hasErrors || saving}
                  onClick={() => void save()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#07182F] hover:bg-[#0D2342] text-white text-xs font-bold disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save commissions{changed.length ? ` (${changed.length})` : ''}
                </button>
              </div>
            ) : (
              user?.role === 'superadmin' && (
                <Link to="/admin/permissions" className="text-xs font-bold text-[#168BFF] hover:underline">
                  Manage access
                </Link>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
};
