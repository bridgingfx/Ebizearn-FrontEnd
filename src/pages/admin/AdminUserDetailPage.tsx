import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Ban,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Wallet,
  Clock,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Headset,
  Gift,
  ClipboardCheck,
  KeyRound,
  Building2,
  Globe,
  ScrollText,
  Pencil,
} from 'lucide-react';
import { adminApi, staffKycApi, getApiError } from '../../api';
import { toast } from '../../utils/toast';
import type { AdminUserDetail, KycDocumentSide, KycDocumentType, KycStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CountrySelect } from '../../components/auth/CountrySelect';
import { UserPermissionOverrides } from '../../components/admin/UserPermissionOverrides';
import { TICKET_STATUS_LABELS, TICKET_STATUS_STYLES, formatTicketTime } from '../../utils/supportTickets';
import { auditPage, humanizeAction } from '../../utils/auditLabels';
import { ContributorLevelControl } from '../../components/admin/ContributorLevelControl';

const DOC_LABELS: Record<KycDocumentType, string> = {
  emirates_id: 'National ID',
  passport: 'Passport',
  national_id: 'National ID',
};
const SIDE_LABELS: Record<KycDocumentSide, string> = { front: 'Front side', back: 'Back side', selfie: 'Selfie with ID' };

const KYC_STYLES: Record<KycStatus, string> = {
  unverified: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
  pending: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
  verified: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  suspended: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
  pending_verification: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

const money = (cents?: number | null, currency = 'USD') =>
  `${currency} ${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : '—');

const Card: React.FC<{ title: string; icon: React.ElementType; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  icon: Icon,
  action,
  children,
  className = '',
}) => (
  <section className={`bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs ${className}`}>
    <header className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
      <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#168BFF] dark:text-blue-300" /> {title}
      </h2>
      {action}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</dt>
    <dd className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5 break-words">{value ?? '—'}</dd>
  </div>
);

/** Inline phone editor for admin/super admin. */
const EditablePhoneField: React.FC<{ userId: number | string; currentPhone: string; onSaved: (phone: string) => void }> = ({ userId, currentPhone, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentPhone);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(currentPhone), [currentPhone]);

  const save = async () => {
    const v = value.trim();
    if (v && !/^[+\d][\d\s\-()]{3,24}$/.test(v)) {
      toast.error('Enter a valid phone number with country code.');
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.updateUser(userId, { phone: v || '' });
      if (res.success) {
        onSaved(v);
        setEditing(false);
        toast.success('Phone number updated.');
      } else {
        toast.error(res.message || 'Could not update phone.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update phone.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Phone</dt>
      <dd className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="tel"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="+971501234567"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs outline-none focus:border-[#168BFF]"
            />
            <button type="button" onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" title="Save">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={() => { setEditing(false); setValue(currentPhone); }} className="p-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-300" title="Cancel">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            {currentPhone || '—'}
            <button type="button" onClick={() => setEditing(true)} className="p-1 rounded-md text-[#168BFF] hover:bg-[#168BFF]/10" title="Edit phone">
              <Pencil className="w-3 h-3" />
            </button>
          </span>
        )}
      </dd>
    </div>
  );
};

/** Inline country editor for admin/super admin. */
const EditableCountryField: React.FC<{ userId: number | string; currentCountry: string; onSaved: (cc: string) => void }> = ({ userId, currentCountry, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentCountry);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(currentCountry), [currentCountry]);

  const save = async () => {
    const v = value.trim().toUpperCase();
    if (v && !/^[A-Z]{2}$/.test(v)) {
      toast.error('Select a valid country.');
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.updateUser(userId, { country_code: v });
      if (res.success) {
        onSaved(v);
        setEditing(false);
        toast.success('Country updated. Task matching will use the new country.');
      } else {
        toast.error(res.message || 'Could not update country.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update country.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Country</dt>
      <dd className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0">
              <CountrySelect id="admin-user-country" value={value} onChange={setValue} />
            </div>
            <button type="button" onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 shrink-0" title="Save">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={() => { setEditing(false); setValue(currentCountry); }} className="p-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-300 shrink-0" title="Cancel">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            {currentCountry || '—'}
            <button type="button" onClick={() => setEditing(true)} className="p-1 rounded-md text-[#168BFF] hover:bg-[#168BFF]/10" title="Edit country">
              <Pencil className="w-3 h-3" />
            </button>
          </span>
        )}
      </dd>
    </div>
  );
};

/** Inline email editor for admin/super admin (genuine requests via ticket). */
const EditableEmailField: React.FC<{ userId: number | string; currentEmail: string; onSaved: (email: string) => void }> = ({ userId, currentEmail, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentEmail);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(currentEmail), [currentEmail]);

  const save = async () => {
    const v = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (!confirm(`Change this user's login email to ${v}?\n\nOnly do this for genuine requests (e.g. via support ticket).`)) return;
    setSaving(true);
    try {
      const res = await adminApi.updateUser(userId, { email: v });
      if (res.success) {
        onSaved(v);
        setEditing(false);
        toast.success('Email updated.');
      } else {
        toast.error(res.message || 'Could not update email.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update email.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Email</dt>
      <dd className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5 break-words">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs outline-none focus:border-[#168BFF]"
            />
            <button type="button" onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" title="Save">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={() => { setEditing(false); setValue(currentEmail); }} className="p-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-300" title="Cancel">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            {currentEmail}
            <button type="button" onClick={() => setEditing(true)} className="p-1 rounded-md text-[#168BFF] hover:bg-[#168BFF]/10" title="Edit email (genuine requests only)">
              <Pencil className="w-3 h-3" />
            </button>
          </span>
        )}
      </dd>
    </div>
  );
};

