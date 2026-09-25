import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Clock, Copy, ExternalLink, Loader2, Pencil, Plus, Trash2, X, XCircle } from 'lucide-react';
import { socialChannelsApi, getApiError, getApiFieldErrors } from '../../api';
import type { SocialChannel, SocialPlatform } from '../../api';
import { InstagramLogo, TikTokLogo, YouTubeLogo, FacebookLogo, XTwitterLogo } from '../common/PlatformIcons';
import { toast } from '../../utils/toast';

const PLATFORMS: { id: SocialPlatform; name: string; icon: React.FC<{ className?: string }>; placeholder: string }[] = [
  { id: 'instagram', name: 'Instagram', icon: InstagramLogo, placeholder: 'instagram.com/yourname or @yourname' },
  { id: 'tiktok', name: 'TikTok', icon: TikTokLogo, placeholder: 'tiktok.com/@yourname or @yourname' },
  { id: 'youtube', name: 'YouTube', icon: YouTubeLogo, placeholder: 'youtube.com/@yourchannel' },
  { id: 'facebook', name: 'Facebook', icon: FacebookLogo, placeholder: 'facebook.com/yourname' },
  { id: 'x', name: 'X (Twitter)', icon: XTwitterLogo, placeholder: 'x.com/yourname or @yourname' },
];

const formatFollowers = (n: number | null) =>
  n === null ? null : new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const StatusBadge: React.FC<{ channel?: SocialChannel }> = ({ channel }) => {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold';
  if (!channel) return <span className={`${base} bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/10`}>Not connected</span>;
  switch (channel.status) {
    case 'verified':
      return <span className={`${base} bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30`}><CheckCircle2 className="w-3 h-3" />Verified</span>;
    case 'pending':
      return <span className={`${base} bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30`}><Clock className="w-3 h-3" />Under review</span>;
    case 'rejected':
      return <span className={`${base} bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30`}><XCircle className="w-3 h-3" />Rejected</span>;
    default:
      return <span className={`${base} bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30`}><AlertCircle className="w-3 h-3" />Action required</span>;
  }
};

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

