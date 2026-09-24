import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  UserCog,
  Building2,
  UserRound,
  X,
} from 'lucide-react';
import { opsApi, adminApi, getApiError } from '../../api';
import type { PermissionDef, PermissionGroup, RolePermissions, User } from '../../types';
import { PageHeader } from '../../components/common/ui';
import { UserPermissionOverrides } from '../../components/admin/UserPermissionOverrides';
import { PERMISSION_GROUP_LABELS, RELEVANT_GROUPS } from '../../utils/permissionGroups';

const ROLE_META: Record<RolePermissions['name'], { icon: React.ElementType; blurb: string }> = {
  admin: { icon: ShieldCheck, blurb: 'Full staff accounts in the admin panel.' },
  moderator: { icon: UserCog, blurb: 'Review-focused staff: proofs, KYC, support.' },
  contributor: { icon: UserRound, blurb: 'People who complete tasks and earn.' },
  business: { icon: Building2, blurb: 'Brands that run and fund campaigns.' },
};

/**
 * Super Admin: Roles & Permissions.
 *  1. Role matrix — what each role (admin, moderator, contributor,
 *     business) may do by default. Enforced by the API on every route.
 *  2. User overrides — allow or deny a permission for one account.
 */
export const AdminPermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [catalog, setCatalog] = useState<PermissionDef[]>([]);
  const [active, setActive] = useState<RolePermissions['name']>('admin');
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // User override lookup
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await opsApi.roles();
      if (res.success) {
        setRoles(res.data.roles);
        setCatalog(res.data.permissions);
      } else {
        setError(res.message || 'Could not load permissions.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load permissions.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeRole = roles.find((r) => r.name === active);

  // Reset the draft whenever the selected role (or its saved state) changes.
  useEffect(() => {
    setDraft(new Set(activeRole?.permissions ?? []));
    setMsg(null);
  }, [activeRole]);

  const dirty = useMemo(() => {
    const saved = new Set(activeRole?.permissions ?? []);
    return saved.size !== draft.size || [...draft].some((p) => !saved.has(p));
  }, [draft, activeRole]);

  const grouped = useMemo(() => {
    const relevant = RELEVANT_GROUPS[active] ?? [];
    const map = new Map<PermissionGroup, PermissionDef[]>();
    catalog.forEach((p) => {
      if (!showAll && !relevant.includes(p.group)) return;
      map.set(p.group, [...(map.get(p.group) ?? []), p]);
    });
    return [...map.entries()].sort(([a], [b]) => (relevant.includes(a) ? 0 : 1) - (relevant.includes(b) ? 0 : 1));
  }, [catalog, active, showAll]);

  const toggle = (name: string) =>
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const setGroup = (perms: PermissionDef[], on: boolean) =>
    setDraft((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => (on ? next.add(p.name) : next.delete(p.name)));
      return next;
    });

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await opsApi.updateRole(active, [...draft]);
      if (res.success) {
        setRoles((prev) => prev.map((r) => (r.name === active ? { ...r, permissions: res.data.permissions } : r)));
        setMsg({ ok: true, text: res.message || 'Saved.' });
      } else {
        setMsg({ ok: false, text: res.message || 'Could not save.' });
      }
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not save.') });
    } finally {
      setSaving(false);
    }
  };

  // Debounced user search for overrides.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await adminApi.users({ search: q });
        setResults((res.data || []).filter((u) => u.role !== 'superadmin').slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Decide what each role can do across the platform, then fine-tune individual accounts. Every change is enforced by the API and recorded in the audit log."
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 dark:text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin inline-block" />
        </div>
      ) : (
        <>
          {/* Role cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {roles.map((r) => {
              const Meta = ROLE_META[r.name];
              const Icon = Meta?.icon ?? KeyRound;
              const on = active === r.name;
              return (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setActive(r.name)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    on
                      ? 'border-[#D4AF37] bg-[#0E1C2F] text-white shadow-lg'
                      : 'border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${on ? 'text-[#D4AF37]' : 'text-[#168BFF]'}`} />
                    <span className={`text-[10px] font-bold ${on ? 'text-white/70' : 'text-gray-400'}`}>
                      <Users className="w-3 h-3 inline -mt-0.5 mr-1" />
                      {r.users_count}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm font-black ${on ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{r.label}</p>
                  <p className={`text-[11px] ${on ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>{Meta?.blurb}</p>
                  <p className={`mt-2 text-[11px] font-bold ${on ? 'text-[#D4AF37]' : 'text-gray-600 dark:text-gray-300'}`}>
                    {r.permissions.length} permission{r.permissions.length === 1 ? '' : 's'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Matrix for the active role */}
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100">{activeRole?.label} permissions</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Applies to every {activeRole?.label.toLowerCase()} account unless overridden below.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
                Show permissions for other roles
              </label>
            </div>

            <div className="p-5 space-y-5">
              {grouped.map(([group, perms]) => {
                const allOn = perms.every((p) => draft.has(p.name));
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{PERMISSION_GROUP_LABELS[group]}</p>
                      <button
                        type="button"
                        onClick={() => setGroup(perms, !allOn)}
                        className="text-[11px] font-bold text-[#168BFF] dark:text-blue-300 hover:underline"
                      >
                        {allOn ? 'Turn all off' : 'Turn all on'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const on = draft.has(p.name);
                        return (
                          <button
                            key={p.name}
                            type="button"
                            role="switch"
                            aria-checked={on}
                            onClick={() => toggle(p.name)}
                            className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-left transition-colors ${
                              on
                                ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10'
                                : 'border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/5'
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">{p.label}</span>
                              <span className="block text-[10px] font-mono text-gray-400 dark:text-gray-500">{p.name}</span>
                            </span>
                            <span
                              className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${
                                on ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all${on ? 'left-[18px]' : 'left-0.5'}`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="min-h-[1rem]">
                {msg ? (
                  <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
                    {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
                  </p>
                ) : dirty ? (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Unsaved changes</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!dirty || saving}
                  onClick={() => setDraft(new Set(activeRole?.permissions ?? []))}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  type="button"
                  disabled={!dirty || saving}
                  onClick={() => void save()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#07182F] hover:bg-[#0D2342] text-white text-xs font-bold disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save {activeRole?.label} permissions
                </button>
              </div>
            </div>
          </div>

          {/* Per-user overrides */}
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Individual account overrides</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow or deny a single permission for one person — e.g. block withdrawals for an account under investigation.
              </p>
            </div>

            {picked ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="min-w-0">
                    <Link to={`/admin/users/${picked.id}`} className="text-sm font-bold text-gray-900 dark:text-gray-100 hover:underline">
                      {picked.name}
                    </Link>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {picked.email} · <span className="capitalize">{picked.role}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPicked(null)}
                    className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <UserPermissionOverrides key={picked.id} userId={picked.id} />
              </div>
            ) : (
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a user by name or email…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                />
                {searching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 dark:text-gray-500 absolute right-3 top-3" />}
                {results.length > 0 && (
                  <ul className="mt-2 rounded-2xl border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10 overflow-hidden">
                    {results.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPicked(u);
                            setQuery('');
                            setResults([]);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">{u.name}</span>
                          <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                            {u.email} · <span className="capitalize">{u.role}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
