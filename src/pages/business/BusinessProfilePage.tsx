import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Image as ImageIcon, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { businessFollowApi, businessSocialChannelsApi } from '../../api';
import type { BusinessProfile, FollowPerson } from '../../api';
import { FollowListModal } from '../../components/account/FollowListModal';
import { SocialChannelsCard } from '../../components/account/SocialChannelsCard';
import { UserAvatar } from '../../components/common/UserAvatar';

type RowProps = { person: FollowPerson; update: (next: Partial<FollowPerson> | null) => void; onStats: (stats: BusinessProfile['stats']) => void };

/** Followers list: follow back / stop following. */
const FollowBackButton: React.FC<RowProps> = ({ person, update, onStats }) => {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      const res = person.mutual ? await businessFollowApi.unfollow(person.id) : await businessFollowApi.followBack(person.id);
      onStats(res.data.stats);
      update({ mutual: !person.mutual });
    } catch {
      /* toasted by the API client */
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black disabled:opacity-60 ${
        person.mutual ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200' : 'bg-[#168BFF] text-white hover:bg-[#2F80FF]'
      }`}
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : person.mutual ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
      {person.mutual ? 'Following' : 'Follow back'}
    </button>
  );
};

/** Following list: unfollow. */
const UnfollowButton: React.FC<RowProps> = ({ person, update, onStats }) => {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await businessFollowApi.unfollow(person.id);
          onStats(res.data.stats);
          update(null);
        } catch {
          /* toasted by the API client */
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 disabled:opacity-60"
    >
      {busy && <Loader2 className="w-3 h-3 animate-spin" />} Unfollow
    </button>
  );
};

/**
 * Business → Profile: what contributors see on the task page (tasks posted,
 * followers, following, campaign images), the follower / following lists
 * with follow back, and the business's social links (checked by staff).
 */
export const BusinessProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<'followers' | 'following' | null>(null);

  const load = useCallback(() => {
    businessFollowApi
      .profile()
      .then((res) => setProfile(res.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const fetchFollowers = useCallback((page: number, search: string) => businessFollowApi.people('followers', { page, search }), []);
  const fetchFollowing = useCallback((page: number, search: string) => businessFollowApi.people('following', { page, search }), []);

  const setStats = (stats: BusinessProfile['stats']) => setProfile((p) => (p ? { ...p, stats } : p));

  const stats: { key: 'posts' | 'followers' | 'following'; label: string }[] = [
    { key: 'posts', label: 'Tasks posted' },
    { key: 'followers', label: 'Followers' },
    { key: 'following', label: 'Following' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Business Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">What contributors see on your tasks — followers, following and your social links.</p>
      </div>

      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-6">
        {loading ? (
          <div className="py-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin inline-block" />
          </div>
        ) : !profile ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Could not load your business profile.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <UserAvatar src={profile.avatar_url} name={profile.name} size="xl" />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span className="truncate">{profile.name}</span>
                  {profile.verified && <BadgeCheck className="w-5 h-5 text-[#168BFF] shrink-0" />}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{profile.handle}
                  {profile.industry ? ` · ${profile.industry}` : ''}
                </p>
                <div className="flex gap-2 sm:gap-6 mt-4">
                  {stats.map((s) => {
                    const clickable = s.key !== 'posts';
                    const body = (
                      <>
                        <p className="text-lg font-black text-gray-900 dark:text-gray-100">{profile.stats[s.key].toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</p>
                      </>
                    );
                    return clickable ? (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setList(s.key as 'followers' | 'following')}
                        className="text-left px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        {body}
                      </button>
                    ) : (
                      <div key={s.key} className="px-3 py-2">
                        {body}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Campaign images (newest first)
              </p>
              {profile.images.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Add a post image to a campaign and it shows here and on your tasks.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {profile.images.map((img) => (
                    <a key={`${img.campaign_uuid}-${img.url}`} href={img.url} target="_blank" rel="noopener noreferrer" title={img.title} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                      <img src={img.url} alt={img.title} loading="lazy" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SocialChannelsCard
        api={businessSocialChannelsApi}
        allowOAuth={false}
        description="Connect your business's social accounts. Add the code we give you to each profile's bio and submit it — our admin team checks the link and marks it verified. Verified links show on your business profile."
      />

      <FollowListModal
        open={list === 'followers'}
        title="Followers"
        fetchPage={fetchFollowers}
        renderAction={(p, update) => <FollowBackButton person={p} update={update} onStats={setStats} />}
        onClose={() => setList(null)}
      />
      <FollowListModal
        open={list === 'following'}
        title="Following"
        fetchPage={fetchFollowing}
        renderAction={(p, update) => <UnfollowButton person={p} update={update} onStats={setStats} />}
        onClose={() => setList(null)}
      />
    </div>
  );
};