/** Admin → Users → View: every detail about one account on a single page. */
export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const isSuper = me?.role === 'superadmin';
  const canReviewKyc = isSuper || (me?.permissions?.includes('review_kyc') ?? true);

  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [docs, setDocs] = useState<{ side: KycDocumentSide; url: string; isPdf: boolean }[]>([]);
  const [docsState, setDocsState] = useState<'idle' | 'loading' | 'denied'>('idle');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.userDetail(id);
      if (res.success) setData(res.data);
      else setError(res.message || 'Could not load this user.');
    } catch (e) {
      setError(getApiError(e, 'Could not load this user.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Private KYC documents → object URLs (revoked on change / unmount).
  const profile = data?.user.profile;
  const docSides = (profile?.kyc_documents ?? []).join(',');
  useEffect(() => {
    if (!data || !docSides || !canReviewKyc) return;
    let alive = true;
    const created: string[] = [];
    setDocsState('loading');
    (async () => {
      const out: { side: KycDocumentSide; url: string; isPdf: boolean }[] = [];
      for (const side of docSides.split(',') as KycDocumentSide[]) {
        try {
          const blob = await staffKycApi.document(data.user.id, side);
          const url = URL.createObjectURL(blob);
          created.push(url);
          out.push({ side, url, isPdf: blob.type === 'application/pdf' });
        } catch (e) {
          if ((e as { response?: { status?: number } })?.response?.status === 403) {
            if (alive) setDocsState('denied');
            return;
          }
        }
      }
      if (alive) {
        setDocs(out);
        setDocsState('idle');
      }
    })();
    return () => {
      alive = false;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [data?.user.id, docSides, profile?.kyc_submitted_at, canReviewKyc]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (status: 'active' | 'suspended') => {
    if (!data) return;
    setBusy(true);
    setActionMsg(null);
    try {
      const res = await adminApi.updateUserStatus(data.user.id, status);
      if (res.success) {
        setData({ ...data, user: { ...data.user, status: res.data.status } });
        setActionMsg({ ok: true, text: status === 'active' ? 'Account reactivated.' : 'Account suspended.' });
      } else {
        setActionMsg({ ok: false, text: res.message || 'Could not update status.' });
      }
    } catch (e) {
      setActionMsg({ ok: false, text: getApiError(e, 'Could not update status.') });
    } finally {
      setBusy(false);
    }
  };

  const decideKyc = async (decision: 'approve' | 'reject') => {
    if (!data) return;
    if (decision === 'reject' && !reason.trim()) {
      setActionMsg({ ok: false, text: 'Give the user a reason so they can fix and resubmit.' });
      return;
    }
    setBusy(true);
    setActionMsg(null);
    try {
      const res = await staffKycApi.decide(data.user.id, decision, decision === 'reject' ? reason.trim() : undefined);
      if (res.success) {
        setReason('');
        setActionMsg({ ok: true, text: decision === 'approve' ? 'KYC approved.' : 'KYC rejected.' });
        void load();
      } else {
        setActionMsg({ ok: false, text: res.message || 'Could not record the decision.' });
      }
    } catch (e) {
      setActionMsg({ ok: false, text: getApiError(e, 'Could not record the decision.') });
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-gray-400 dark:text-gray-500">
        <Loader2 className="w-7 h-7 animate-spin inline-block" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-5 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error || 'User not found.'}
        </div>
      </div>
    );
  }

  const { user, stats, withdrawals, tickets, audit, permissions } = data;
  const wallet = user.wallet;
  const kycStatus: KycStatus = profile?.kyc_status ?? 'unverified';
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      {/* Identity header */}
      <section className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#07182F] via-[#0D2342] to-[#168BFF]" />
        <div className="px-6 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Only the avatar overlaps the banner; the name sits below it. */}
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="-mt-10 w-20 h-20 shrink-0 rounded-2xl object-cover ring-4 ring-white dark:ring-[#0C1322] bg-white dark:bg-[#0C1322]" />
            ) : (
              <div className="-mt-10 w-20 h-20 shrink-0 rounded-2xl bg-[#0E1C2F] text-white text-2xl font-black flex items-center justify-center ring-4 ring-white dark:ring-[#0C1322]">
                {initials}
              </div>
            )}
            <div className="min-w-0 pt-3">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 truncate">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                  {user.role}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[user.status] ?? STATUS_STYLES.pending_verification}`}>
                  {user.status.replace(/_/g, ' ')}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${KYC_STYLES[kycStatus]}`}>
                  KYC {kycStatus}
                </span>
                {profile?.contributor_level && user.role === 'contributor' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {profile.contributor_level}
                  </span>
                )}
              </div>
            </div>
          </div>
          {user.role !== 'superadmin' && (
            <div className="flex flex-col items-start md:items-end gap-1.5 md:pt-3">
              {user.status !== 'suspended' ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void setStatus('suspended')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-bold disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" /> Suspend account
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void setStatus('active')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Reactivate account
                </button>
              )}
            </div>
          )}
        </div>
        {actionMsg && (
          <p
            role="status"
            className={`mx-6 mb-5 -mt-2 text-xs font-semibold flex items-center gap-1.5 ${actionMsg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}
          >
            {actionMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {actionMsg.text}
          </p>
        )}
      </section>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Available balance', value: money(wallet?.available_balance_cents, wallet?.currency), icon: Wallet },
          { label: 'Pending balance', value: money(wallet?.pending_balance_cents, wallet?.currency), icon: Clock },
          { label: 'Lifetime earnings', value: money(wallet?.lifetime_earnings_cents, wallet?.currency), icon: TrendingUp },
          { label: 'Total withdrawn', value: money(wallet?.total_withdrawn_cents, wallet?.currency), icon: ArrowUpRight },
          { label: 'Task submissions', value: stats.submissions_total, icon: ClipboardCheck },
          { label: 'Approved submissions', value: stats.submissions.approved ?? 0, icon: CheckCircle2 },
          { label: 'Referrals', value: stats.referrals, icon: Gift },
          { label: 'Open tickets', value: stats.tickets_open, icon: Headset },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs">
            <s.icon className="w-4 h-4 text-[#168BFF] dark:text-blue-300" />
            <p className="mt-2 text-base font-black text-gray-900 dark:text-gray-100 truncate">{s.value}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Account & profile */}
          <Card title="Account & profile" icon={FileText}>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
              <EditableEmailField userId={user.id} currentEmail={user.email} onSaved={(e) => setData(data ? { ...data, user: { ...data.user, email: e } } : data)} />
              <Field label="Email verified" value={user.email_verified_at ? dateTime(user.email_verified_at) : 'Not verified'} />
              <EditablePhoneField userId={user.id} currentPhone={user.phone || profile?.phone || ''} onSaved={(p) => setData(data ? { ...data, user: { ...data.user, phone: p } } : data)} />
              <EditableCountryField userId={user.id} currentCountry={profile?.country_code || ''} onSaved={(cc) => { if (data && data.user.profile) { data.user.profile.country_code = cc; setData({ ...data }); } }} />
              <Field label="City" value={profile?.city ? <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {profile.city}</span> : '—'} />
              <Field label="Language" value={profile?.language?.toUpperCase()} />
              <Field label="Joined" value={<span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {dateTime(user.created_at)}</span>} />
              <Field label="Referral code" value={user.referral_code ? <span className="font-mono">{user.referral_code}</span> : '—'} />
              <Field
                label="Referred by"
                value={user.referrer ? <Link to={`/admin/users/${user.referrer.id}`} className="text-[#168BFF] dark:text-blue-300 hover:underline">{user.referrer.name}</Link> : '—'}
              />
              {user.role === 'contributor' && (
                <>
                  <Field label="Approval rate" value={profile ? `${profile.approval_rate}%` : '—'} />
                  <Field label="Completed tasks" value={profile?.completed_tasks_count ?? 0} />
                  <Field label="Fraud score" value={profile ? `${profile.fraud_score} / 100` : '—'} />
                  {profile && (
                    <div className="col-span-2 md:col-span-3">
                      <ContributorLevelControl
                        key={`${profile.contributor_level}-${profile.level_locked ? 1 : 0}`}
                        userId={user.id}
                        level={profile.contributor_level ?? 'starter'}
                        locked={!!profile.level_locked}
                        onSaved={(level, locked) => {
                          if (data && data.user.profile) {
                            data.user.profile.contributor_level = level as typeof profile.contributor_level;
                            data.user.profile.level_locked = locked;
                            setData({ ...data });
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              )}
              <div className="col-span-2 md:col-span-3">
                <Field label="Bio" value={profile?.bio || '—'} />
              </div>
            </dl>
          </Card>

          {user.business && (
            <Card title="Business" icon={Building2}>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Company" value={user.business.company_name} />
                <Field label="Industry" value={user.business.industry} />
                <Field label="Website" value={user.business.website} />
                <Field label="Billing email" value={user.business.billing_email} />
                <Field label="Status" value={user.business.status} />
                <Field label="Verified" value={dateTime(user.business.verified_at)} />
              </dl>
            </Card>
          )}

          {/* KYC */}
          <Card
            title="KYC verification"
            icon={ShieldCheck}
            action={
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${KYC_STYLES[kycStatus]}`}>{kycStatus}</span>
            }
          >
            {kycStatus === 'unverified' && !profile?.kyc_submitted_at ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">This user hasn't submitted identity documents yet.</p>
            ) : (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Document" value={profile?.kyc_document_type ? DOC_LABELS[profile.kyc_document_type] : '—'} />
                  <Field label="Submitted" value={dateTime(profile?.kyc_submitted_at)} />
                  <Field label="Verified" value={dateTime(profile?.kyc_verified_at)} />
                  <Field label="Files" value={(profile?.kyc_documents ?? []).map((s) => SIDE_LABELS[s]).join(', ') || '—'} />
                </dl>
                {kycStatus === 'rejected' && profile?.kyc_rejection_reason && (
                  <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                    Rejection reason: {profile.kyc_rejection_reason}
                  </p>
                )}

                {docsState === 'denied' || !canReviewKyc ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">You don't have permission to view KYC documents.</p>
                ) : docsState === 'loading' ? (
                  <div className="py-6 text-center text-gray-400 dark:text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {docs.map((d) => (
                      <figure key={d.side} className="space-y-1.5">
                        <figcaption className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{SIDE_LABELS[d.side]}</figcaption>
                        {d.isPdf ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="h-44 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-bold text-[#168BFF] dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <FileText className="w-7 h-7" /> Open PDF
                          </a>
                        ) : (
                          <a href={d.url} target="_blank" rel="noreferrer" title="Open full size">
                            <img
                              src={d.url}
                              alt={SIDE_LABELS[d.side]}
                              className="h-44 w-full object-cover rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:opacity-90"
                            />
                          </a>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {kycStatus === 'pending' && canReviewKyc && docsState !== 'denied' && (
                  <div className="pt-2 space-y-2">
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={500}
                      placeholder="Rejection reason shown to the user (required to reject)"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void decideKyc('reject')}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-bold disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void decideKyc('approve')}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16B364] hover:bg-[#12995a] text-white text-xs font-bold disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Withdrawals */}
          <Card title="Recent withdrawals" icon={ArrowUpRight} action={<Link to="/admin/withdrawals" className="text-[11px] font-bold text-[#168BFF] dark:text-blue-300 hover:underline">All withdrawals</Link>}>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No withdrawal requests.</p>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                      <th className="py-2 px-5 font-bold">Amount</th>
                      <th className="py-2 px-5 font-bold">Method</th>
                      <th className="py-2 px-5 font-bold">Status</th>
                      <th className="py-2 px-5 font-bold text-right">Requested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="py-2.5 px-5 font-bold text-gray-900 dark:text-gray-100">{money(w.amount_cents, w.currency)}</td>
                        <td className="py-2.5 px-5 text-gray-600 dark:text-gray-400 capitalize">{w.payout_method?.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-5 capitalize text-gray-700 dark:text-gray-300">{w.status.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-5 text-right text-gray-500 dark:text-gray-400">{dateTime(w.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Permissions */}
          <Card title="Permissions" icon={KeyRound}>
            {isSuper ? (
              <UserPermissionOverrides userId={user.id} onSaved={() => void load()} />
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Effective permissions (role + overrides). Only Super Admin can change them.</p>
                <div className="flex flex-wrap gap-1.5">
                  {permissions.effective.length === 0 ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                  ) : (
                    permissions.effective.map((p) => (
                      <span
                        key={p}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg ${
                          permissions.grants.includes(p)
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-[#168BFF]'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {p}
                      </span>
                    ))
                  )}
                  {permissions.denies.map((p) => (
                    <span key={p} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 line-through">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Tickets */}
          <Card title="Support tickets" icon={Headset} action={<Link to="/admin/support" className="text-[11px] font-bold text-[#168BFF] dark:text-blue-300 hover:underline">Support desk</Link>}>
            {tickets.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No tickets.</p>
            ) : (
              <ul className="space-y-2">
                {tickets.map((t) => (
                  <li key={t.uuid} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{t.subject}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500"><span className="font-mono">{t.reference}</span> · {formatTicketTime(t.updated_at)}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${TICKET_STATUS_STYLES[t.status]}`}>
                      {TICKET_STATUS_LABELS[t.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Activity */}
          <Card title="Recent activity" icon={ScrollText} action={<Link to="/admin/audit" className="text-[11px] font-bold text-[#168BFF] dark:text-blue-300 hover:underline">Audit log</Link>}>
            {audit.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No recorded activity.</p>
            ) : (
              <ol className="relative border-l border-gray-200 dark:border-white/10 ml-1.5 space-y-3">
                {audit.map((a) => (
                  <li key={a.id} className="pl-4">
                    <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-[#168BFF] ring-2 ring-white dark:ring-[#0C1322]" />
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{humanizeAction(a.action)}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {auditPage(a).label} · by {a.actor?.name ?? 'System'} · {dateTime(a.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
