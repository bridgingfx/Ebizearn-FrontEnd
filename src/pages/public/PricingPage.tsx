import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Minus,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Megaphone,
  Rocket,
  TrendingUp,
  Crown,
  Play,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Currency = 'AED' | 'USD';

const USD_RATE = 3.6725; // AED peg

interface Tier {
  id: string;
  name: string;
  tagline: string;
  aed: number;
  tasks: number;
  popular?: boolean;
  icon: React.ReactNode;
  accent: string; // hex
  glow: string; // gradient css
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: 'launch',
    name: 'Launch',
    tagline: 'Get seen. Get followed.',
    aed: 1499,
    tasks: 2000,
    icon: <Rocket className="w-5 h-5" />,
    accent: '#10B981',
    glow: 'linear-gradient(135deg, #10B981, #34D399)',
    features: [
      '2,000 managed tasks / month',
      'Likes, shares, followers & posting',
      'Digital marketing management',
      'Social media reach & impressions',
      'Referral marketing',
      'Organic lead generation',
      'Reporting for every project',
      '10 custom posters — 1 every day, with content',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Look bigger, every single week.',
    aed: 2499,
    tasks: 3500,
    icon: <TrendingUp className="w-5 h-5" />,
    accent: '#168BFF',
    glow: 'linear-gradient(135deg, #168BFF, #38BDF8)',
    features: [
      'Everything in Launch',
      '3,500 managed tasks / month',
      '3 reels',
      '7 social media images',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Own the feed.',
    aed: 3499,
    tasks: 5000,
    popular: true,
    icon: <Megaphone className="w-5 h-5" />,
    accent: '#7257FF',
    glow: 'linear-gradient(135deg, #7257FF, #B388FF)',
    features: [
      'Everything in Growth',
      '5,000 managed tasks / month',
      '5 videos',
      '8 posters',
      'Influencer-network accounts posting your content for maximum reach',
    ],
  },
  {
    id: 'dominance',
    name: 'Dominance',
    tagline: 'Become the voice of your market.',
    aed: 5000,
    tasks: 7500,
    icon: <Crown className="w-5 h-5" />,
    accent: '#D4A017',
    glow: 'linear-gradient(135deg, #F5C518, #D4A017)',
    features: [
      'Everything in Scale',
      '7,500 managed tasks / month',
      'Your own company podcast episode — produced for you',
    ],
  },
];

const price = (aed: number, c: Currency) =>
  c === 'AED' ? `${aed.toLocaleString('en-US')} AED` : `$${Math.round(aed / USD_RATE).toLocaleString('en-US')}`;

const MARQUEE = [
  'Managed tasks', 'Likes & shares', 'Followers', 'Reels', 'Posters', 'Videos',
  'Influencer network', 'Podcasts', 'Organic leads', 'Impressions', 'Reporting',
];

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Reveal-on-scroll: adds .in when the element enters the viewport.
 *  Includes an immediate rect check so content already in view can never get stuck hidden. */
function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };
    if (inView()) {
      el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/** Count-up number when scrolled into view (runs immediately if already visible). */
const CountUp: React.FC<{ to: number; className?: string }> = ({ to, className }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
      run();
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString('en-US')}
    </span>
  );
};

