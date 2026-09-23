import React, { useState } from 'react';
import {
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

export const ContributorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'socials' | 'payouts' | 'security'>('profile');
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
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState(profile?.bio || '');

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

  /**
   * No profile-update endpoint exists on the backend yet (only avatar
   * upload). The form is honestly read-only until the API ships — the
   * avatar above saves through the real /profile/avatar endpoint.
   */
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-5xl mx-auto">
      
      {/* =========================================================================
          1. PROFILE BANNER & TIER CARD
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        {/* Decorative Top Mesh Header */}
        <div className="h-32 bg-gradient-to-r from-[#07182F] via-[#0D2342] to-[#168BFF] relative p-6 flex items-end justify-end">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-[#20C4E8]" />
            {profile?.kyc_status === 'verified' ? (
              <span>ID & KYC Verified Contributor</span>
            ) : (
              <span>KYC Verification Pending</span>
            )}
          </div>
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
                onClick={() => setActiveTab(tab.id as any)}
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
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Email Address (Login)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Mobile Phone (WhatsApp Verified)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Country of Residence</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Contributor Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#0C1322] focus:outline-none focus:border-[#168BFF]"
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Brief summary shared with brand campaign managers for bespoke task invites.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Profile editing isn't available yet — the API for saving these fields ships with the next backend update.
              Your avatar above saves through the real upload endpoint.
            </p>
            <button
              type="submit"
              disabled
              title="Profile update API not available yet"
              className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-400 dark:text-gray-500 font-bold text-xs flex items-center gap-2 cursor-not-allowed shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
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
