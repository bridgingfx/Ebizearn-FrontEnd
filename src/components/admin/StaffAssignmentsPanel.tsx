import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Search, Users, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi, opsApi, getApiError } from '../../api';
import type { StaffAssignments } from '../../api/ops';
import type { User } from '../../types';

type Row = StaffAssignments['users'][number];

/**
 * Super Admin: assign contributors / businesses (and, for admins,
 * moderators) to a staff account. A staff account with assigned users only
 * sees and manages those users; with none it keeps full access.
 */
export const StaffAssignmentsPanel: React.FC<{ staffId: number }> = ({ staffId }) => {
  const [data, setData] = useState<StaffAssignments | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    opsApi
      .staffAssignments(staffId)
      .then((res) => {
        if (!alive) return;
        setData(res.data);
        setRows(res.data.users);
      })
      .catch((e) => alive && setMsg({ ok: false, text: getApiError(e, 'Could not load assignments.') }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [staffId]);

  // Debounced search for users to add (only roles this staff role may manage).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !data) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await adminApi.users({ search: q });
        const taken = new Set(rows.map((r) => r.id));
        setResults((res.data || []).filter((u) => data.assignable_roles.includes(u.role) && !taken.has(u.id)).slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, data, rows]);

  const dirty = useMemo(() => {
    const saved = new Set((data?.users ?? []).map((u) => u.id));
    return saved.size !== rows.length || rows.some((r) => !saved.has(r.id));
  }, [data, rows]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await opsApi.updateStaffAssignments(staffId, rows.map((r) => r.id));
      if (res.success) {
        setData(res.data);
        setRows(res.data.users);
        setMsg({ ok: true, text: res.message || 'Assignments saved.' });
      }
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not save assignments.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-gray-400 dark:text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin inline-block" />
      </div>
    );
  }
  if (!data) {
    return <p className="text-xs text-red-600 dark:text-red-400">{msg?.text ?? 'Could not load assignments.'}</p>;
  }

  return (
    <div className="rounded-2xl border border-[#168BFF]/20 bg-[#168BFF]/5 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Users className="w-4 h-4 text-[#168BFF] mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-black text-gray-900 dark:text-gray-100">Assigned users ({rows.length})</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {rows.length === 0
              ? `No users assigned — this ${data.staff.role} can see every user.`
              : `This ${data.staff.role} only sees and manages these users (and their KYC, withdrawals, deposits, wallets, tickets, campaigns and tasks).`}{' '}
            Can be assigned: {data.assignable_roles.join(', ')}.
          </p>
        </div>
      </div>

      {rows.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {rows.map((r) => (
            <li
              key={r.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 text-[11px]"
            >
              <span className="font-bold text-gray-900 dark:text-gray-100">{r.name}</span>
              <span className="text-gray-400 dark:text-gray-500 capitalize">{r.role}</span>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
                className="p-0.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                aria-label={`Remove ${r.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Add a user — search name or email…"
          className="w-full pl-9 pr-9 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
        />
        {searching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-2.5" />}
        {results.length > 0 && (
          <ul className="mt-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] divide-y divide-gray-100 dark:divide-white/10 overflow-hidden">
            {results.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => {
                    setRows((prev) => [...prev, { id: u.id, name: u.name, email: u.email, role: u.role, status: u.status ?? 'active' }]);
                    setQuery('');
                    setResults([]);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{u.name}</span>
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {u.email} · <span className="capitalize">{u.role}</span>
                    </span>
                  </span>
                  <Plus className="w-4 h-4 text-[#168BFF] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-h-[1rem]">
          {msg && (
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
              {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void save()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save assignments
        </button>
      </div>
    </div>
  );
};
