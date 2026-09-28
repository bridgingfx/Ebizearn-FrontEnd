import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  Compass,
  Send,
  Wallet,
  Globe,
  Award,
  Users,
  CheckSquare,
  Building,
  Clock,
  Sparkles,
  ChevronDown,
  Gift,
  ShieldAlert,
  Sliders,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  Smartphone,
  Trophy,
  HelpCircle,
  Lock,
  Flame,
  BadgeCheck,
  MessageCircle,
  Share2,
  ThumbsUp,
  DollarSign,
  Heart,
  BarChart3,
  Cpu,
  Activity,
  CheckCheck,
  RefreshCw,
  Camera,
  Bell,
  Wifi,
} from 'lucide-react';
import {
  GoogleLogo,
  MetaLogo,
  TikTokLogo,
  YouTubeLogo,
  InstagramLogo,
  XTwitterLogo,
  FacebookLogo,
  LinkedInLogo,
  AmazonLogo,
  WhatsAppLogo,
  TelegramLogo,
} from '../../components/common/PlatformIcons';
import { RequestDemoModal } from '../../components/common/RequestDemoModal';
import { BlogStrip } from '../../blog/components/BlogStrip';
import { useRegion } from '../../context/RegionContext';

export const HomePage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedSocialTab, setSelectedSocialTab] = useState<'all' | 'instagram' | 'tiktok' | 'youtube' | 'facebook'>('all');
  const [calculatorHours, setCalculatorHours] = useState<number>(1);
  const { t } = useRegion();
  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const calculatedMonthly = (calculatorHours * 6.50 * 30).toFixed(0);

  const socialFormats = [
    {
      platform: 'Instagram',
      title: t('home.how.card1Title'),
      reward: t('home.how.card1Reward'),
      time: t('home.how.card1Time'),
      slots: t('home.how.card1Slots'),
      desc: t('home.how.card1Desc'),
      icon: InstagramLogo,
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      tag: t('home.how.card1Tag'),
      accentColor: 'from-pink-500 to-rose-500',
    },
    {
      platform: 'TikTok',
      title: t('home.how.card2Title'),
      reward: t('home.how.card2Reward'),
      time: t('home.how.card2Time'),
      slots: t('home.how.card2Slots'),
      desc: t('home.how.card2Desc'),
      icon: TikTokLogo,
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      tag: t('home.how.card2Tag'),
      accentColor: 'from-[#20C4E8] to-[#168BFF]',
    },
    {
      platform: 'YouTube',
      title: t('home.how.card3Title'),
      reward: t('home.how.card3Reward'),
      time: t('home.how.card3Time'),
      slots: t('home.how.card3Slots'),
      desc: t('home.how.card3Desc'),
      icon: YouTubeLogo,
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      tag: t('home.how.card3Tag'),
      accentColor: 'from-red-500 to-orange-500',
    },
    {
      platform: 'Facebook',
      title: t('home.how.card4Title'),
      reward: t('home.how.card4Reward'),
      time: t('home.how.card4Time'),
      slots: t('home.how.card4Slots'),
      desc: t('home.how.card4Desc'),
      icon: FacebookLogo,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      tag: t('home.how.card4Tag'),
      accentColor: 'from-blue-600 to-indigo-600',
    },
    {
      platform: 'WhatsApp',
      title: t('home.how.card5Title'),
      reward: t('home.how.card5Reward'),
      time: t('home.how.card5Time'),
      slots: t('home.how.card5Slots'),
      desc: t('home.how.card5Desc'),
      icon: WhatsAppLogo,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tag: t('home.how.card5Tag'),
      accentColor: 'from-emerald-500 to-teal-500',
    },
    {
      platform: 'App Testing',
      title: t('home.how.card6Title'),
      reward: t('home.how.card6Reward'),
      time: t('home.how.card6Time'),
      slots: t('home.how.card6Slots'),
      desc: t('home.how.card6Desc'),
      icon: Smartphone,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      tag: t('home.how.card6Tag'),
      accentColor: 'from-purple-600 to-indigo-600',
    },
  ];

  const filteredTasks = socialFormats.filter((item) => {
    if (selectedSocialTab === 'all') return true;
    return item.platform.toLowerCase() === selectedSocialTab.toLowerCase();
  });

  const faqs = [
    { q: t('home.faq.q1'), a: t('home.faq.a1') },
    { q: t('home.faq.q2'), a: t('home.faq.a2') },
    { q: t('home.faq.q3'), a: t('home.faq.a3') },
    { q: t('home.faq.q4'), a: t('home.faq.a4') },
    { q: t('home.faq.q5'), a: t('home.faq.a5') },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F19] text-[#101828] dark:text-gray-100 font-sans text-left">
      
      {/* =========================================================================
          1. SIMPLIFIED, HIGH-CONVERTING HERO BANNER
          - Decluttered Left Column with Generous Spacing & High-Contrast Neon CTA
          - Sleek Smartphone Mockup with 4 Popping Notification Bubbles & Reactions
         ========================================================================= */}
      <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pb-10 overflow-hidden bg-[#07182F] text-white border-b border-white/10">
        
        {/* Ambient subtle glow meshes */}
        <div className="absolute top-12 left-1/4 w-[450px] h-[450px] bg-[#168BFF]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-6 right-12 w-[400px] h-[400px] bg-[#20C4E8]/12 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Clean, Decluttered, High-Trust Copy */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              
              {/* Subtle Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span>{t('home.hero.pill')}</span>
              </div>

              {/* Bold Headline matching mockup */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-black text-white tracking-tight leading-[1.12]">
                {t('home.hero.title1')} <br />
                <span className="text-[#38BDF8]">{t('home.hero.titleAccent')}</span>{' '}
                <br className="hidden sm:inline" />
                {t('home.hero.title2')}
              </h1>

              {/* Subheadline: Large, Readable, Generous Spacing */}
              <p className="text-base lg:text-[1.05rem] text-gray-300 leading-relaxed max-w-xl font-normal mx-auto lg:mx-0">
                {t('home.hero.sub')}
              </p>

              {/* Action Buttons: High-Contrast Neon Green Primary CTA + Minimal Outline Secondary CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/contributor/register"
                  className="bg-[#22C55E] hover:bg-[#16a34a] text-[#07182F] font-black text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 group"
                >
                  <span>{t('home.hero.cta1')}</span>
                  <ArrowRight className="w-5 h-5 text-[#07182F] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/tasks"
                  className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 backdrop-blur-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <span>{t('home.hero.cta2')}</span>
                </Link>
              </div>

            </div>

            {/* RIGHT COLUMN: Sleek Smartphone Mockup with 4 Popping Notification Bubbles */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-5 sm:py-6 select-none">
              
              {/* Atmospheric background aura */}
              <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] bg-gradient-to-tr from-[#0ea5e9]/25 via-[#10b981]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

              {/* Floating Reaction Emojis around phone */}
              <div className="absolute top-1 right-10 sm:right-16 z-30 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-pink-100 flex items-center gap-1.5 text-[11px] font-bold animate-float-slow">
                <span className="text-base">❤️</span>
                <span className="text-pink-600 font-extrabold">{t('home.hero.like')}</span>
              </div>

              <div className="absolute bottom-20 right-0 sm:right-6 z-30 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-orange-100 flex items-center gap-1.5 text-[11px] font-bold animate-float">
                <span className="text-base">🔥</span>
                <span className="text-orange-600 font-extrabold">{t('home.hero.hotTask')}</span>
              </div>

              <div className="absolute -top-1 left-16 sm:left-24 z-30 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-blue-100 flex items-center gap-1.5 text-[11px] font-bold animate-float-delayed">
                <span className="text-base">👍</span>
                <span className="text-blue-600 font-extrabold">{t('home.hero.verified')}</span>
              </div>

              {/* FLOATING NOTIFICATION BUBBLE 1: Top-Left (+$50.00 Verified Cash) */}
              <div className="absolute top-12 left-0 sm:-left-4 z-30 bg-white dark:bg-[#0C1322] text-slate-900 dark:text-gray-100 px-3 py-2.5 rounded-xl shadow-2xl border border-slate-100/90 flex items-center gap-2.5 animate-float max-w-[185px]">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t('home.hero.instantPayout')}</div>
                  <div className="text-xs font-black text-emerald-600">{t('home.hero.instantPayoutValue')}</div>
                </div>
              </div>

              {/* FLOATING NOTIFICATION BUBBLE 2: Top-Right (Upload Review Photo) */}
              <div className="absolute top-14 right-0 sm:-right-2 z-30 bg-white dark:bg-[#0C1322] text-slate-900 dark:text-gray-100 px-3 py-2.5 rounded-xl shadow-2xl border border-slate-100/90 flex items-center gap-2.5 animate-float-delayed max-w-[190px]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t('home.hero.newTask')}</div>
                  <div className="text-xs font-black text-gray-900 dark:text-gray-100">{t('home.hero.newTaskValue')}</div>
                </div>
              </div>

              {/* FLOATING NOTIFICATION BUBBLE 3: Bottom-Left (Review: TikTok Video) */}
              <div className="absolute bottom-14 left-0 sm:-left-3 z-30 bg-white dark:bg-[#0C1322] text-slate-900 dark:text-gray-100 px-3 py-2.5 rounded-xl shadow-2xl border border-slate-100/90 flex items-center gap-2.5 animate-float max-w-[190px]">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t('home.hero.sponsored')}</div>
                  <div className="text-xs font-black text-gray-900 dark:text-gray-100">{t('home.hero.sponsoredValue')}</div>
                </div>
              </div>

              {/* FLOATING NOTIFICATION BUBBLE 4: Bottom-Right ($38.90 Total) */}
              <div className="absolute bottom-1 right-2 sm:right-0 z-30 bg-white dark:bg-[#0C1322] text-slate-900 dark:text-gray-100 px-3 py-2.5 rounded-xl shadow-2xl border border-slate-100/90 flex items-center gap-2.5 animate-float-delayed max-w-[180px]">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md font-black text-sm">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t('home.hero.balance')}</div>
                  <div className="text-xs font-black text-emerald-600">{t('home.hero.balanceValue')}</div>
                </div>
              </div>

              {/* THE SLEEK SMARTPHONE MOCKUP BODY */}
              <div className="relative w-[240px] sm:w-[270px] xl:w-[286px] h-[500px] sm:h-[545px] xl:h-[575px] rounded-[42px] border-[7px] sm:border-[8px] border-slate-800 bg-slate-950 p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(14,165,233,0.2)] ring-1 ring-white/20 transition-transform duration-500 hover:scale-[1.01]">
                
                {/* Dynamic Island pill */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111827] ring-1 ring-[#374151] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#1d4ed8]/70" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1f2937]" />
                </div>

                {/* Glossy screen glass reflection */}
                <div className="absolute -top-16 -left-16 w-60 h-60 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl pointer-events-none z-20" />

                {/* Smartphone Screen Content */}
                <div className="w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-b from-[#0e7490] via-[#047857] to-[#022c22] p-3.5 pt-10 flex flex-col justify-between text-white relative shadow-inner">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-1 text-[11px] font-bold text-white/90">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-white/80" />
                      <div className="w-4 h-2 rounded-sm border border-white/80 p-0.5 flex items-center">
                        <div className="w-full h-full bg-white rounded-[2px]" />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{t('home.hero.userName')}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        </div>
                        <div className="text-[10px] text-emerald-300 font-medium">{t('home.hero.userRole')}</div>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Wallet Balance Widget */}
                  <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 shadow-lg space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">{t('home.hero.availableBalance')}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {t('home.hero.todayGain')}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tight">
                      $38.90 <span className="text-xs text-gray-300 font-normal">USD</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex-1 bg-[#22C55E] text-[#07182F] font-black text-[10px] py-1.5 rounded-lg text-center shadow-md">
                        {t('home.hero.instantCashout')}
                      </div>
                      <div className="flex-1 bg-white/10 text-white font-bold text-[10px] py-1.5 rounded-lg text-center border border-white/10">
                        {t('home.hero.history')}
                      </div>
                    </div>
                  </div>

                  {/* Active Task Card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center">
                          <TikTokLogo className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-white">{t('home.hero.task1Title')}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-400">{t('home.hero.task1Reward')}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-gray-300">
                        <span>{t('home.hero.aiScanner')}</span>
                        <span className="text-emerald-400 font-bold">{t('home.hero.aiMatch')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#20C4E8] to-[#22C55E] rounded-full w-full" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-gray-300 pt-0.5">
                      <span className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('home.hero.approved')}</span>
                      </span>
                      <span className="font-mono text-gray-400 dark:text-gray-500">#CP-982</span>
                    </div>
                  </div>

                  {/* Second Task Preview */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-pink-500/30 flex items-center justify-center text-pink-300">
                        <InstagramLogo className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-white">{t('home.hero.task2Title')}</div>
                        <div className="text-[9px] text-gray-300">{t('home.hero.task2Meta')}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300">{t('home.hero.task2Reward')}</span>
                  </div>

                  {/* Phone Bottom Dock Pill */}
                  <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-2 flex items-center justify-around border border-white/10 text-white/70">
                    <div className="p-1 rounded-lg text-[#22C55E]">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="p-1 rounded-lg hover:text-white">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div className="p-1 rounded-lg hover:text-white">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          PLATFORM GUARANTEES STRIP — honest feature claims only.
          (Previously this held fabricated "As Seen On" press logos and made-up
          payout/user statistics; both are removed. Never re-add invented stats.)
         ========================================================================= */}
      <section className="bg-white dark:bg-[#0C1322] border-b border-gray-200/90 py-5 sm:py-6 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16B364] flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#101828] dark:text-gray-100">{t('home.strip.freeTitle')}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('home.strip.freeSub')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#168BFF] flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#101828] dark:text-gray-100">{t('home.strip.cashoutTitle')}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('home.strip.cashoutSub')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-purple-50 text-[#7357FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#101828] dark:text-gray-100">{t('home.strip.proofTitle')}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('home.strip.proofSub')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#101828] dark:text-gray-100">{t('home.strip.escrowTitle')}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('home.strip.escrowSub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live payout ticker removed: it displayed fabricated contributor names and
          withdrawal amounts labeled as a "Live Stream". Never re-add fake
          social proof. */}

      {/* =========================================================================
          3. HOW SOCIAL MEDIA EARNING WORKS (ELIMINATING EMPTY WHITE SPACE)
         ========================================================================= */}
      <section id="how-it-works" className="py-14 sm:py-16 bg-white dark:bg-[#0C1322] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2.5">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#168BFF] dark:bg-blue-500/15 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-500/30">
              {t('home.how.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-gray-100 tracking-tight">
              {t('home.how.title')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
              {t('home.how.sub')}
            </p>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {[
                { id: 'all', label: t('home.how.tabAll') },
                { id: 'instagram', label: 'Instagram' },
                { id: 'tiktok', label: 'TikTok' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'facebook', label: 'Facebook' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSocialTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedSocialTab === tab.id
                      ? 'bg-[#07182F] text-white shadow-md'
                      : 'glass text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Social Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="glass rounded-3xl p-6 sm:p-7 hover:border-[#168BFF]/50 transition-all hover:shadow-xl space-y-4 group relative overflow-hidden"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${card.accentColor} absolute top-0 left-0`} />

                  <div className="flex items-center justify-between pt-1">
                    <div className="p-3 rounded-2xl glass group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wide ${card.badgeColor}`}>
                      {card.tag}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{t('home.how.campaign', { platform: card.platform })}</span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mt-0.5 group-hover:text-[#168BFF] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase block">{t('home.how.rewardRange')}</span>
                      <span className="text-lg font-black text-[#16B364]">{card.reward}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase block">{t('home.how.avgTime')}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        {card.time}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      {card.slots}
                    </span>
                    <Link
                      to="/tasks"
                      className="font-bold text-[#168BFF] hover:underline flex items-center gap-1"
                    >
                      <span>{t('home.how.startTask')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Banner bottom */}
          <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-[#07182F] via-[#0D2342] to-[#07182F] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-lg font-black">{t('home.how.bannerTitle')}</h4>
              <p className="text-xs text-gray-300">{t('home.how.bannerSub')}</p>
            </div>
            <Link
              to="/contributor/register"
              className="px-8 py-3.5 bg-gradient-brand text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg hover:scale-105 transition-all shrink-0 flex items-center gap-2"
            >
              <span>{t('home.how.bannerCta')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. FREE SCROLLING VS BIZNETWORK (HIGH CONTRAST COMPARISON)
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#F7F9FC] dark:bg-[#0B0F19] border-y border-[#E4EAF2] dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#7357FF] dark:bg-purple-500/15 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              {t('home.compare.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-gray-100 tracking-tight">
              {t('home.compare.title')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('home.compare.sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Left: The Old Way (Free Scrolling) */}
            <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-8 border border-red-200/80 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold uppercase">
                  <span>{t('home.compare.oldTag')}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">{t('home.compare.oldTitle')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t('home.compare.oldText')}
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    t('home.compare.old1'),
                    t('home.compare.old2'),
                    t('home.compare.old3'),
                    t('home.compare.old4'),
                  ].map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">×</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/10 text-center text-xs font-bold text-red-600 bg-red-50/50 p-3 rounded-xl">
                {t('home.compare.oldResult')}
              </div>
            </div>

            {/* Right: The eBizEarn Way */}
            <div className="bg-[#07182F] text-white rounded-3xl p-8 shadow-2xl border border-white/15 space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#168BFF]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#16B364] text-xs font-extrabold uppercase border border-emerald-500/30">
                  <span>{t('home.compare.newTag')}</span>
                </div>
                <h3 className="text-2xl font-black text-white">{t('home.compare.newTitle')}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {t('home.compare.newText')}
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    t('home.compare.new1'),
                    t('home.compare.new2'),
                    t('home.compare.new3'),
                    t('home.compare.new4'),
                  ].map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#16B364] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-center text-xs font-extrabold text-[#20C4E8] bg-white/5 p-3 rounded-xl relative z-10">
                {t('home.compare.newResult')}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE INCOME CALCULATOR
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white dark:bg-[#0C1322]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#16B364] dark:bg-emerald-500/15 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {t('home.calc.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-gray-100 tracking-tight">
              {t('home.calc.title')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('home.calc.sub')}
            </p>
          </div>

          <div className="bg-[#F7F9FC] dark:bg-[#0B0F19] rounded-3xl p-6 sm:p-10 border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-8">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-800 dark:text-gray-200">
                  {t('home.calc.label')}
                </label>
                <span className="text-sm font-black text-[#168BFF] px-3 py-1 bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 rounded-xl shadow-xs">
                  {calculatorHours === 1 ? t('home.calc.hourOne', { n: calculatorHours }) : t('home.calc.hourMany', { n: calculatorHours })}
                </span>
              </div>
              
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={calculatorHours}
                onChange={(e) => setCalculatorHours(parseFloat(e.target.value))}
                className="w-full accent-[#168BFF] h-2.5 bg-gray-200 dark:bg-white/15 rounded-lg cursor-pointer"
              />
              
              <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 font-bold">
                <span>{t('home.calc.casual')}</span>
                <span>{t('home.calc.active')}</span>
                <span>{t('home.calc.power')}</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-[#07182F] text-white">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider block">{t('home.calc.weekly')}</span>
                <div className="text-3xl sm:text-4xl font-black text-[#20C4E8] mt-1">
                  ${(parseFloat(calculatedMonthly) / 4).toFixed(0)} USD
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">{t('home.calc.weeklyNote')}</span>
              </div>

              <div className="sm:border-l sm:border-white/10 sm:pl-6">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider block">{t('home.calc.monthly')}</span>
                <div className="text-3xl sm:text-4xl font-black text-[#16B364] mt-1">
                  ${calculatedMonthly} USD
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">{t('home.calc.monthlyNote')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('home.calc.footnote')}
              </span>
              <Link
                to="/contributor/register"
                className="px-7 py-3 bg-[#07182F] hover:bg-[#168BFF] text-white font-black text-xs rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <span>{t('home.calc.cta')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. FOR BUSINESSES & BRANDS BANNER
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#07182F] text-white relative overflow-hidden border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#20C4E8] text-xs font-bold uppercase tracking-wider border border-white/15">
                {t('home.biz.badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
                {t('home.biz.title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                {t('home.biz.sub')}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/business/register"
                  className="px-7 py-3.5 bg-gradient-brand text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>{t('home.biz.cta1')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/business/login"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
                >
                  {t('home.biz.cta2')}
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
                >
                  {t('home.biz.cta3')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md space-y-3">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{t('home.biz.statsTitle')}</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-gray-300">{t('home.biz.stat1Label')}</span>
                  <span className="font-bold text-[#16B364]">{t('home.biz.stat1Value')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-gray-300">{t('home.biz.stat2Label')}</span>
                  <span className="font-bold text-white">{t('home.biz.stat2Value')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-gray-300">{t('home.biz.stat3Label')}</span>
                  <span className="font-bold text-[#20C4E8]">{t('home.biz.stat3Value')}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-300">{t('home.biz.stat4Label')}</span>
                  <span className="font-bold text-white">{t('home.biz.stat4Value')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          7. TRUST & FREQUENTLY ASKED QUESTIONS
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white dark:bg-[#0C1322]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#168BFF] dark:bg-blue-500/15 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              {t('home.faq.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-gray-100 tracking-tight">
              {t('home.faq.title')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('home.faq.sub')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#F7F9FC] dark:bg-[#0B0F19] rounded-2xl border border-[#E4EAF2] dark:border-white/10 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 hover:text-[#168BFF] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#168BFF] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#168BFF]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. LATEST FROM THE BLOG (renders nothing until writers publish)
         ========================================================================= */}
      <BlogStrip />

      {/* =========================================================================
          8. FINAL CALL TO ACTION BANNER
         ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#07182F] text-white relative overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold text-[#20C4E8] border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('home.cta.badge')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {t('home.cta.title')}
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            {t('home.cta.sub')}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/contributor/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-brand text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>{t('home.cta.primary')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/tasks"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
            >
              {t('home.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      <RequestDemoModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
