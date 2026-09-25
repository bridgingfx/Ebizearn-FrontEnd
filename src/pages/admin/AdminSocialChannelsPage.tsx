import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { staffSocialChannelsApi, getApiError } from '../../api';
import type { SocialChannel, SocialChannelStatus, SocialPlatform } from '../../api';
import { PageHeader } from '../../components/common/ui';
import { InstagramLogo, TikTokLogo, YouTubeLogo, FacebookLogo, XTwitterLogo } from '../../components/common/PlatformIcons';
import { toast } from '../../utils/toast';

type Filter = SocialChannelStatus | 'all';

const PLATFORM_META: Record<SocialPlatform, { name: string; icon: React.FC<{ className?: string }> }> = {
  instagram: { name: 'Instagram', icon: InstagramLogo },
  tiktok: { name: 'TikTok', icon: TikTokLogo },
  youtube: { name: 'YouTube', icon: YouTubeLogo },
  facebook: { name: 'Facebook', icon: FacebookLogo },
  x: { name: 'X (Twitter)', icon: XTwitterLogo },
};

const STATUS_STYLES: Record<SocialChannelStatus, string> = {
  unverified: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300',
  pending: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
  verified: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300',
};

/** Staff queue: check the code in each channel's bio, then verify or reject. */
export const AdminSocialChannelsPage: React.FC = () => {
  const [rows, setRows] = useState<SocialChannel[]>([]);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [followers, setFollowers] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffSocialChannelsApi.list({ status: filter, search: debounced || undefined });
      setRows(res.data);
      setPendingCount(res.meta.pending);
    } catch (err) {
      setError(getApiError(err, 'Could not load social channels.'));
    } finally {
      setLoading(false);
    }
  }, [filter, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (c: SocialChannel, decision: 'approve' | 'reject') => {
    if (decision === 'reject' && !reason.trim()) {
      toast.error('Give the contributor a reason.');
      return;
    }
    setBusy(c.id);
    try {
      const f = followers[c.id];
      await staffSocialChannelsApi.decide(c.id, decision, {
        reason: decision === 'reject' ? reason.trim() : undefined,
        followers: f !== undefined && f !== '' ? Number(f) : undefined,
      });
      toast.success(decision === 'approve' ? `@${c.handle} verified.` : `@${c.handle} rejected.`);
      setRejecting(null);
      setReason('');
      await load();
    } catch (err) {
      toast.error(getApiError(err, 'Could not save the decision.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Channels"
        subtitle="Contributors prove each channel is theirs by adding a code to its bio. Open the profile, check the code is there, then verify."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['pending', 'verified', 'rejected', 'unverified', 'all'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  filter === f ? 'bg-[#07182F] dark:bg-[#168BFF] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
                }`}
              >
                {f === 'unverified' ? 'Not submitted' : f}
                {f === 'pending' && pendingCount !== null && <span className="ml-1.5 opacity-70">{pendingCount}</span>}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handle, name or email"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-red-600 dark:text-red-400 font-semibold">{error}</div>
        ) : loading && rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin inline-block" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
            {filter === 'pending' ? 'No channels are waiting for review.' : 'No channels found.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {rows.map((c) => {
              const meta = PLATFORM_META[c.platform];
              const Icon = meta.icon;
              return (
                <li key={c.id} className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={c.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-900 dark:text-gray-100 hover:text-[#168BFF] inline-flex items-center gap-1">
                            @{c.handle} <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">{meta.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[c.status]}`}>
                            {c.status === 'unverified' ? 'Not submitted' : c.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {c.user ? (
                            <Link to={`/admin/users/${c.user.id}`} className="hover:text-[#168BFF]">
                              {c.user.name} · {c.user.email}
                            </Link>
                          ) : (
                            '—'
                          )}
                          {c.followers !== null && ` · ${c.followers.toLocaleString()} followers (self-reported)`}
                        </p>
                        {c.rejection_reason && c.status === 'rejected' && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">Reason: {c.rejection_reason}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:justify-end">
                      <div className="text-xs">
                        <span className="block text-[10px] font-bold uppercase text-gray-400">Code in bio</span>
                        <span className="font-mono font-bold tracking-wider text-sm text-gray-900 dark:text-gray-100">{c.verification_code}</span>
                      </div>

                      {c.status === 'pending' && rejecting !== c.id && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={followers[c.id] ?? ''}
                            onChange={(e) => setFollowers((f) => ({ ...f, [c.id]: e.target.value }))}
                            placeholder="Followers"
                            title="Correct the follower count if needed"
                            className="w-28 h-9 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                          />
                          <button
                            type="button"
                            onClick={() => decide(c, 'approve')}
                            disabled={busy === c.id}
                            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {busy === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejecting(c.id);
                              setReason('');
                            }}
                            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 inline-flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {rejecting === c.id && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason, e.g. The code is not in the bio."
                        className="flex-1 h-9 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => decide(c, 'reject')} disabled={busy === c.id} className="h-9 px-3.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                          Confirm reject
                        </button>
                        <button type="button" onClick={() => setRejecting(null)} className="h-9 px-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
