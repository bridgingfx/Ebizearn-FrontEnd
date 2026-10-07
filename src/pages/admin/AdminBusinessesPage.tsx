import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, AlertCircle, Ban, CheckCircle2, Plus, Eye, Pencil, LogIn, ShieldCheck, ShieldAlert } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { CreateBusinessUserModal } from '../../components/admin/CreateBusinessUserModal';
import { BusinessDetailDrawer } from '../../components/admin/BusinessDetailDrawer';
import { EditBusinessModal } from '../../components/admin/EditBusinessModal';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/can';
import { toast } from '../../utils/toast';

/**
 * Business accounts. Served live from GET /admin/users?role=business, so
 * this directory is built on the user list. Suspend/reactivate uses the
 * standard user-status endpoint. "Create business account" (POST
 * /admin/businesses, create_business_users) adds a ready-to-sign-in owner.
 */
export const AdminBusinessesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const { user } = useAuth();
  const canCreate = can(user, 'create_business_users');

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

  const handleLoginAs = async (u: User) => {
    if (!confirm(`Log in as ${u.business?.company_name || u.name}? Your admin session will be replaced.`)) return;
    try {
      const res = await adminApi.impersonate(u.id);
      if (res.success && res.data?.token) {
        localStorage.setItem('ebizearn_token', res.data.token);
        localStorage.setItem('ebizearn_active_role', 'business');
        window.location.href = '/business';
      } else {
        toast.error(res.message || 'Could not log in as this business.');
      }
    } catch (e) {
      const msg = getApiError(e, '');
      // The impersonation endpoint lives in the backend update waiting for deployment.
      if (msg.includes('404') || msg.includes('not found') || msg.includes('Server Error') || !msg) {
        toast.error('Login-as needs the backend update — ask Kailash to deploy the latest backend. The button will work after that.');
      } else {
        toast.error(msg);
      }
    }
  };

  const handlePauseAll = async (u: User) => {
    if (!confirm(`Pause ALL active campaigns for ${u.business?.company_name || u.name}?`)) return;
    try {
      const res = await adminApi.staffCampaigns({ business_id: u.id, status: 'active' });
      const campaigns = res.success ? (res.data || []) : [];
      let paused = 0;
      for (const c of campaigns) {
        try {
          const r = await adminApi.updateStaffCampaignStatus(c.id, 'paused');
          if (r.success) paused++;
        } catch { /* continue */ }
      }
      toast.success(`Paused ${paused} campaign${paused === 1 ? '' : 's'}.`);
      setViewId(null);
    } catch (e) {
      toast.error(getApiError(e, 'Could not pause campaigns.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Businesses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Business accounts on the platform — {users.length} total. Campaign management stays with each
            business's own portal; this view is for account oversight.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Create business account
          </button>
        )}
      </div>

      {showCreate && (
        <CreateBusinessUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => {
            setUsers((prev) => [u, ...prev]);
            toast.success(`Business account created for ${u.email}.`);
          }}
        />
      )}

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
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">
                {u.business?.industry ? `${u.business.industry} · ` : ''}
                joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
              </p>
              {/* KYC badge */}
              <div className="mb-3">
                {(() => {
                  const ks = (u as unknown as { kyc_status?: string }).kyc_status || 'not submitted';
                  return (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ks === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : ks === 'pending' || ks === 'under_review' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                    }`}>
                      {ks === 'approved' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      KYC: {ks.replace(/_/g, ' ')}
                    </span>
                  );
                })()}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setViewId(u.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                {u.status === 'suspended' ? (
                  <button
                    type="button"
                    disabled={actionId === u.id}
                    onClick={() => void handleStatus(u, 'active')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionId === u.id}
                    onClick={() => void handleStatus(u, 'suspended')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-bold transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewId !== null && (
        <BusinessDetailDrawer
          userId={viewId}
          onClose={() => setViewId(null)}
          onEdit={(u) => { setViewId(null); setEditUser(u); }}
          onLoginAs={handleLoginAs}
          onPauseAll={handlePauseAll}
          onStatusChange={() => void load()}
        />
      )}

      {editUser && (
        <EditBusinessModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditUser(null);
            toast.success('Business updated.');
          }}
        />
      )}
    </div>
  );
};
