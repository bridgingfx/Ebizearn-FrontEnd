import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Search, ShieldAlert, Ban, CheckCircle2, AlertCircle, Loader2, Eye } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * User directory. Everything comes from GET /admin/users (search + role
 * filters are server-side). Suspend/reactivate calls PATCH /admin/users/:id/status.
 * No invented KYC queues, no fake IPs, no "verified vault" claims. KYC approval
 * actions do not exist in the backend — this page notes that honestly.
 */
export const AdminUsersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { role?: string; search?: string } = {};
      if (role !== 'all') params.role = role;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await adminApi.users(Object.keys(params).length > 0 ? params : undefined);
      if (res.success) {
        setUsers(res.data || []);
      } else {
        setError(res.message || 'Could not load users.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }, [role, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatus = async (u: User, status: 'active' | 'suspended') => {
    setActionId(u.id);
    setActionError(null);
    try {
      const res = await adminApi.updateUserStatus(u.id, status);
      if (res.success && res.data) {
        setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, status: res.data.status } : p)));
        setSelected((s) => (s && s.id === u.id ? { ...s, status: res.data.status } : s));
      } else {
        setActionError(res.message || 'Could not update user status.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not update user status.'));
    } finally {
      setActionId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: users.length };
    for (const u of users) c[u.role] = (c[u.role] || 0) + 1;
    return c;
  }, [users]);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const roles = ['all', 'contributor', 'business', 'moderator', 'admin', 'superadmin'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Users & KYC</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Every user on the platform, served live. KYC approval actions need backend support that is not
          available yet — this page only suspends or reactivates accounts.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                role === r ? 'bg-[#07182F] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {r} {r === 'all' ? '' : `(${counts[r] || 0})`}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
          />
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold text-red-700">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading users…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load users</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            debouncedSearch || role !== 'all'
              ? 'Try a different search term or role filter.'
              : 'No users exist in the system yet.'
          }
        />
      )}

      {!loading && !error && users.length > 0 && (
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                  <th className="py-3 px-4 font-bold">User</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">KYC</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Joined</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{u.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {u.profile?.kyc_status ? u.profile.kyc_status.replace(/_/g, ' ') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle(u.status)}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelected(u)}
                          title="View details"
                          className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#168BFF] hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {u.status === 'suspended' ? (
                          <button
                            type="button"
                            disabled={actionId === u.id}
                            onClick={() => void handleStatus(u, 'active')}
                            title="Reactivate account"
                            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionId === u.id}
                            onClick={() => void handleStatus(u, 'suspended')}
                            title="Suspend account"
                            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal — real data only */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">{selected.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <dl className="text-sm space-y-2.5">
              {[
                ['Role', selected.role],
                ['Status', selected.status],
                ['KYC status', selected.profile?.kyc_status ? String(selected.profile.kyc_status).replace(/_/g, ' ') : '—'],
                ['Contributor level', selected.profile?.contributor_level || '—'],
                [
                  'Balance',
                  selected.wallet
                    ? `${selected.wallet.currency || 'USD'} ${((selected.wallet.available_balance_cents || 0) / 100).toFixed(2)}`
                    : '—',
                ],
                ['Joined', selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                  <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="font-bold text-gray-900 dark:text-gray-100 capitalize">{v}</dd>
                </div>
              ))}
            </dl>
            {selected.status !== 'suspended' ? (
              <button
                type="button"
                disabled={actionId === selected.id}
                onClick={() => void handleStatus(selected, 'suspended')}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors"
              >
                <Ban className="w-4 h-4" /> Suspend account
              </button>
            ) : (
              <button
                type="button"
                disabled={actionId === selected.id}
                onClick={() => void handleStatus(selected, 'active')}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Reactivate account
              </button>
            )}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                KYC document review actions need backend support that is not available yet. Only the KYC
                status reported by the user profile is shown here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
