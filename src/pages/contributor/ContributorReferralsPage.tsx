import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Copy,
  Check,
  Users,
  ShieldCheck,
  AlertCircle,
  Layers,
  Share2,
  UserPlus,
  BadgeDollarSign,
  ArrowRight,
  Network,
} from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { money } from '../../utils/apiMappers';
import type { ReferralsData } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard, SectionHeader } from '../../components/common/StatCard';

const statusLabels: Record<string, { label: string; className: string }> = {
  rewarded: { label: 'Rewarded', className: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' },
  qualified: { label: 'Qualified', className: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' },
  pending: { label: 'Pending', className: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' },
  pending_tasks: { label: 'Awaiting activity', className: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' },
};

const LEVEL_INFO = [
  { level: 1, title: 'Direct invites', desc: 'Friends who join with your link.', gradient: 'from-[#168BFF] to-[#20C4E8]', shadow: 'shadow-blue-500/25' },
  { level: 2, title: 'Second circle', desc: 'People invited by your direct invites.', gradient: 'from-[#7257FF] to-[#9D7BFF]', shadow: 'shadow-violet-500/25' },
  { level: 3, title: 'Extended network', desc: 'The next tier of the network.', gradient: 'from-[#16B364] to-[#0EA968]', shadow: 'shadow-emerald-500/25' },
];

/** Share row: native share sheet when available, plus direct X / Telegram / WhatsApp links. */
const ShareButtons: React.FC<{ link: string }> = ({ link }) => {
  const [shared, setShared] = useState(false);
  const text = 'I’m earning real cash completing small tasks on eBizEarn — it’s free to join. Use my link:';
  const encodedLink = encodeURIComponent(link);
  const encodedText = encodeURIComponent(`${text} ${link}`);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: 'eBizEarn referral', text, url: link });
    } catch {
      // User dismissed the sheet — not an error.
    } finally {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const channels = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
      cls: 'bg-black text-white hover:bg-[#1d1d1f]',
      glyph: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.4l7.3-8.3L1.5 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7 3.8H5.2l12.6 16.3z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(text)}`,
      cls: 'bg-[#229ED9] text-white hover:bg-[#1b8ec4]',
      glyph: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M21.9 4.6 2.8 12.1c-.8.3-.8 1.4.1 1.6l4.7 1.5 1.8 5.6c.3.8 1.3.9 1.8.2l2.6-3.2 4.9 3.6c.6.5 1.6.1 1.8-.7l3.4-14.1c.2-1-.9-1.8-1.9-1.4zM8.6 13.6l9.8-7.5c.2-.1.4.2.2.3l-8.1 8.9-.3 3-1.6-4.7z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}`,
      cls: 'bg-[#25D366] text-white hover:bg-[#1fb857]',
      glyph: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.7-1.3 1.4-1.9 1.5-.5 0-1.1.2-3.6-.8-3-1.2-4.9-4.2-5.1-4.4-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.2 0 .4l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Share via</span>
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] text-white text-sm font-extrabold shadow-md hover:brightness-105 transition-all"
        >
          <Share2 className="w-4 h-4" />
          {shared ? 'Shared!' : 'Share…'}
        </button>
      )}
      {channels.map((c) => (
        <a
          key={c.name}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share your referral link on ${c.name}`}
          className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-extrabold transition-all ${c.cls}`}
        >
          {c.glyph}
          {c.name}
        </a>
      ))}
    </div>
  );
};

