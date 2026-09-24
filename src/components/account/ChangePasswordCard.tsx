import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, Check, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { profileApi, getApiError } from '../../api';

/** Mirrors the API's StrongPassword rule so users see progress as they type. */
const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: 'At least 10 characters', test: (v) => v.length >= 10 },
  { label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'A number', test: (v) => /[0-9]/.test(v) },
  { label: 'A symbol (e.g. !@#$)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const inputClass =
  'w-full pl-4 pr-11 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]';

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  error?: string | null;
}> = ({ label, value, onChange, autoComplete, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={128}
          className={`${inputClass} ${error ? 'border-red-400' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Change password (PUT /profile/password). Other devices are signed out on
 * success; this session stays signed in.
 */
export const ChangePasswordCard: React.FC = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passed = RULES.map((r) => r.test(next));
  const strong = passed.every(Boolean);
  const matches = confirm.length > 0 && confirm === next;
  const canSubmit = current.length > 0 && strong && matches && next !== current && !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setMsg(null);
    setFieldErrors({});
    try {
      const res = await profileApi.updatePassword({ current_password: current, password: next, password_confirmation: confirm });
      if (res.success) {
        setMsg({ ok: true, text: res.message || 'Password updated.' });
        setCurrent('');
        setNext('');
        setConfirm('');
      } else {
        setMsg({ ok: false, text: res.message || 'Could not update your password.' });
      }
    } catch (err) {
      const errors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors ?? {};
      setFieldErrors(Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]])));
      setMsg({ ok: false, text: getApiError(err, 'Could not update your password.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <span className="text-sm font-black text-gray-900 dark:text-gray-100 block">Change password</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            You'll stay signed in here; other devices will be signed out.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PasswordField
          label="Current password"
          value={current}
          onChange={(v) => {
            setCurrent(v);
            setFieldErrors((f) => ({ ...f, current_password: '' }));
          }}
          autoComplete="current-password"
          error={fieldErrors.current_password}
        />
        <PasswordField label="New password" value={next} onChange={setNext} autoComplete="new-password" error={fieldErrors.password} />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={confirm.length > 0 && !matches ? 'Passwords do not match' : null}
        />
      </div>

      {/* Live policy checklist */}
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-1.5">
        {RULES.map((r, i) => (
          <li
            key={r.label}
            className={`flex items-center gap-1.5 text-[11px] font-semibold ${
              passed[i] ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                passed[i] ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-gray-200 dark:bg-white/10'
              }`}
            >
              {passed[i] && <Check className="w-3 h-3" />}
            </span>
            {r.label}
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="min-h-[1rem]">
          {msg ? (
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
              {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
            </p>
          ) : (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Signed up with Google and never set a password?{' '}
              <Link to="/forgot-password" className="font-bold text-[#168BFF] hover:underline">
                Set one by email
              </Link>
              .
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1277dc] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
};
