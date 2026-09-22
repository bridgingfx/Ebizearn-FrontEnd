import React, { useEffect, useMemo, useState } from 'react';
import { Gift, Copy, Check, Users, ShieldCheck, AlertCircle, Layers } from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { money } from '../../utils/apiMappers';
import type { ReferralsData } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

const statusLabels: Record<string, { label: string; className: string }> = {
  rewarded: { label: 'Rewarded', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  qualified: { label: 'Qualified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending_tasks: { label: 'Awaiting activity', className: 'bg-amber-50 text-amber-700 border-amber-200' },
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

  /** Level breakdown, when the backend provides `level` on referral rows. */
  const levelStats = useMemo(() => {
    if (!data) return null;
    const withLevel = data.referrals.filter((r) => typeof r.level === 'number');
    if (withLevel.length === 0) return null;
    return [1, 2, 3].map((lvl) => ({
      level: lvl,
      count: withLevel.filter((r) => r.level === lvl).length,
      earned: withLevel.filter((r) => r.level === lvl).reduce((s, r) => s + (r.reward_cents || 0), 0),
    }));
  }, [data]);

  const rewardPerReferral = data ? money(data.reward_per_referral_cents, 'USD') : '—';

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#101828]">Invite Friends &amp; Earn</h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Share your referral link. Earn {rewardPerReferral} when your friend completes their first verified task.
          Rewards are credited to your wallet only after the platform's qualification rules are met — never estimated.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E7ECF3] p-6 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchReferrals}
            className="mt-3 px-5 py-2 rounded-xl bg-[#07182F] text-white text-xs font-bold hover:bg-[#168BFF] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* Referral link card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E7ECF3] shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-[#7357FF] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Your referral link</h3>
                <p className="text-xs text-gray-500">
                  Code <span className="font-black text-gray-900 font-mono">{data.referral_code}</span> · free to join, no purchase required
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={data.referral_link}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-2.5 bg-[#07182F] hover:bg-[#168BFF] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-[#16B364]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total referred', value: String(data.total_referred), tint: 'bg-blue-50 text-blue-700', icon: Users },
              { label: 'Qualified', value: String(data.qualified_referrals), tint: 'bg-emerald-50 text-emerald-700', icon: ShieldCheck },
              { label: 'Referral earnings', value: money(data.total_earned_cents), tint: 'bg-violet-50 text-violet-700', icon: Gift },
              { label: 'Per referral', value: rewardPerReferral, tint: 'bg-amber-50 text-amber-700', icon: Layers },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-3xl border border-[#E7ECF3] p-4">
                  <div className={`w-9 h-9 rounded-2xl ${s.tint} flex items-center justify-center mb-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
                  <p className="text-lg font-black text-gray-900 mt-0.5">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* 3-level breakdown */}
          <div className="bg-white rounded-3xl border border-[#E7ECF3] p-5 sm:p-6">
            <h3 className="text-sm font-black text-gray-900 mb-1">Affiliate levels</h3>
            <p className="text-[11px] text-gray-500 mb-4">
              Three earning levels: direct invites (L1), their invites (L2), and the next tier (L3). Only qualified activity earns.
            </p>
            {levelStats ? (
              <div className="grid sm:grid-cols-3 gap-3">
                {levelStats.map((l) => (
                  <div key={l.level} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Level {l.level}</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{l.count} referral{l.count === 1 ? '' : 's'}</p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">{money(l.earned)} earned</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
                <p className="text-[11px] text-gray-500">
                  Level-by-level breakdown isn't available from the API yet — totals above are real and current.
                  Multi-level detail will appear here automatically once the backend ships it.
                </p>
              </div>
            )}
          </div>

          {/* Referred list */}
          <div>
            <h3 className="text-sm font-black text-gray-900 mb-3">Your referrals</h3>
            {data.referrals.length === 0 ? (
              <EmptyState
                title="No referrals yet"
                description="Nobody has joined with your link yet. When a friend signs up and completes their first verified task, they'll appear here with the reward you earned."
                icon={Users}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-[#E7ECF3] divide-y divide-gray-100 overflow-hidden">
                {data.referrals.map((r) => {
                  const st = statusLabels[r.status] || { label: r.status.replace(/_/g, ' '), className: 'bg-gray-100 text-gray-600 border-gray-200' };
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#07182F] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                        {(r.referred_user?.name || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {r.referred_user?.name || 'New member'}
                          {typeof r.level === 'number' && (
                            <span className="ml-2 text-[10px] font-black text-violet-600">L{r.level}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Joined {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${st.className}`}>{st.label}</span>
                      <p className={`text-xs font-black shrink-0 ${r.reward_cents > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {r.reward_cents > 0 ? `+${money(r.reward_cents)}` : money(0)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