/** Word-by-word hero headline reveal. `gradient` paints each word with the gradient (avoids bg-clip-text + filter issues). */
const RevealWords: React.FC<{ text: string; className?: string; gradient?: boolean }> = ({ text, className, gradient }) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((w, i) => (
      <span
        key={i}
        className={`rw${gradient ? ' bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent' : ''}`}
        style={{ animationDelay: `${i * 70}ms` }}
        aria-hidden="true"
      >
        {w}
        {i < text.split(' ').length - 1 ? '\u00A0' : ''}
      </span>
    ))}
  </span>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const PricingPage: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('AED');
  const cardsRef = useReveal<HTMLDivElement>();
  const tableRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F19] font-sans text-start">
      <style>{`
        .rw { display: inline-block; opacity: 0; transform: translateY(14px); filter: blur(6px); animation: rwIn .7s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes rwIn { to { opacity: 1; transform: none; filter: blur(0); } }
        .blob { position: absolute; border-radius: 9999px; filter: blur(90px); opacity: .5; animation: drift 14s ease-in-out infinite alternate; will-change: transform; }
        @keyframes drift { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(40px,-30px,0) scale(1.15); } }
        .reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
        .reveal.in { opacity: 1; transform: none; }
        .reveal.in .stagger > * { animation: cardIn .6s cubic-bezier(.22,1,.36,1) both; }
        .reveal.in .stagger > *:nth-child(1) { animation-delay: .05s; }
        .reveal.in .stagger > *:nth-child(2) { animation-delay: .15s; }
        .reveal.in .stagger > *:nth-child(3) { animation-delay: .25s; }
        .reveal.in .stagger > *:nth-child(4) { animation-delay: .35s; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(30px) scale(.98); } to { opacity: 1; transform: none; } }
        .marquee-track { display: flex; gap: 2.5rem; width: max-content; animation: marquee 26s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        .price-swap { display: inline-block; animation: priceIn .35s cubic-bezier(.22,1,.36,1); }
        @keyframes priceIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .tier-card { transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease; }
        .tier-card:hover { transform: translateY(-6px); }
        .tier-card:active { transform: scale(.97); }
        @media (pointer: fine) {
          .tilt { transform-style: preserve-3d; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rw, .blob, .marquee-track, .price-swap { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
          .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section className="relative bg-[#07182F] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="blob w-[420px] h-[420px] -top-32 -left-24" style={{ background: '#168BFF55' }} />
          <div className="blob w-[380px] h-[380px] top-10 right-[-80px]" style={{ background: '#7257FF55', animationDelay: '-5s' }} />
          <div className="blob w-[300px] h-[300px] bottom-[-120px] left-1/3" style={{ background: '#10B98144', animationDelay: '-9s' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 120%, transparent 40%, #07182F 78%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 sm:pt-36 pb-14 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase text-white/80 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Managed growth packages
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">
            <RevealWords text="Your entire social engine," />
            <br />
            <RevealWords text="managed for you." gradient />
          </h1>
          <p className="max-w-2xl mx-auto text-white/70 text-base sm:text-lg leading-relaxed mb-8">
            Real people doing real tasks — likes, shares, followers, posts — plus the content to fuel it:
            posters, reels, videos, influencer reach, even your own podcast. Pick a package, we run everything.
          </p>

          {/* Currency toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/10 border border-white/15 backdrop-blur">
            {(['AED', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 min-h-[40px] ${
                  currency === c ? 'bg-white text-[#07182F] shadow' : 'text-white/70 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">
            {currency === 'AED' ? 'Billed monthly in UAE dirhams.' : 'For global clients — converted at 3.6725 AED / USD.'}
          </p>
        </div>

        {/* Marquee */}
        <div className="relative border-t border-white/10 py-4 overflow-hidden" aria-hidden="true">
          <div className="marquee-track text-white/50 text-sm font-bold tracking-widest uppercase">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-10">
                {m} <span className="text-amber-300/70">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TIER CARDS ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-2 pt-14 sm:pt-20 pb-8">
        <div ref={cardsRef} className="reveal">
          <div className="stagger grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {TIERS.map((t) => (
              <article
                key={t.id}
                className={`tier-card tilt relative flex flex-col rounded-3xl p-6 sm:p-7 overflow-hidden ${
                  t.popular
                    ? 'bg-[#0C1B33] text-white shadow-2xl shadow-violet-900/30 ring-2 ring-violet-400/60 xl:-translate-y-3'
                    : 'bg-white dark:bg-[#101828] shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/70 dark:border-white/10'
                }`}
              >
                {/* top glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ background: t.glow }}
                  aria-hidden="true"
                />
                {t.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-[#0C1B33] bg-gradient-to-r from-amber-200 to-amber-400 shadow">
                    Most popular
                  </div>
                )}

                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
                  style={{ background: t.glow }}
                >
                  {t.icon}
                </div>
                <h3 className={`text-xl font-black ${t.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {t.name}
                </h3>
                <p className={`text-sm mt-0.5 mb-4 ${t.popular ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}`}>
                  {t.tagline}
                </p>

                <div className="mb-1">
                  <span
                    key={currency}
                    className={`price-swap text-3xl sm:text-4xl font-black tracking-tight ${
                      t.popular ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {price(t.aed, currency)}
                  </span>
                  <span className={`text-sm ${t.popular ? 'text-white/50' : 'text-slate-400'}`}> / month</span>
                </div>
                <div
                  className="text-sm font-bold mb-5"
                  style={{ color: t.popular ? t.accent : undefined }}
                >
                  <span className={t.popular ? '' : 'text-slate-700 dark:text-slate-300'}>
                    <CountUp to={t.tasks} /> managed tasks
                  </span>
                  {!t.popular && <span style={{ color: t.accent }}> ●</span>}
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${t.accent}22`, color: t.accent }}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                      <span className={t.popular ? 'text-white/85' : 'text-slate-600 dark:text-slate-300'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/business/register?plan=${t.id}`}
                  className={`block text-center min-h-[48px] leading-[48px] rounded-2xl font-bold text-sm text-white shadow-lg transition-transform active:scale-[.97] ${
                    t.popular ? '' : 'hover:brightness-110'
                  }`}
                  style={{
                    background: t.popular ? 'linear-gradient(135deg,#7257FF,#B388FF)' : t.glow,
                    boxShadow: `0 10px 30px -8px ${t.accent}66`,
                  }}
                >
                  Choose {t.name} <ArrowRight className="inline w-4 h-4 -mt-0.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          All packages are managed end-to-end by our team · Cancel anytime · Prices exclude VAT where applicable
        </p>
      </section>

      {/* ================= COMPARISON TABLE ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div ref={tableRef} className="reveal">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
              Compare every package
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              One glance, zero guesswork. Everything included in each tier, side by side.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/70 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#101828]">
            <table className="w-full min-w-[760px] text-sm border-collapse">
              <thead>
                <tr className="bg-[#07182F] text-white">
                  <th className="sticky left-0 bg-[#07182F] text-left p-4 font-bold min-w-[220px] z-10">What's included</th>
                  {TIERS.map((t) => (
                    <th key={t.id} className="p-4 text-center min-w-[150px]">
                      <div className="flex items-center justify-center gap-1.5 font-black">
                        <span style={{ color: t.accent }}>{t.icon}</span> {t.name}
                      </div>
                      <div key={currency} className="price-swap text-xs font-bold text-white/60 mt-1">
                        {price(t.aed, currency)}/mo
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label="Managed tasks / month" values={['2,000', '3,500', '5,000', '7,500']} bold />
                <ComparisonRow label="Likes, shares, followers & posting" values={[true, true, true, true]} />
                <ComparisonRow label="Digital marketing management" values={[true, true, true, true]} />
                <ComparisonRow label="Social media reach & impressions" values={[true, true, true, true]} />
                <ComparisonRow label="Referral marketing" values={[true, true, true, true]} />
                <ComparisonRow label="Organic lead generation" values={[true, true, true, true]} />
                <ComparisonRow label="Reporting for every project" values={[true, true, true, true]} />
                <ComparisonRow label="Custom posters (with content)" values={['10 · 1/day', '17 total', '25 total', '25 total']} />
                <ComparisonRow label="Reels" values={[false, '3', '3', '3']} />
                <ComparisonRow label="Videos" values={[false, false, '5', '5']} />
                <ComparisonRow label="Influencer-network posting for max reach" values={[false, false, true, true]} />
                <ComparisonRow label="Company podcast episode" values={[false, false, false, true]} />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div ref={ctaRef} className="reveal">
          <div className="relative overflow-hidden rounded-3xl bg-[#07182F] text-white px-6 py-12 sm:p-14 text-center">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="blob w-[360px] h-[360px] -top-24 left-1/4" style={{ background: '#7257FF55' }} />
              <div className="blob w-[300px] h-[300px] -bottom-20 right-1/4" style={{ background: '#168BFF55', animationDelay: '-6s' }} />
            </div>
            <div className="relative">
              <BadgeCheck className="w-10 h-10 mx-auto mb-4 text-emerald-300" />
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                Not sure which fits?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                Tell us your goal — product launch, brand awareness, or pure reach — and we'll
                recommend the package that gets you there fastest. Free 15-minute consult.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 rounded-2xl font-bold text-sm text-[#07182F] bg-white hover:bg-slate-100 shadow-xl transition-transform active:scale-[.97]"
                >
                  <Play className="w-4 h-4" /> Book a free consult
                </Link>
                <Link
                  to="/business/register?plan=scale"
                  className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 rounded-2xl font-bold text-sm text-white border border-white/25 hover:bg-white/10 transition-all active:scale-[.97]"
                >
                  Start with Scale <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const ComparisonRow: React.FC<{ label: string; values: (string | boolean)[]; bold?: boolean }> = ({
  label,
  values,
  bold,
}) => (
  <tr className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/70 dark:hover:bg-white/[.02] transition-colors">
    <th className="sticky left-0 bg-white dark:bg-[#101828] text-left p-4 font-semibold text-slate-700 dark:text-slate-200 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
      {label}
    </th>
    {values.map((v, i) => (
      <td key={i} className={`p-4 text-center ${bold ? 'font-black text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
        {v === true ? (
          <span className="inline-flex w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 items-center justify-center">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
        ) : v === false ? (
          <Minus className="inline w-4 h-4 text-slate-300 dark:text-slate-600" />
        ) : (
          v
        )}
      </td>
    ))}
  </tr>
);
