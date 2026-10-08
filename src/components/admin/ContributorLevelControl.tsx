import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Lock, Save } from 'lucide-react';
import { adminApi, getApiError } from '../../api';

const LEVELS = [
  { key: 'starter', label: 'Starter' },
  { key: 'explorer', label: 'Explorer' },
  { key: 'trusted', label: 'Trusted' },
  { key: 'pro', label: 'Pro' },
  { key: 'elite', label: 'Elite' },
];

/**
 * Staff: a contributor's level. By default it follows completed tasks (the
 * thresholds on the Contributor Ranks page); staff can set it by hand and
 * lock it so task completions no longer change it.
 */
export const ContributorLevelControl: React.FC<{
  userId: number;
  level: string;
  locked: boolean;
  onSaved: (level: string, locked: boolean) => void;
}> = ({ userId, level, locked, onSaved }) => {
  const [value, setValue] = useState(level || 'starter');
  const [lock, setLock] = useState(locked);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = value !== level || lock !== locked;

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await adminApi.setContributorLevel(userId, value, lock);
      if (res.success) {
        setValue(res.data.level);
        onSaved(res.data.level, res.data.locked);
        setMsg({ ok: true, text: res.message || 'Saved.' });
      }
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not change the level.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Level</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setLock(true); // choosing a level by hand locks it
          }}
          aria-label="Contributor level"
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold text-gray-900 dark:text-gray-100"
        >
          {LEVELS.map((l) => (
            <option key={l.key} value={l.key}>
              {l.label}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" className="accent-[#168BFF]" checked={lock} onChange={(e) => setLock(e.target.checked)} />
          <Lock className="w-3 h-3" /> Lock (completed tasks won't change it)
        </label>
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={() => void save()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-40"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        {lock ? 'Locked — set by staff.' : 'Follows completed tasks (Contributor Ranks thresholds). Unlocking recalculates it now.'}
      </p>
      {msg && (
        <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
        </p>
      )}
    </div>
  );
};
