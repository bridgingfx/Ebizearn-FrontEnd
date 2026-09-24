import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, RotateCcw, Save, Check, X as XIcon } from 'lucide-react';
import { opsApi, getApiError } from '../../api';
import type { PermissionDef, PermissionGroup, UserPermissionOverrides as Overrides } from '../../types';
import { PERMISSION_GROUP_LABELS, RELEVANT_GROUPS } from '../../utils/permissionGroups';

type Mode = 'inherit' | 'allow' | 'deny';

/**
 * Super Admin: per-user permission overrides on top of the user's role.
 * Each permission is Role default / Allow / Deny. Saved through
 * PUT /ops/users/:id/permissions.
 */
export const UserPermissionOverrides: React.FC<{ userId: number; onSaved?: () => void }> = ({ userId, onSaved }) => {
  const [data, setData] = useState<Overrides | null>(null);
  const [modes, setModes] = useState<Record<string, Mode>>({});
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const initialModes = (d: Overrides): Record<string, Mode> => {
    const m: Record<string, Mode> = {};
    d.permissions.forEach((p) => {
      m[p.name] = d.denies.includes(p.name) ? 'deny' : d.grants.includes(p.name) ? 'allow' : 'inherit';
    });
    return m;
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    opsApi
      .userPermissions(userId)
      .then((res) => {
        if (!alive) return;
        if (res.success) {
          setData(res.data);
          setModes(initialModes(res.data));
        } else {
          setMsg({ ok: false, text: res.message || 'Could not load permissions.' });
        }
      })
      .catch((e) => alive && setMsg({ ok: false, text: getApiError(e, 'Could not load permissions.') }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId]);

  const dirty = useMemo(() => {
    if (!data) return false;
    const base = initialModes(data);
    return Object.keys(modes).some((k) => modes[k] !== base[k]);
  }, [modes, data]);

  const groups = useMemo(() => {
    if (!data) return [] as [PermissionGroup, PermissionDef[]][];
    const relevant = RELEVANT_GROUPS[data.user.role] ?? [];
    const byGroup = new Map<PermissionGroup, PermissionDef[]>();
    data.permissions.forEach((p) => {
      if (!showAll && !relevant.includes(p.group)) return;
      byGroup.set(p.group, [...(byGroup.get(p.group) ?? []), p]);
    });
    return [...byGroup.entries()].sort(
      ([a], [b]) => (relevant.includes(a) ? 0 : 1) - (relevant.includes(b) ? 0 : 1)
    );
  }, [data, showAll]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMsg(null);
    const grants = Object.keys(modes).filter((k) => modes[k] === 'allow');
    const denies = Object.keys(modes).filter((k) => modes[k] === 'deny');
    try {
      const res = await opsApi.updateUserPermissions(userId, grants, denies);
      if (res.success) {
        setData(res.data);
        setModes(initialModes(res.data));
        setMsg({ ok: true, text: 'Permissions saved.' });
        onSaved?.();
      } else {
        setMsg({ ok: false, text: res.message || 'Could not save.' });
      }
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not save.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin inline-block" />
      </div>
    );
  }
  if (!data) {
    return <p className="text-xs text-red-600 dark:text-red-400">{msg?.text ?? 'Could not load permissions.'}</p>;
  }
  if (!data.editable) {
    return <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin holds every permission and can't be restricted.</p>;
  }

  return (
    // Container query: rows go side-by-side only when the panel itself is
    // wide (full page), and stack in narrow columns (user view sidebar).
    <div className="@container space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-md">
          <b>Role default</b> follows the <span className="capitalize">{data.user.role}</span> role. <b>Allow</b> or{' '}
          <b>Deny</b> overrides it for this account only.
        </p>
        <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show all permissions
        </label>
      </div>

      {groups.map(([group, perms]) => (
        <div key={group} className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{PERMISSION_GROUP_LABELS[group]}</p>
          <div className="divide-y divide-gray-100 dark:divide-white/10 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {perms.map((p) => {
              const mode = modes[p.name] ?? 'inherit';
              const roleHas = data.role_permissions.includes(p.name);
              const effective = mode === 'allow' ? true : mode === 'deny' ? false : roleHas;
              return (
                <div key={p.name} className="flex flex-col @lg:flex-row @lg:items-center justify-between gap-2 px-3.5 py-2.5 bg-white dark:bg-[#0C1322]">
                  <div className="min-w-0 flex items-start gap-2">
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        effective ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                      }`}
                      title={effective ? 'Currently allowed' : 'Currently not allowed'}
                    >
                      {effective ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{p.label}</p>
                      <p className="text-[10px] font-mono text-gray-400">{p.name}</p>
                    </div>
                  </div>
                  <div className="inline-flex rounded-xl bg-gray-100 dark:bg-white/10 p-0.5 text-[11px] font-bold shrink-0 self-start @lg:self-auto">
                    {(['inherit', 'allow', 'deny'] as Mode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setModes((prev) => ({ ...prev, [p.name]: m }))}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          mode === m
                            ? m === 'allow'
                              ? 'bg-emerald-500 text-white'
                              : m === 'deny'
                              ? 'bg-red-500 text-white'
                              : 'bg-white dark:bg-[#0C1322] text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {m === 'inherit' ? `Role default (${roleHas ? 'on' : 'off'})` : m === 'allow' ? 'Allow' : 'Deny'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="min-h-[1rem]">
          {msg && (
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
              {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => setModes(initialModes(data))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#07182F] hover:bg-[#0D2342] text-white text-xs font-bold disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save overrides
          </button>
        </div>
      </div>
    </div>
  );
};
