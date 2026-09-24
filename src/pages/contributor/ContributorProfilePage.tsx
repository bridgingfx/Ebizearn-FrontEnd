import React, { useEffect, useState } from 'react';
import {
  Loader2,
  Upload,
  FileCheck2,
  Clock,
  User,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  Award,
  CreditCard,
  Bell,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  KeyRound,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  InstagramLogo,
  TikTokLogo,
  YouTubeLogo,
  FacebookLogo,
  XTwitterLogo,
} from '../../components/common/PlatformIcons';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { AvatarUploadControl } from '../../components/common/AvatarUploadControl';
import { profileApi, getApiError } from '../../api';
import { COUNTRY_OPTIONS } from '../../config/geoLocations';
import type { KycDocumentType } from '../../types';

type ProfileTab = 'profile' | 'kyc' | 'socials' | 'payouts' | 'security';

const RESIDENCE_COUNTRIES = COUNTRY_OPTIONS.filter((c) => c.code !== 'GLOBAL');

const KYC_DOC_LABELS: Record<KycDocumentType, string> = {
  emirates_id: 'Emirates ID',
  passport: 'Passport',
  national_id: 'National ID card',
};

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]';

export const ContributorProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [payoutMethod] = useState<'paypal' | 'wise' | 'bank'>('paypal');

  const profile = user?.profile;
  const levelLabels: Record<string, string> = {
    starter: 'Starter',
    explorer: 'Explorer',
    trusted: 'Trusted',
    pro: 'Pro',
    elite: 'Elite',
  };
  const levelLabel = profile?.contributor_level ? levelLabels[profile.contributor_level] ?? 'Starter' : 'Starter';

  // Form State — prefilled from the real authenticated user profile; empty where unknown.
  const email = user?.email || '';
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || profile?.phone || '');
  const [country, setCountry] = useState(profile?.country_code || '');
  const [city, setCity] = useState(profile?.city || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Re-sync the form when the signed-in user loads or changes.
  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || user?.profile?.phone || '');
    setCountry(user?.profile?.country_code || '');
    setCity(user?.profile?.city || '');
    setBio(user?.profile?.bio || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // KYC form state
  const kycStatus = profile?.kyc_status ?? 'unverified';
  const [kycDocType, setKycDocType] = useState<KycDocumentType>('emirates_id');
  const [kycFront, setKycFront] = useState<File | null>(null);
  const [kycBack, setKycBack] = useState<File | null>(null);
  const [kycSelfie, setKycSelfie] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycMsg, setKycMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFront) {
      setKycMsg({ ok: false, text: 'Upload the front of your ID document.' });
      return;
    }
    setKycSubmitting(true);
    setKycMsg(null);
    try {
      const res = await profileApi.submitKyc({
        document_type: kycDocType,
        document_front: kycFront,
        document_back: kycBack,
        selfie: kycSelfie,
      });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        setKycFront(null);
        setKycBack(null);
        setKycSelfie(null);
        setKycMsg({ ok: true, text: res.message || 'Documents submitted for review.' });
      } else {
        setKycMsg({ ok: false, text: res.message || 'Could not submit documents.' });
      }
    } catch (err) {
      setKycMsg({ ok: false, text: getApiError(err, 'Could not submit documents.') });
    } finally {
      setKycSubmitting(false);
    }
  };

  // Social Connections State — no accounts connected by default; connects are not persisted yet.
  const [socials] = useState([
    {
      id: 'instagram',
      name: 'Instagram',
      handle: 'Not Connected',
      followers: '—',
      verified: false,
      icon: InstagramLogo,
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: 'Not Connected',
      followers: '—',
      verified: false,
      icon: TikTokLogo,
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: 'Not Connected',
      followers: '—',
      verified: false,
      icon: YouTubeLogo,
      badgeColor: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: 'Not Connected',
      followers: '—',
      verified: false,
      icon: FacebookLogo,
      badgeColor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      handle: 'Not Connected',
      followers: '—',
      verified: false,
      icon: XTwitterLogo,
      badgeColor: 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/10',
    },
  ]);

  /** Saves through PUT /profile; email is the login identity and stays read-only. */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await profileApi.update({
        name: name.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(country ? { country_code: country } : {}),
        city: city.trim() || null,
        bio: bio.trim() || null,
      });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        setSaveMsg({ ok: true, text: 'Profile saved.' });
      } else {
        setSaveMsg({ ok: false, text: res.message || 'Could not save your profile.' });
      }
    } catch (err) {
      setSaveMsg({ ok: false, text: getApiError(err, 'Could not save your profile.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-5xl mx-auto">
      
      {/* =========================================================================
          1. PROFILE BANNER & TIER CARD
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        {/* Decorative Top Mesh Header */}
        <div className="h-32 bg-gradient-to-r from-[#07182F] via-[#0D2342] to-[#168BFF] relative p-6 flex items-end justify-end">
          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className="flex items-center gap-2 bg-black/40 hover:bg-black/55 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-white font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#20C4E8]" />
            {kycStatus === 'verified' ? (
              <span>ID & KYC Verified Contributor</span>
            ) : kycStatus === 'pending' ? (
              <span>KYC Under Review</span>
            ) : kycStatus === 'rejected' ? (
              <span>KYC Rejected — Resubmit</span>
            ) : (
              <span>Verify Your Identity (KYC)</span>
            )}
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-2 pt-0 relative flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative -mt-12 sm:-mt-14">
              <AvatarUploadControl />
            </div>

            <div className="space-y-1 sm:pt-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-gray-100">{name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-[#16B364] border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  {levelLabel}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span>{email || 'No email on file'}</span>
                <span>•</span>
                <span>Contributor account</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:pt-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">Task Quality Score</span>
              <span className="text-lg font-black text-[#16B364]">
                {profile?.approval_rate ? `${profile.approval_rate}% Match Rate` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-t border-gray-100 dark:border-white/10 overflow-x-auto">
          {[
            { id: 'profile', label: 'Personal Information', icon: User },
            { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck },
            { id: 'socials', label: 'Connected Social Accounts', icon: Globe },
            { id: 'payouts', label: 'Payout Methods', icon: CreditCard },
            { id: 'security', label: 'Security & Preferences', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#168BFF] text-[#168BFF]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. TAB CONTENTS
         ========================================================================= */}

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Personal & Contact Details</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your contributor credentials, as registered.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                minLength={2}
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Email Address (Login)</label>
              <input
                type="email"
                value={email}
                readOnly
                className={`${inputClass} cursor-not-allowed text-gray-500 dark:text-gray-400`}
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                Your login email can't be changed here — contact support if you need to update it.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Mobile Phone (with country code)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Country of Residence</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>
                <option value="" disabled>
                  Select your country
                </option>
                {RESIDENCE_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
                {country && !RESIDENCE_COUNTRIES.some((c) => c.code === country) && (
                  <option value={country}>{country}</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Dubai"
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Contributor Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={1000}
                className={inputClass}
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Brief summary shared with brand campaign managers for bespoke task invites.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-h-[1rem]">
              {saveMsg && (
                <p
                  role="status"
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    saveMsg.ok ? 'text-[#16B364]' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {saveMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {saveMsg.text}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1277dc] disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: KYC VERIFICATION */}
      {activeTab === 'kyc' && (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Identity Verification (KYC)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verify your identity once to unlock withdrawals. Documents are stored privately and only seen by our review team.
            </p>
          </div>

          {kycStatus === 'verified' && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-start gap-3">
              <FileCheck2 className="w-6 h-6 text-[#16B364] shrink-0" />
              <div>
                <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">Your identity is verified</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {profile?.kyc_document_type ? KYC_DOC_LABELS[profile.kyc_document_type] : 'Document'} approved
                  {profile?.kyc_verified_at ? ` on ${new Date(profile.kyc_verified_at).toLocaleDateString()}` : ''}.
                </p>
              </div>
            </div>
          )}

          {kycStatus === 'pending' && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-black text-amber-800 dark:text-amber-200">Documents under review</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  {profile?.kyc_document_type ? KYC_DOC_LABELS[profile.kyc_document_type] : 'Your document'} submitted
                  {profile?.kyc_submitted_at ? ` on ${new Date(profile.kyc_submitted_at).toLocaleDateString()}` : ''}. We'll email you
                  once the review is complete.
                </p>
              </div>
            </div>
          )}

          {kycStatus === 'rejected' && (
            <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-black text-red-800 dark:text-red-200">Verification not approved</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  {profile?.kyc_rejection_reason || 'Please review your documents and submit them again.'}
                </p>
              </div>
            </div>
          )}

          {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Document type</label>
                <select
                  value={kycDocType}
                  onChange={(e) => setKycDocType(e.target.value as KycDocumentType)}
                  className={inputClass}
                >
                  {(Object.keys(KYC_DOC_LABELS) as KycDocumentType[]).map((key) => (
                    <option key={key} value={key}>
                      {KYC_DOC_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Front side', hint: 'Required', file: kycFront, set: setKycFront, accept: 'image/jpeg,image/png,image/webp,application/pdf' },
                  { label: 'Back side', hint: kycDocType === 'passport' ? 'Optional for passport' : 'Recommended', file: kycBack, set: setKycBack, accept: 'image/jpeg,image/png,image/webp,application/pdf' },
                  { label: 'Selfie holding ID', hint: 'Optional — speeds up review', file: kycSelfie, set: setKycSelfie, accept: 'image/jpeg,image/png,image/webp' },
                ].map((slot) => (
                  <label
                    key={slot.label}
                    className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center text-center gap-1.5 ${
                      slot.file
                        ? 'border-[#16B364] bg-emerald-50/50 dark:bg-emerald-500/10'
                        : 'border-gray-200 dark:border-white/15 hover:border-[#168BFF] bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    {slot.file ? <CheckCircle2 className="w-6 h-6 text-[#16B364]" /> : <Upload className="w-6 h-6 text-gray-400" />}
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{slot.label}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 break-all">
                      {slot.file ? slot.file.name : slot.hint}
                    </span>
                    <input
                      type="file"
                      accept={slot.accept}
                      className="sr-only"
                      onChange={(e) => slot.set(e.target.files?.[0] ?? null)}
                    />
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">JPG, PNG, WebP or PDF, up to 5MB each. Make sure all four corners and text are readable.</p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-h-[1rem]">
                  {kycMsg && (
                    <p
                      role="status"
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        kycMsg.ok ? 'text-[#16B364]' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {kycMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {kycMsg.text}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={kycSubmitting || !kycFront}
                  className="px-6 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1277dc] disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 transition-colors"
                >
                  {kycSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{kycSubmitting ? 'Uploading…' : 'Submit for Verification'}</span>
                </button>
              </div>
            </form>
          )}

          {kycMsg?.ok && kycStatus === 'pending' && (
            <p role="status" className="text-xs font-semibold text-[#16B364] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {kycMsg.text}
            </p>
          )}
        </div>
      )}

      {/* TAB 2: CONNECTED SOCIAL ACCOUNTS */}
      {activeTab === 'socials' && (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Verified Social Media Channels</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Social account linking ships with a future update — once live, the handle you use to complete tasks is recorded at submission time.
              </p>
            </div>
            <span className="text-xs font-bold text-[#168BFF] bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/25 self-start sm:self-auto">
              No Channels Connected
            </span>
          </div>

          <div className="space-y-3.5">
            {socials.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.id}
                  className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">{platform.name}</span>
                        {platform.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-[#16B364] border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            Action Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                        {platform.handle} • {platform.followers} followers
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {platform.verified ? (
                      <button
                        type="button"
                        disabled
                        title="Re-verification opens when handle linking is live"
                        className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      >
                        Re-Verify Handle
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Social account linking is not available yet"
                        className="px-4 py-1.5 rounded-xl bg-gray-200 text-xs font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      >
                        Connect Channel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUT METHODS */}
      {activeTab === 'payouts' && (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Payout Methods</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Supported rails for withdrawals. Minimum withdrawal is $50.00 with zero platform fees. Crypto payouts are not offered.
            </p>
          </div>

          {/* Supported rails (informational — details are entered per withdrawal) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'paypal', label: 'PayPal', fee: '0% Fee', icon: '🅿️' },
              { id: 'wise', label: 'Wise Transfer', fee: '0% Fee', icon: '🌐' },
              { id: 'bank', label: 'Direct Bank Transfer', fee: '0% Fee', icon: '🏦' },
            ].map((rail) => (
              <div
                key={rail.id}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  payoutMethod === rail.id
                    ? 'border-[#168BFF] bg-blue-50/40 dark:bg-blue-500/15 ring-1 ring-[#168BFF]'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322]'
                }`}
              >
                <span className="text-2xl block mb-2">{rail.icon}</span>
                <span className="text-xs font-black text-gray-900 dark:text-gray-100 block">{rail.label}</span>
                <span className="text-[10px] text-[#16B364] font-bold block">{rail.fee}</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Payout account details are collected each time you request a withdrawal in the{' '}
              <Link to="/app/wallet" className="text-[#168BFF] font-bold hover:underline">
                Wallet
              </Link>{' '}
              — nothing is stored here. Every withdrawal is queued and paid manually by the platform team after a compliance check.
            </p>
            <Link
              to="/app/wallet"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16B364] hover:bg-[#12995a] text-white text-xs font-bold transition-colors"
            >
              Go to Wallet
            </Link>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & PREFERENCES */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Security & Notifications</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage two-factor authentication, passwords, and task drop notifications.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">Two-Factor Authentication (2FA)</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Protect cashouts with an authenticator app (TOTP).</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 text-xs font-bold" title="2FA enrollment is not available yet">
                Not enabled
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">High-Value Task Alerts</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Get notified immediately when campaigns paying {'>'} $2.50 go live.</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0C1322] after:border-gray-300 dark:after:border-white/20 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#168BFF]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
