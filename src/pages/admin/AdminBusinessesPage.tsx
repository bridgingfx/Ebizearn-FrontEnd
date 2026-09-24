import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, AlertCircle, Ban, CheckCircle2 } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Business accounts. Served live from GET /admin/users?role=business — the
 * backend has no dedicated admin-businesses endpoint, so this directory is
 * built on the user list. Suspend/reactivate uses the standard user-status
 * endpoint.
 */
export const AdminBusinessesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.users({ role: 'business' });
      if (res.success) {
        setUsers(res.data || []);
      } else {
        setError(res.message || 'Could not load business accounts.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load business accounts.'));
    } finally {
      setLoading(false);
    }
  }, []);

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
      } else {
        setActionError(res.message || 'Could not update account status.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not update account status.'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Businesses</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Business accounts on the platform — {users.length} total. Campaign management stays with each
          business's own portal; this view is for account oversight only.
        </p>
      </div>

      {actionError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3 text-xs font-bold text-red-700 dark:text-red-300">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading business accounts…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-300 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load business accounts</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No business accounts yet"
          description="Business accounts created on the platform will appear here."
        />
      )}

      {!loading && !error && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    u.status === 'suspended' ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {u.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{u.business?.company_name || u.name}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{u.email}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">
                {u.business?.industry ? `${u.business.industry} · ` : ''}
                joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
              </p>
              {u.status === 'suspended' ? (
                <button
                  type="button"
                  disabled={actionId === u.id}
                  onClick={() => void handleStatus(u, 'active')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 dark:bg-emerald-500/15 disabled:opacity-50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionId === u.id}
                  onClick={() => void handleStatus(u, 'suspended')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 dark:bg-red-500/15 disabled:opacity-50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-bold transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" /> Suspend
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
