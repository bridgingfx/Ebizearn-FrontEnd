import React, { useEffect, useState } from 'react';
import { X, Building2, Mail, Globe, Phone, MapPin, ShieldCheck, ShieldAlert, Wallet, Activity, Pencil, PauseCircle, LogIn, Loader2 } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';
import { toast } from '../../utils/toast';

interface BusinessDetail {
  user: User;
  kyc?: { status?: string } | null;
  wallet?: { available_balance_cents?: number; pending_balance_cents?: number } | null;
  recent_logs?: Array<{ id: number; action: string; created_at: string; description?: string }>;
}

interface Props {
  userId: number | null;
  onClose: () => void;
  onEdit: (user: User) => void;
  onLoginAs: (user: User) => void;
  onPauseAll: (user: User) => void;
  onStatusChange: () => void;
}

export const BusinessDetailDrawer: React.FC<Props> = ({ userId, onClose, onEdit, onLoginAs, onPauseAll, onStatusChange }) => {
  const [detail, setDetail] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await adminApi.userDetail(userId);
        if (res.success) setDetail(res.data as BusinessDetail);
      } catch (e) {
        toast.error(getApiError(e, 'Could not load business details.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (!userId) return null;
  const u = detail?.user;
  const kycStatus = (detail?.kyc as { status?: string } | undefined)?.status || u?.kyc_status || 'not_submitted';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0C1322] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#0C1322] border-b border-gray-100 dark:border-white/10 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Business details</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
          </div>
        )}

        {u && !loading && (
          <div className="p-5 space-y-5">
            {/* Company header */}
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{u.business?.company_name || u.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.business?.industry || '—'}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  u.status === 'suspended' ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {u.status}
                </span>
              </div>
            </div>

            {/* KYC */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  {kycStatus === 'approved' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                  KYC verification
                </h4>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : kycStatus === 'pending' || kycStatus === 'under_review' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                }`}>
                  {kycStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {kycStatus === 'approved'
                  ? 'KYC approved — this business can post campaigns.'
                  : 'KYC is required before this business can launch campaigns. Review documents under Staff → KYC.'}
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact</h4>
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200"><Mail className="w-3.5 h-3.5 text-gray-400" />{u.email}</div>
              {u.business?.website && <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200"><Globe className="w-3.5 h-3.5 text-gray-400" />{u.business.website}</div>}
              {u.business?.phone && <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200"><Phone className="w-3.5 h-3.5 text-gray-400" />{u.business.phone}</div>}
              {u.business?.address && <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200"><MapPin className="w-3.5 h-3.5 text-gray-400" />{u.business.address}</div>}
            </div>

            {/* Wallet */}
            {detail?.wallet && (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                  <Wallet className="w-3.5 h-3.5" /> Wallet
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Available</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">${((detail.wallet.available_balance_cents ?? 0) / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">In escrow</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">${((detail.wallet.pending_balance_cents ?? 0) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onEdit(u)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => onLoginAs(u)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 text-xs font-bold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Login as
              </button>
              <button
                type="button"
                onClick={() => onPauseAll(u)}
                className="col-span-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-bold transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Pause all active campaigns
              </button>
            </div>

            {/* Activity */}
            {detail?.recent_logs && detail.recent_logs.length > 0 && (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2.5">
                  <Activity className="w-3.5 h-3.5" /> Recent activity
                </h4>
                <div className="space-y-2">
                  {detail.recent_logs.slice(0, 8).map((log) => (
                    <div key={log.id} className="text-xs">
                      <p className="font-bold text-gray-800 dark:text-gray-200">{log.action}</p>
                      <p className="text-gray-400 dark:text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