export const ContributorReferralsPage: React.FC = () => {
  const [data, setData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.referrals();
      if (res.success) {
        setData(res.data);
      } else {
        setError('Could not load your referral data.');
      }
    } catch (err) {
      setError(getApiError(err, 'Could not load your referral data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!data?.referral_link) return;
    try {
      await navigator.clipboard.writeText(data.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — user can select the text manually
    }
  };

  /** Level breakdown from the backend's per-level `by_level` stats. */
  const levelStats = useMemo(() => {
    if (!data?.by_level) return null;
    return [1, 2, 3].map((lvl) => {
      const st = data.by_level[lvl];
      return {
        level: lvl,
        count: st?.total ?? 0,
        earned: (data.referrals || []).filter((r) => r.level === lvl).reduce((s, r) => s + (r.reward_cents || 0), 0),
      };
    });
  }, [data]);

  /** Qualified referrals = rows the backend marked rewarded across all levels. */
  const qualifiedReferrals = useMemo(() => {
    if (!data?.by_level) return 0;
    return Object.values(data.by_level).reduce((s, st) => s + (st?.rewarded ?? 0), 0);
  }, [data]);

  /** Level-1 direct reward: what you earn when a friend completes their first verified task. */
  const rewardPerReferral = data?.by_level?.[1]?.reward_cents != null ? money(data.by_level[1].reward_cents, 'USD') : '—';

  return (
    <div className="space-y-8 text-left">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-navy-gradient p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#7257FF]/35 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-[#16B364]/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] bg-white/10 border border-white/15 text-[#20C4E8] px-3.5 py-1.5 rounded-full">
            <Gift className="w-3.5 h-3.5" /> Referral program
          </span>
          <h1 className="mt-3 text-2xl sm:text-[2rem] font-black tracking-tight leading-tight">
            Invite friends, earn together
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-300 max-w-xl">
            Share your link and earn <span className="font-extrabold text-white">{rewardPerReferral}</span> when
            a friend completes their first verified task. Rewards land in your wallet only after
            qualification — never estimated.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 p-6 animate-pulse">
          <div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-1/3 mb-4" />
          <div className="h-[52px] bg-slate-100 dark:bg-white/10 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-[1.5rem] p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={fetchReferrals}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#07182F] text-white text-sm font-bold hover:bg-[#168BFF] transition-colors min-h-[48px]"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* ── Referral link card ────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0C1322] rounded-[1.75rem] p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 card-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7257FF] to-[#9D7BFF] shadow-lg shadow-violet-500/25 flex items-center justify-center shrink-0">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-900 dark:text-gray-100 tracking-tight">Your referral link</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
                  Code <span className="font-black text-slate-900 dark:text-gray-100 font-mono tracking-wide">{data.referral_code}</span>
                  {' · '}free to join, no purchase required
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={data.referral_link}
                onFocus={(e) => e.target.select()}
                aria-label="Your referral link"
                className="flex-1 min-h-[54px] px-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-sm sm:text-base font-mono text-slate-700 dark:text-gray-300 select-all focus:outline-none focus:border-[#7257FF]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`min-h-[54px] px-7 rounded-2xl text-base font-extrabold transition-all flex items-center justify-center gap-2 shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-[#07182F] hover:bg-[#168BFF] text-white shadow-lg'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
            </div>

            <ShareButtons link={data.referral_link} />
          </div>

          {/* ── Stats ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total referred" value={String(data.total_referred)} icon={Users} gradient="from-[#168BFF] to-[#20C4E8]" shadow="shadow-lg shadow-blue-500/25" />
            <StatCard label="Qualified" value={String(qualifiedReferrals)} sub="Met qualification rules" icon={ShieldCheck} gradient="from-emerald-500 to-teal-600" shadow="shadow-lg shadow-emerald-500/25" />
            <StatCard label="Referral earnings" value={money(data.total_earned_cents)} icon={BadgeDollarSign} gradient="from-[#7257FF] to-[#9D7BFF]" shadow="shadow-lg shadow-violet-500/25" />
            <StatCard label="Per referral" value={rewardPerReferral} icon={Layers} gradient="from-amber-500 to-orange-600" shadow="shadow-lg shadow-amber-500/25" />
          </div>

          {/* ── 3-level tree visualization ────────────────────────── */}
          <div className="bg-white dark:bg-[#0C1322] rounded-[1.75rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-[#168BFF]/10 text-[#168BFF] flex items-center justify-center">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-gray-100 tracking-tight">Three earning levels</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400">Your network pays three tiers deep. Only qualified activity earns.</p>
              </div>
            </div>

            <div className="mt-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#168BFF]/30 via-[#7257FF]/30 to-[#16B364]/30" />
              <div className="grid sm:grid-cols-3 gap-4">
                {LEVEL_INFO.map((lvl) => {
                  const stat = levelStats?.find((s) => s.level === lvl.level);
                  return (
                    <div key={lvl.level} className="relative rounded-3xl border-2 border-slate-100 dark:border-white/10 bg-[#F8FAFD] dark:bg-white/5 p-5 text-center hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                      <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${lvl.gradient} shadow-lg ${lvl.shadow} flex items-center justify-center`}>
                        <span className="text-2xl font-black text-white">L{lvl.level}</span>
                      </div>
                      <p className="mt-3 text-base font-extrabold text-slate-900 dark:text-gray-100">{lvl.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{lvl.desc}</p>
                      {stat ? (
                        <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-white/10">
                          <p className="text-xl font-black text-slate-900 dark:text-gray-100">
                            {stat.count} <span className="text-xs font-bold text-slate-400 dark:text-gray-500">referral{stat.count === 1 ? '' : 's'}</span>
                          </p>
                          <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{money(stat.earned)} earned</p>
                        </div>
                      ) : (
                        <p className="mt-3 pt-3 border-t border-slate-200/70 dark:border-white/10 text-xs font-bold text-slate-400 dark:text-gray-500">
                          {levelStats ? 'No referrals at this level yet' : 'Live counts appear once the backend ships level data'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── How it works ──────────────────────────────────────── */}
          <div>
            <SectionHeader title="How it works" subtitle="Three steps to referral earnings." />
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Share2, step: '1', title: 'Share your link', desc: 'Send your unique link to friends, groups, and communities.', gradient: 'from-[#168BFF] to-[#20C4E8]', shadow: 'shadow-blue-500/25' },
                { icon: UserPlus, step: '2', title: 'They join free', desc: 'Friends sign up free and complete their first verified task.', gradient: 'from-[#7257FF] to-[#9D7BFF]', shadow: 'shadow-violet-500/25' },
                { icon: BadgeDollarSign, step: '3', title: 'You earn', desc: 'Your reward is credited to your wallet after qualification.', gradient: 'from-[#16B364] to-[#0EA968]', shadow: 'shadow-emerald-500/25' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 dark:text-gray-500">Step {s.step}</p>
                    <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-gray-100">{s.title}</p>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Earnings history ──────────────────────────────────── */}
          <div>
            <SectionHeader title="Referral history" subtitle="Everyone who joined with your link." />
            {data.referrals.length === 0 ? (
              <EmptyState
                title="No referrals yet"
                description="Nobody has joined with your link yet. When a friend signs up and completes their first verified task, they'll appear here with the reward you earned."
                icon={Users}
              />
            ) : (
              <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow divide-y divide-slate-100 overflow-hidden">
                {data.referrals.map((r) => {
                  const st = statusLabels[r.status] || { label: r.status.replace(/_/g, ' '), className: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10' };
                  return (
                    <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-[#07182F] text-white flex items-center justify-center text-sm font-black shrink-0">
                        {(r.referred_user?.name || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-gray-100 truncate">
                          {r.referred_user?.name || 'New member'}
                          {typeof r.level === 'number' && (
                            <span className="ml-2 text-[10px] font-black text-white bg-[#7257FF] px-2 py-0.5 rounded-full">L{r.level}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                          Joined {(() => {
                            const joinedAt = r.referred_user?.joined_at || r.qualified_at;
                            return joinedAt
                              ? new Date(joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'recently';
                          })()}
                        </p>
                      </div>
                      <span className={`hidden sm:inline-block text-[11px] font-black px-3 py-1.5 rounded-full border ${st.className}`}>{st.label}</span>
                      <p className={`text-base font-black shrink-0 ${r.reward_cents > 0 ? 'text-emerald-600' : 'text-slate-300 dark:text-gray-600'}`}>
                        {r.reward_cents > 0 ? `+${money(r.reward_cents)}` : money(0)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wallet CTA */}
          <Link
            to="/app/wallet"
            className="group flex items-center gap-4 rounded-[1.75rem] bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-500/30 p-5 sm:p-6 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#16B364] to-[#0EA968] shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
              <BadgeDollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-extrabold text-emerald-900">Referral earnings land in your wallet</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">Qualified rewards are credited automatically — withdraw from $50.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </>
      ) : null}
    </div>
  );
};
