import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBreadcrumb } from '../../components/common/PageBreadcrumb';
import {
  Building2,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sliders,
  DollarSign,
  Globe,
  Cpu,
  BarChart3,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
  Flame,
  Check,
  Star,
  Video,
  Smartphone,
  Share2,
  ThumbsUp,
  MessageSquare,
  Award,
  CheckCheck,
} from 'lucide-react';
import {
  GoogleLogo,
  MetaLogo,
  TikTokLogo,
  YouTubeLogo,
  InstagramLogo,
  FacebookLogo,
  WhatsAppLogo,
  TrustpilotLogo,
  GoogleReviewLogo,
} from '../../components/common/PlatformIcons';
import { EBizLogo } from '../../components/common/EBizLogo';
import { RequestDemoModal } from '../../components/common/RequestDemoModal';

export const ForBusinessesPage: React.FC = () => {
  // Interactive Campaign Budget Planner State
  // NOTE: task pricing is NOT fixed — the business proposes a planned reward and
  // our team confirms final rates before anything goes live. Never hard-code
  // guaranteed dollar amounts here.
  const [objective, setObjective] = useState<'reviews' | 'social' | 'testing' | 'survey' | 'ugc'>('reviews');
  const [contributorCount, setContributorCount] = useState<number>(500);
  const [rewardInput, setRewardInput] = useState<string>('');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const objectiveConfig = {
    reviews: { label: 'Trustpilot & Google Reviews', badge: 'Reputation', icon: 'star' },
    social: { label: 'Social Engagement & Shares', badge: 'Reach', icon: 'share' },
    testing: { label: 'App Testing & Store Reviews', badge: 'QA', icon: 'phone' },
    survey: { label: 'GCC Consumer Market Surveys', badge: 'Insights', icon: 'chat' },
    ugc: { label: 'Authentic UGC & Video Clips', badge: 'Creators', icon: 'video' },
  } as const;

  const handleObjectiveSelect = (key: 'reviews' | 'social' | 'testing' | 'survey' | 'ugc') => {
    setObjective(key);
  };

  const rewardPerTask = Math.max(0, parseFloat(rewardInput) || 0);
  const contributorBudget = contributorCount * rewardPerTask;
  const platformFee = contributorBudget * 0.15;
  const totalBudget = (contributorBudget + platformFee).toFixed(2);
  const deliveryTime = contributorCount <= 250 ? '2 - 4 hours' : contributorCount <= 1000 ? '6 - 12 hours' : '12 - 24 hours';

  const comparisonRows = [
    {
      feature: 'Audience Authenticity',
      eBiz: '100% Real, National ID & KYC-verified individuals',
      agencies: 'Individual influencers (unpredictable audience)',
      botFarms: 'Fake bot clusters (high ban risk & zero conversion)',
    },
    {
      feature: 'Verification Burden on You',
      eBiz: 'Low effort — our review team inspects proofs',
      agencies: 'High — hours spent coordinating contracts & checking posts',
      botFarms: 'None, but leads to platform account bans & penalization',
    },
    {
      feature: 'Reputation & Review Quality',
      eBiz: 'Constructive 5-star Trustpilot & Google Business reviews',
      agencies: 'Rarely handle direct review platforms',
      botFarms: 'Leads to platform account bans & penalization',
    },
    {
      feature: 'Cost Per Verified Action',
      eBiz: '$2.50 – $18.00 per confirmed action',
      agencies: '$2,500 – $25,000+ upfront flat retainer',
      botFarms: 'Cheap, but causes irreversible brand reputational damage',
    },
    {
      feature: 'Capital Protection',
      eBiz: 'Protected escrow: Pay only for approved proofs',
      agencies: 'Non-refundable upfront retainers regardless of output',
      botFarms: 'Zero buyer recourse or financial protection',
    },
  ];

  return (
    <div className="text-start font-sans min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F19]">
      
      {/* =========================================================================
          1. BESPOKE CORPORATE PRESTIGE HERO BANNER
         ========================================================================= */}
      <section className="relative bg-[#07182F] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-hidden border-b border-white/10">
        {/* Cinematic photographic backdrop — real corporate photography,
            faded into the navy so the page never looks AI-generated. */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <picture>
            <source srcSet="/images/for-businesses-hero.webp" type="image/webp" />
            <img
              src="/images/for-businesses-hero.jpg"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          {/* Navy cinematic grade: image melts into the page, text stays readable */}
          <div className="absolute inset-0 bg-[#07182F]/62" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07182F]/80 via-transparent to-[#07182F]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07182F]/70 via-transparent to-[#07182F]/40" />
        </div>
        {/* Glow ambient meshes */}
        <div className="absolute top-10 left-1/3 w-[550px] h-[550px] bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-[#20C4E8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: B2B Authority Messaging */}
            <div className="lg:col-span-7 space-y-6">
              <PageBreadcrumb
                tone="onDark"
                align="left"
                trail={[{ label: 'Home', to: '/' }, { label: 'For Businesses' }]}
              />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#20C4E8]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Brand Protection & Social Distribution</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16B364]" />
                <span className="text-white font-mono">Georgia 🇬🇪</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Institutional Reputation, <br />
                <span className="bg-gradient-to-r from-[#20C4E8] via-[#168BFF] to-[#7357FF] bg-clip-text text-transparent">
                  Verified Reviews & Social Scale.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed font-normal">
                Deploy verified human contributors across <strong>Trustpilot, Google Business, Instagram, TikTok, and App Stores</strong>. Safeguard your online prestige with manual proof review and zero administrative overhead.
              </p>

              {/* Supported Platforms Strip */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Supported Networks:</span>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 flex items-center gap-1.5 text-xs font-bold" title="Trustpilot">
                    <TrustpilotLogo className="w-4 h-4" />
                    <span>Trustpilot</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 flex items-center gap-1.5 text-xs font-bold" title="Google Reviews">
                    <GoogleReviewLogo className="w-4 h-4" />
                    <span>Google Reviews</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15" title="Instagram">
                    <InstagramLogo className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15" title="TikTok">
                    <TikTokLogo className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15" title="YouTube">
                    <YouTubeLogo className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/business/register"
                  className="px-7 py-4 bg-gradient-brand hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Launch Institutional Campaign</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
                <a
                  href="#simulator"
                  className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4 text-[#20C4E8]" />
                  <span>USD Budget Simulator</span>
                </a>
              </div>

              {/* Corporate Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-[11px] text-gray-300 font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16B364] shrink-0" />
                  <span>Zero Verification Overhead</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#20C4E8] shrink-0" />
                  <span>Central Bank Escrow (USD)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#7357FF] shrink-0" />
                  <span>100% KYC Real Humans</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B364] shrink-0" />
                  <span>Sub-4h Turnaround</span>
                </div>
              </div>

            </div>

            {/* Right Column: Live Enterprise Operations Console */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-gray-300 ml-1.5">eBiz Enterprise Rep Ops</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#16B364] bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Live Escrow Active
                  </span>
                </div>

                {/* Simulated Campaign Card */}
                <div className="bg-[#040F1E] rounded-2xl p-4 border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-gray-400 dark:text-gray-500 text-[10px]">
                    <span>SPONSOR: TBILISI_PARTNERS</span>
                    <span className="text-[#20C4E8]">ESCROW: 🇬🇪 $12,750.00</span>
                  </div>

                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    <span>Sponsored Reviews Campaign</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] text-gray-300">
                      <span>425 of 500 Reviews Confirmed</span>
                      <span className="text-[#16B364] font-bold">$6,375.00 Disbursed</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#20C4E8] to-[#168BFF] w-[85%] rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase">Moderation</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">100% eBiz Admin</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase">Client Work</div>
                      <div className="text-xs font-bold text-[#20C4E8] mt-0.5">0 Hours</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase">Avg Rating</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">★ 4.95 / 5.0</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-300">Target Geographies:</span>
                  <span className="font-bold text-white">Tbilisi, Georgia, UK</span>
                </div>

                <Link
                  to="/business/register"
                  className="w-full py-3.5 bg-gradient-brand text-white font-black text-xs rounded-xl text-center block shadow hover:opacity-95 transition-all"
                >
                  Create Corporate Account
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ZERO VERIFICATION BURDEN CALLOUT BANNER
         ========================================================================= */}
      <section className="py-8 bg-white dark:bg-[#0C1322] border-b border-[#E4EAF2] dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#07182F] to-[#0D2A52] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#168BFF] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Zero Verification Overhead for Business Owners</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#16B364]/20 text-[#16B364] border border-[#16B364]/30 text-[10px] font-black uppercase">
                    Manually Reviewed & Admin Audited
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                  Unlike conventional platforms that burden your marketing managers with verifying thousands of screenshots and links, <strong>eBiz Network handles proof auditing</strong>. Our team reviews submissions with manual checks and automated tooling for URLs, timestamps, account legitimacy, and review authenticity. Your team never reviews a single submission.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <div className="text-center px-4 py-2 bg-white/10 rounded-xl border border-white/15">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase">Client Review Burden</span>
                <span className="text-lg font-black text-[#16B364]">0%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CAMPAIGN BUDGET PLANNER (USD) — illustrative only.
          Task pricing is never guaranteed here; the business proposes a planned
          reward and our team confirms final rates before launch.
         ========================================================================= */}
      <section id="simulator" className="py-14 sm:py-20 bg-[#F6F1E7] dark:bg-[#12100C] relative overflow-hidden">
        <style>{`
          .ws-slider { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
          .ws-slider::-webkit-slider-runnable-track { height: 10px; border-radius: 999px;
            background: linear-gradient(to right, #D9622B var(--fill, 20%), #E7DCC4 var(--fill, 20%)); }
          .ws-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -9px;
            width: 28px; height: 28px; border-radius: 999px; background: #FFFDF8;
            border: 3px solid #D9622B; box-shadow: 0 4px 12px rgba(217,98,43,.35); }
          .ws-slider::-moz-range-track { height: 10px; border-radius: 999px; background: #E7DCC4; }
          .ws-slider::-moz-range-progress { height: 10px; border-radius: 999px; background: #D9622B; }
          .ws-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 999px; background: #FFFDF8;
            border: 3px solid #D9622B; box-shadow: 0 4px 12px rgba(217,98,43,.35); }
          .dark .ws-slider::-webkit-slider-runnable-track {
            background: linear-gradient(to right, #E07B3F var(--fill, 20%), #2A251C var(--fill, 20%)); }
          .dark .ws-slider::-moz-range-track { background: #2A251C; }
          .dark .ws-slider::-moz-range-progress { background: #E07B3F; }
          .receipt-zigzag { height: 14px;
            background: linear-gradient(-45deg, transparent 10px, #FFFDF8 0) 0 0 / 20px 20px repeat-x,
                        linear-gradient(45deg, transparent 10px, #FFFDF8 0) 10px 0 / 20px 20px repeat-x; }
          .dark .receipt-zigzag {
            background: linear-gradient(-45deg, transparent 10px, #1B1813 0) 0 0 / 20px 20px repeat-x,
                        linear-gradient(45deg, transparent 10px, #1B1813 0) 10px 0 / 20px 20px repeat-x; }
          .step-numeral { -webkit-text-stroke: 1.5px #D9622B; color: transparent; }
          .dark .step-numeral { -webkit-text-stroke: 1.5px #E07B3F; }
        `}</style>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl mx-auto mb-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#D9622B]/10 text-[#B34E1F] dark:text-[#E89A63] text-xs font-bold uppercase tracking-[0.18em]">
              Budget planner
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] dark:text-[#F5EFE3] tracking-tight mt-4">
              Sketch your campaign budget
            </h2>
            <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mt-3 leading-relaxed">
              Play with the numbers below — contributors, your planned reward, and see the
              maths work itself out. <span className="font-semibold text-[#57534E] dark:text-[#D6D3D1]">Illustrative only:</span> final
              task pricing is decided by our team and confirmed with you before anything goes live.
            </p>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#1B1813] rounded-[28px] p-6 sm:p-10 border border-[#E7DCC4] dark:border-white/10 shadow-[0_24px_60px_-24px_rgba(120,80,30,0.25)] space-y-10">
            
            {/* Step 01 — Objective */}
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="step-numeral text-4xl font-black leading-none select-none" aria-hidden="true">01</span>
                <label className="text-sm font-bold text-[#1C1917] dark:text-[#F5EFE3]">
                  What do you want to achieve?
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(['reviews', 'social', 'testing', 'survey', 'ugc'] as const).map((key) => {
                  const Icon = { reviews: Star, social: Share2, testing: Smartphone, survey: MessageSquare, ugc: Video }[key];
                  const active = objective === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleObjectiveSelect(key)}
                      aria-pressed={active}
                      className={`p-3.5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                        active
                          ? 'border-[#D9622B] bg-[#D9622B]/[.06] dark:bg-[#D9622B]/10 shadow-[0_8px_20px_-8px_rgba(217,98,43,0.4)]'
                          : 'border-[#EDE4D2] dark:border-white/10 hover:border-[#D9622B]/50 bg-white dark:bg-[#242019]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${active ? 'text-[#D9622B]' : 'text-[#A8A29E]'}`} />
                      <div className={`text-xs font-bold leading-snug ${active ? 'text-[#1C1917] dark:text-[#F5EFE3]' : 'text-[#57534E] dark:text-[#D6D3D1]'}`}>
                        {objectiveConfig[key].label}
                      </div>
                      <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        active ? 'bg-[#D9622B] text-white' : 'bg-[#F1EAD9] dark:bg-white/10 text-[#78716C] dark:text-[#A8A29E]'
                      }`}>
                        {objectiveConfig[key].badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 02 — Contributors */}
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="step-numeral text-4xl font-black leading-none select-none" aria-hidden="true">02</span>
                <label className="text-sm font-bold text-[#1C1917] dark:text-[#F5EFE3]">
                  How many verified contributors?
                </label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={contributorCount}
                  onChange={(e) => setContributorCount(parseInt(e.target.value, 10))}
                  className="ws-slider flex-1 h-7"
                  style={{ '--fill': `${((contributorCount - 50) / (3000 - 50)) * 100}%` } as React.CSSProperties}
                  aria-label="Number of verified contributors"
                />
                <span className="shrink-0 min-w-[92px] text-center text-lg font-black text-[#1C1917] dark:text-[#F5EFE3] tabular-nums px-3 py-1.5 bg-[#F6F1E7] dark:bg-white/5 border border-[#E7DCC4] dark:border-white/10 rounded-xl">
                  {contributorCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#A8A29E] font-semibold mt-1.5 px-0.5">
                <span>Pilot · 50</span>
                <span>Growth · 500</span>
                <span>Enterprise · 3,000</span>
              </div>
            </div>

            {/* Step 03 — Planned reward (free input, nothing guaranteed) */}
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="step-numeral text-4xl font-black leading-none select-none" aria-hidden="true">03</span>
                <label htmlFor="ws-reward" className="text-sm font-bold text-[#1C1917] dark:text-[#F5EFE3]">
                  Your planned reward per verified task
                </label>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative sm:max-w-[220px] w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#A8A29E]">$</span>
                  <input
                    id="ws-reward"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={rewardInput}
                    onChange={(e) => setRewardInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 text-xl font-black tabular-nums text-[#1C1917] dark:text-[#F5EFE3] bg-[#F6F1E7] dark:bg-white/5 border-2 border-[#E7DCC4] dark:border-white/10 rounded-2xl outline-none focus:border-[#D9622B] transition-colors placeholder:text-[#D6CDB4] dark:placeholder:text-white/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#A8A29E]">USD</span>
                </div>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed flex-1">
                  Type any amount — <span className="font-semibold text-[#57534E] dark:text-[#D6D3D1]">even $0.15.</span> This
                  is your planning figure, not a promise: our team decides the final task
                  pricing and confirms it with you before your campaign goes live.
                </p>
              </div>
            </div>

            {/* Budget receipt — illustrative estimate, never a quote */}
            <div className="relative">
              <div className="relative bg-[#FFFDF8] dark:bg-[#1B1813] rounded-t-2xl border-2 border-b-0 border-dashed border-[#D8C9A8] dark:border-white/15 p-6 sm:p-8 overflow-hidden">
                {/* stamp */}
                <div className="absolute top-5 right-5 rotate-[8deg] pointer-events-none select-none" aria-hidden="true">
                  <span className="block px-3 py-1 text-[11px] font-black tracking-[0.2em] uppercase text-[#D9622B]/70 border-[2.5px] border-[#D9622B]/50 rounded-md">
                    Estimate
                  </span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A8A29E] mb-5">
                  Your budget slip
                </div>
                <dl className="space-y-3.5 text-sm tabular-nums">
                  <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-dashed border-[#E7DCC4] dark:border-white/10">
                    <dt className="text-[#57534E] dark:text-[#D6D3D1]">
                      {contributorCount.toLocaleString()} contributors × ${rewardPerTask.toFixed(2)}
                    </dt>
                    <dd className="font-bold text-[#1C1917] dark:text-[#F5EFE3]">USD {contributorBudget.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-dashed border-[#E7DCC4] dark:border-white/10">
                    <dt className="text-[#57534E] dark:text-[#D6D3D1]">Escrow & moderation · 15%</dt>
                    <dd className="font-bold text-[#1C1917] dark:text-[#F5EFE3]">USD {platformFee.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-dashed border-[#E7DCC4] dark:border-white/10">
                    <dt className="text-[#57534E] dark:text-[#D6D3D1] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#A8A29E]" /> Estimated completion
                    </dt>
                    <dd className="font-bold text-[#2F7D4F] dark:text-[#7BC98F]">{deliveryTime}</dd>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
                    <dt className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-snug">
                      Total held in escrow<br />
                      <span className="text-[#2F7D4F] dark:text-[#7BC98F] font-semibold">100% refundable</span>
                    </dt>
                    <dd className="text-3xl sm:text-4xl font-black text-[#1C1917] dark:text-[#F5EFE3] tracking-tight">
                      <span className="text-lg align-top font-bold text-[#A8A29E]">$</span>{totalBudget}
                      <span className="text-xs font-bold text-[#A8A29E] ml-1">USD</span>
                    </dd>
                  </div>
                </dl>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed mt-5">
                  Illustrative maths only — not a quote or a guaranteed rate. Final task pricing
                  is set by our team and confirmed with you before launch.
                </p>
              </div>
              <div className="receipt-zigzag" aria-hidden="true" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#2F7D4F] dark:text-[#7BC98F]" />
                Unused funds stay safe in your escrow balance — refund or reuse them anytime, no penalties.
              </span>
              <Link
                to="/business/register"
                className="shrink-0 px-7 py-3.5 bg-[#D9622B] hover:bg-[#C0531F] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-[0_12px_28px_-10px_rgba(217,98,43,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>Deploy Campaign to Marketplace</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. LAUNCH CTA — replaced fabricated "case studies" (invented brand
          names, quotes, and metrics). Never re-add fake testimonials.
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#F7F9FC] dark:bg-[#0B0F19] border-y border-[#E4EAF2] dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#07182F] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-10 w-72 h-72 bg-[#168BFF]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#20C4E8] text-xs font-bold uppercase tracking-wider border border-white/15">
                Self-Serve Campaign Builder
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Launch Your First Campaign in Minutes
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
                Define your objective, pick your audience, fund the escrow budget, and go live.
                You only pay for verified, approved proof of work — unused budget is refundable.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  to="/business/register"
                  className="px-8 py-3.5 bg-[#168BFF] hover:bg-[#1277dc] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl transition-all flex items-center gap-2"
                >
                  <span>Create Business Account</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
                >
                  Request Demo
                </button>
                <Link
                  to="/pricing"
                  className="px-7 py-3.5 bg-transparent hover:bg-white/5 text-amber-300 font-bold text-xs sm:text-sm rounded-xl border border-amber-300/40 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View managed packages</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMPARISON MATRIX: EBIZ NETWORK VS AGENCIES & BOTS
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white dark:bg-[#0C1322]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#7357FF] dark:bg-purple-500/15 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              Market Superiority
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-gray-100 tracking-tight">
              Why Corporate Leaders Choose eBiz Network
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              A transparent comparison between verified micro-action networks, PR retainers, and synthetic spam.
            </p>
          </div>

          <div className="glass rounded-3xl overflow-x-auto">
            <table className="min-w-[640px] w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-[#07182F] text-white">
                  <th className="p-4 sm:p-5 font-bold">Key Criteria</th>
                  <th className="p-4 sm:p-5 font-bold bg-[#168BFF] text-white">eBiz Network Platform</th>
                  <th className="p-4 sm:p-5 font-bold text-gray-300">Influencer & PR Agencies</th>
                  <th className="p-4 sm:p-5 font-bold text-gray-300">Click & Bot Farms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-[#0C1322]' : 'bg-[#F7F9FC] dark:bg-[#0B0F19]'}>
                    <td className="p-4 sm:p-5 font-bold text-gray-900 dark:text-gray-100">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-bold text-[#168BFF] bg-blue-50/40">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16B364] shrink-0" />
                        <span>{row.eBiz}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-gray-400">{row.agencies}</td>
                    <td className="p-4 sm:p-5 text-red-600 font-semibold">{row.botFarms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. BOTTOM B2B CONVERSION
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#07182F] text-white relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Ready to Protect & Elevate Your Brand?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Create your corporate account in 2 minutes. Fund via bank transfer, local bank wire, or credit card, and mobilize thousands of verified contributors.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/business/register"
              className="px-8 py-4 bg-gradient-brand text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Create Business Account</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <Link
              to="/business/login"
              className="px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
            >
              Business Login
            </Link>
          </div>
        </div>
      </section>

      <RequestDemoModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