/** Profile → Connected Social Accounts: link channels and verify them with a bio code. */
export const SocialChannelsCard: React.FC = () => {
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialPlatform | null>(null);
  const [link, setLink] = useState('');
  const [followers, setFollowers] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await socialChannelsApi.list();
      setChannels(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load your social channels.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const replace = (c: SocialChannel) => setChannels((list) => [...list.filter((x) => x.platform !== c.platform), c]);

  const openForm = (platform: SocialPlatform) => {
    const current = channels.find((c) => c.platform === platform);
    setEditing(platform);
    setLink(current?.profile_url ?? '');
    setFollowers(current?.followers != null ? String(current.followers) : '');
    setFieldError(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy('save');
    setFieldError(null);
    try {
      const res = await socialChannelsApi.save({ platform: editing, profile_url: link.trim(), followers: followers === '' ? null : Number(followers) });
      replace(res.data);
      setEditing(null);
      toast.success(res.data.status === 'verified' ? 'Channel updated.' : 'Channel added. Now add your code to your bio.');
    } catch (err) {
      const fields = getApiFieldErrors(err);
      setFieldError(fields.profile_url ?? fields.followers ?? getApiError(err, 'Could not save this channel.'));
    } finally {
      setBusy(null);
    }
  };

  const submit = async (c: SocialChannel) => {
    setBusy(`submit-${c.id}`);
    try {
      const res = await socialChannelsApi.submit(c.id);
      replace(res.data);
      toast.success('Submitted for review. Keep the code in your bio until it is verified.');
    } catch (err) {
      toast.error(getApiError(err, 'Could not submit this channel.'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (c: SocialChannel) => {
    const name = PLATFORMS.find((p) => p.id === c.platform)?.name;
    if (!window.confirm(`Remove your ${name} channel @${c.handle}?`)) return;
    setBusy(`remove-${c.id}`);
    try {
      await socialChannelsApi.remove(c.id);
      setChannels((list) => list.filter((x) => x.id !== c.id));
      toast.success('Channel removed.');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setBusy(null);
    }
  };

  const copy = async (c: SocialChannel) => {
    try {
      await navigator.clipboard.writeText(c.verification_code);
      setCopied(c.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.info(`Your code: ${c.verification_code}`);
    }
  };

  const verifiedCount = channels.filter((c) => c.status === 'verified').length;

  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 sm:p-8 border border-[#E7ECF3] dark:border-white/10 shadow-xs space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Verified Social Media Channels</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xl">
            Link the accounts you complete tasks with. To prove each one is yours, add the code we give you to that profile’s bio — our team checks it and marks the channel verified.
          </p>
        </div>
        <span className="text-xs font-bold text-[#168BFF] bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/25 self-start sm:self-auto whitespace-nowrap">
          {verifiedCount === 0 ? 'No channels verified' : `${verifiedCount} verified`}
        </span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin inline-block" />
        </div>
      ) : (
        <div className="space-y-3.5">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const c = channels.find((x) => x.platform === p.id);
            const followerText = c ? formatFollowers(c.followers) : null;
            const isEditing = editing === p.id;

            return (
              <div key={p.id} className="rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">{p.name}</span>
                        <StatusBadge channel={c} />
                      </div>
                      {c ? (
                        <a href={c.profile_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-gray-400 hover:text-[#168BFF] inline-flex items-center gap-1 mt-0.5 max-w-full">
                          <span className="truncate">@{c.handle}</span>
                          {followerText && <span className="shrink-0">· {followerText} followers</span>}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">Not connected</p>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {c ? (
                        <>
                          <button type="button" onClick={() => openForm(p.id)} className="h-8 px-3 rounded-lg text-xs font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:border-slate-300 inline-flex items-center gap-1.5">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => remove(c)} disabled={busy === `remove-${c.id}`} title="Remove" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 inline-flex items-center justify-center disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => openForm(p.id)} className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Connect channel
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Add / edit */}
                {isEditing && (
                  <form onSubmit={save} className="mt-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px] gap-3">
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Profile link or username</span>
                      <input autoFocus required value={link} onChange={(e) => setLink(e.target.value)} placeholder={p.placeholder} className={inputClass} />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Followers</span>
                      <input type="number" min={0} inputMode="numeric" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Optional" className={inputClass} />
                    </label>
                    {fieldError && <p className="sm:col-span-2 text-xs text-red-600 dark:text-red-400 -mt-1">{fieldError}</p>}
                    <div className="sm:col-span-2 flex gap-2">
                      <button type="submit" disabled={busy === 'save'} className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#07182F] hover:bg-[#168BFF] disabled:opacity-60 inline-flex items-center gap-1.5">
                        {busy === 'save' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save channel
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 inline-flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Verification steps */}
                {c && !isEditing && c.status !== 'verified' && (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B111D] p-4">
                    {c.status === 'rejected' && c.rejection_reason && (
                      <p className="mb-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
                        <b>Not verified:</b> {c.rejection_reason}
                      </p>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200">
                          {c.status === 'pending' ? 'Keep this code in your bio until we verify it' : 'Verify that this account is yours'}
                        </p>
                        {c.status !== 'pending' && (
                          <ol className="mt-1.5 text-xs text-slate-500 dark:text-gray-400 space-y-0.5 list-decimal list-inside">
                            <li>Copy your code.</li>
                            <li>Paste it anywhere in your {p.name} bio / description and save.</li>
                            <li>Press “Submit for review”. You can remove it once verified.</li>
                          </ol>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => copy(c)} className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-white/10 font-mono text-sm font-bold tracking-wider text-slate-900 dark:text-gray-100 inline-flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-white/15" title="Copy code">
                          {c.verification_code}
                          {copied === c.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                        {c.status !== 'pending' && (
                          <button type="button" onClick={() => submit(c)} disabled={busy === `submit-${c.id}`} className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 disabled:opacity-60 inline-flex items-center gap-1.5">
                            {busy === `submit-${c.id}` && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {c.status === 'rejected' ? 'Resubmit for review' : 'Submit for review'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
