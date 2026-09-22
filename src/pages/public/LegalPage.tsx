import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from 'lucide-react';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies' | 'policy'>('terms');

  useEffect(() => {
    if (location.pathname.includes('privacy')) setActiveTab('privacy');
    else if (location.pathname.includes('cookies')) setActiveTab('cookies');
    else if (location.pathname.includes('policy')) setActiveTab('policy');
    else setActiveTab('terms');
  }, [location.pathname]);

  return (
    <div className="text-left font-sans min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F19]">
      
      {/* Header */}
      <section className="bg-[#07182F] text-white pt-24 pb-12 sm:pt-28 sm:pb-14 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#20C4E8]">
            <Scale className="w-3.5 h-3.5" />
            <span>Platform Governance & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Legal Terms & Privacy Policies
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Clear, transparent policies governing user conduct, data privacy, and campaign fulfillment.
          </p>
        </div>
      </section>

      {/* Policy Tabs & Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-10 border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-8">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
            {[
              { id: 'terms', label: 'Terms of Service', icon: FileText, path: '/legal/terms' },
              { id: 'privacy', label: 'Privacy Policy', icon: Lock, path: '/legal/privacy' },
              { id: 'cookies', label: 'Cookie Policy', icon: Cookie, path: '/legal/cookies' },
              { id: 'policy', label: 'Task Compliance Policy', icon: ShieldCheck, path: '/legal/task-policy' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#07182F] text-white shadow-sm'
                      : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Tab 1: Terms */}
          {activeTab === 'terms' && (
            <div className="space-y-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">1. Agreement to Terms</h2>
                <p>
                  By accessing or using eBizEarn, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our platform as either an earner or an advertiser.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">2. Contributor Accounts & Free Access</h2>
                <p>
                  Contributor accounts are strictly 100% free to create. eBizEarn will never demand registration fees, membership upgrades, or deposit requirements. You must be at least 18 years of age or possess legal guardian consent.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">3. Proof Submission & Anti-Fraud</h2>
                <p>
                  Contributors represent and warrant that all submitted proof screenshots, links, and text tokens are genuine. The use of automated botting scripts, emulator farms, modified images, or duplicate screenshots results in immediate account forfeiture and permanent blacklisting.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">4. Payouts & Escrow Guarantee</h2>
                <p>
                  Payouts are issued starting from a minimum threshold of $50.00 USD. Withdrawal requests are queued for manual processing. Rewards are credited upon computer vision or moderator verification. Zero withdrawal fees are deducted by eBizEarn.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">1. Information We Collect</h2>
                <p>
                  We collect account registration details (email, phone, display name), verified social handles (for proof verification purposes), and payout coordinates (e.g. PayPal email, bank IBAN). We never store raw banking credentials or payment card numbers.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">2. How We Use Data</h2>
                <p>
                  Collected data is utilized strictly to verify task completion authenticity, calculate double-entry ledger earnings, dispatch withdrawals, and enforce anti-fraud security.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">3. Zero Data Resale Guarantee</h2>
                <p>
                  eBizEarn will never sell, rent, or monetize your personal information to third-party data brokers.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Cookies */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">1. Essential Cookies</h2>
                <p>
                  We utilize secure authentication session tokens (HTTP-only) to maintain your login status, remember active roles, and guard against Cross-Site Request Forgery (CSRF).
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">2. Analytics Cookies</h2>
                <p>
                  Aggregated telemetry is used to evaluate vision OCR performance latency and server health. These metrics are strictly anonymized.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Task Compliance */}
          {activeTab === 'policy' && (
            <div className="space-y-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">1. Strictly Prohibited Campaigns</h2>
                <p>
                  Advertisers may not request deceptive practices, fake product reviews, deceptive trust badges, spam botting, hate speech, or financial scams. All campaigns undergo mandatory admin compliance screening before disbursement.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">2. Contributor Obligations</h2>
                <p>
                  Contributors must keep posts visible for the stated duration (minimum 24 hours). Premature archiving or post deletion triggers automated reward clawback.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};
