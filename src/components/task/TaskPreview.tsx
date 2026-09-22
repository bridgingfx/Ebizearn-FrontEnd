import React from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Music2,
  BadgeCheck,
  Star,
  ThumbsUp,
  Bell,
  MoreVertical,
  Send,
  MapPin,
  MessageSquareText,
} from 'lucide-react';
import type { UiTask } from '../../types';
import { initials, humanizeRetention, proofRequirementLabels } from './TaskCard';

export type TaskPreviewVariant =
  | 'instagram_follow'
  | 'instagram_post'
  | 'instagram_story'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'review'
  | 'whatsapp'
  | 'generic';

/**
 * Classify a task payload into a preview variant from its platform + title.
 * Derived client-side from existing task fields — no backend change needed.
 */
export function classifyTaskPreview(task: Pick<UiTask, 'platform' | 'title' | 'categoryName'>): TaskPreviewVariant {
  const platform = task.platform.toLowerCase();
  const text = `${task.title} ${task.categoryName}`.toLowerCase();

  const isFollowTask = /follow|subscribe|join/.test(text);

  if (platform.includes('tiktok')) return 'tiktok';
  if (platform.includes('youtube')) return 'youtube';
  if (platform.includes('facebook')) return 'facebook';
  if (platform.includes('whatsapp')) return 'whatsapp';
  if (platform.includes('trustpilot') || platform.includes('google') || /review|rating/.test(text)) return 'review';
  if (platform.includes('instagram')) {
    if (isFollowTask) return 'instagram_follow';
    if (/story|reel/.test(text)) return 'instagram_story';
    return 'instagram_post';
  }
  if (platform.includes('linkedin')) return 'generic';
  return 'generic';
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const Shell: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="relative rounded-3xl border border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] shadow-sm overflow-hidden">
    <div className="absolute top-3 left-3 z-10">
      <span className="text-[10px] font-black uppercase tracking-wider bg-[#07182F]/85 text-white px-2.5 py-1 rounded-full backdrop-blur">
        Illustrative preview
      </span>
    </div>
    <div className="pt-12">{children}</div>
    <p className="px-4 py-2.5 text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-white/10">
      {label} — mock layout for guidance only. Complete the real action on the actual platform.
    </p>
  </div>
);

const Avatar: React.FC<{ name: string; size?: string }> = ({ name, size = 'w-10 h-10' }) => (
  <div
    className={`${size} rounded-full bg-gradient-to-br from-[#168BFF] to-[#7357FF] text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-white shadow-sm`}
  >
    {initials(name)}
  </div>
);

const handle = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'brand';

/* ------------------------------------------------------------------ */
/* Instagram — profile / follow mock                                   */
/* ------------------------------------------------------------------ */

const InstagramFollowMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#168BFF] to-[#7357FF] text-white flex items-center justify-center text-lg font-black border-2 border-white">
            {initials(task.brandName)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1 truncate">
            {handle(task.brandName)}
            <BadgeCheck className="w-4 h-4 text-[#168BFF] shrink-0" />
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{task.brandName}</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
      </div>

      <div className="flex gap-6 my-4 text-center justify-center">
        {[
          ['Posts', '128'],
          ['Followers', '45.2K'],
          ['Following', '312'],
        ].map(([label, value]) => (
          <div key={label} className="min-w-[64px]">
            <p className="text-sm font-black text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug mb-3">
        {task.postCopy.slice(0, 120)}
        {task.postCopy.length > 120 ? '…' : ''}
      </p>

      <div className="flex gap-2">
        <span className="flex-1 text-center py-2.5 rounded-xl bg-[#168BFF] text-white text-xs font-black shadow-sm shadow-blue-500/25">
          Follow
        </span>
        <span className="flex-1 text-center py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold">
          Message
        </span>
        <span className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center">
          <Bell className="w-4 h-4" />
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-gradient-to-br from-[#0D2342]/70 via-[#168BFF]/25 to-[#7357FF]/25 flex items-center justify-center"
          >
            <span className="text-white/70 text-sm font-black">{initials(task.brandName)}</span>
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* Instagram — post mock                                               */
/* ------------------------------------------------------------------ */

const InstagramPostMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div>
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <Avatar name={task.brandName} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
            {handle(task.brandName)}
            <BadgeCheck className="w-3.5 h-3.5 text-[#168BFF]" />
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Sponsored</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>

      <div className="aspect-square bg-gradient-to-br from-[#0D2342] via-[#168BFF]/30 to-[#7357FF]/30 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
        <span className="text-white/80 text-3xl font-black">{initials(task.brandName)}</span>
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Brand media</span>
      </div>

      <div className="flex items-center gap-4 px-4 py-2.5">
        <Heart className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        <MessageCircle className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        <Send className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        <Bookmark className="w-5 h-5 text-gray-800 dark:text-gray-200 ml-auto" />
      </div>
      <p className="px-4 text-[11px] font-bold text-gray-900 dark:text-gray-100">24,512 likes</p>
      <p className="px-4 pb-4 pt-1 text-[11px] text-gray-700 dark:text-gray-300 leading-snug">
        <span className="font-black">{handle(task.brandName)}</span>{' '}
        {task.postCopy.slice(0, 140)}
        {task.postCopy.length > 140 ? '…' : ''}{' '}
        {task.hashtags && <span className="text-[#168BFF]">{task.hashtags}</span>}
      </p>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* Instagram — story mock                                              */
/* ------------------------------------------------------------------ */

const InstagramStoryMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="relative aspect-[9/16] max-h-[540px] bg-gradient-to-br from-[#3b1d6e] via-[#7a2e8f] to-[#168BFF] overflow-hidden">
      <div className="absolute top-3 inset-x-3 flex gap-1">
        <div className="h-0.5 flex-1 rounded-full bg-white dark:bg-[#0C1322]" />
        <div className="h-0.5 flex-1 rounded-full bg-white/30" />
        <div className="h-0.5 flex-1 rounded-full bg-white/30" />
      </div>
      <div className="absolute top-6 left-3 flex items-center gap-2 text-white">
        <Avatar name={task.brandName} size="w-8 h-8" />
        <p className="text-[11px] font-black">{handle(task.brandName)}</p>
        <span className="text-[10px] text-white/70">2h</span>
      </div>
      <div className="absolute inset-x-0 top-1/3 text-center px-6">
        <p className="text-white text-lg font-black leading-snug drop-shadow-lg line-clamp-4">{task.postCopy.slice(0, 160)}</p>
      </div>
      <div className="absolute bottom-6 inset-x-0 flex justify-center">
        <span className="px-6 py-2 rounded-full bg-white dark:bg-[#0C1322] text-gray-900 dark:text-gray-100 text-[11px] font-black shadow-lg">
          Swipe up / Tap link
        </span>
      </div>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* TikTok — video mock                                                 */
/* ------------------------------------------------------------------ */

const TikTokMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="relative aspect-[9/16] max-h-[540px] bg-[#0A0F1C] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-[#0A0F1C]/60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="text-white/25 text-6xl font-black">{initials(task.brandName)}</span>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Video content</span>
      </div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
        <Avatar name={task.brandName} size="w-11 h-11" />
        {[
          { icon: Heart, count: '12.4K' },
          { icon: MessageCircle, count: '348' },
          { icon: Share2, count: '1.1K' },
        ].map(({ icon: Icon, count }) => (
          <div key={count} className="flex flex-col items-center">
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{count}</span>
          </div>
        ))}
      </div>

      <div className="absolute left-3 bottom-4 right-16 text-white">
        <p className="text-xs font-black flex items-center gap-1">
          @{handle(task.brandName)} <BadgeCheck className="w-3.5 h-3.5 text-[#20C4E8]" />
        </p>
        <p className="text-[11px] text-white/80 leading-snug mt-1 line-clamp-3">{task.postCopy}</p>
        <p className="text-[10px] text-white/60 mt-1 flex items-center gap-1">
          <Music2 className="w-3 h-3" /> original sound — preview
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <Play className="w-6 h-6 text-white ml-0.5" />
        </span>
      </div>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* YouTube — video mock                                                */
/* ------------------------------------------------------------------ */

const YouTubeMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div>
      <div className="aspect-video bg-[#0A0F1C] flex items-center justify-center relative overflow-hidden">
        <span className="text-white/25 text-5xl font-black">{initials(task.brandName)}</span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/70 rounded px-1.5 py-0.5">
          4:32
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={task.brandName} size="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{task.title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              {task.brandName} <BadgeCheck className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">128K views · 2 days ago</p>
          </div>
        </div>
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-100 dark:border-white/10 text-[11px] text-gray-500 dark:text-gray-400 font-bold">
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4" /> 8.2K
          </span>
          <span className="flex items-center gap-1.5">
            <Share2 className="w-4 h-4" /> Share
          </span>
          <span className="ml-auto bg-red-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full">
            Subscribe
          </span>
        </div>
      </div>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* Facebook — page post mock                                           */
/* ------------------------------------------------------------------ */

const FacebookMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar name={task.brandName} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{task.brandName}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Sponsored · Public</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug mb-3">
        {task.postCopy.slice(0, 160)}
        {task.postCopy.length > 160 ? '…' : ''}
      </p>
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="aspect-[16/9] bg-gradient-to-br from-[#07182F] to-[#168BFF]/40 flex items-center justify-center">
          <span className="text-white/80 text-2xl font-black">{initials(task.brandName)}</span>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-white/5">
          <p className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-bold truncate">
            {(task.targetUrl || '').replace(/^https?:\/\//, '') || 'campaign page'}
          </p>
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{task.title}</p>
        </div>
      </div>
      <div className="flex justify-around mt-3 pt-2 border-t border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4" /> Like
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" /> Comment
        </span>
        <span className="flex items-center gap-1.5">
          <Share2 className="w-4 h-4" /> Share
        </span>
      </div>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* Review — rating mock                                                */
/* ------------------------------------------------------------------ */

const ReviewMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="p-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
        <Avatar name={task.brandName} size="w-12 h-12" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{task.brandName}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{task.targetUrl?.replace(/^https?:\/\//, '')}</p>
        </div>
      </div>
      <p className="text-xs font-black text-gray-900 dark:text-gray-100 mt-4 mb-2">Rate your recent experience</p>
      <div className="flex gap-1.5 mb-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`w-7 h-7 ${i < 5 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-3 bg-gray-50 dark:bg-white/5">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-snug line-clamp-3">"{task.postCopy.slice(0, 140)}"</p>
      </div>
      <div className="mt-3 text-center py-2.5 rounded-xl bg-[#07182F] text-white text-xs font-black">Post review</div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">Reviews must be honest and based on a genuine interaction.</p>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* WhatsApp — share mock                                               */
/* ------------------------------------------------------------------ */

const WhatsAppMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="bg-[#0B141A] p-3 rounded-b-none">
      <div className="flex items-center gap-2.5 px-1 py-2 text-white">
        <Avatar name={task.brandName} size="w-9 h-9" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black truncate">{task.brandName}</p>
          <p className="text-[10px] text-emerald-400">online</p>
        </div>
      </div>
      <div className="bg-[#005C4B] rounded-2xl rounded-tl-md p-3 max-w-[85%] text-white shadow">
        <p className="text-[11px] leading-snug line-clamp-4">{task.postCopy.slice(0, 200)}</p>
        {task.targetUrl && (
          <p className="text-[10px] text-emerald-200 underline truncate mt-1.5">
            {task.targetUrl.replace(/^https?:\/\//, '')}
          </p>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 bg-[#202C33] rounded-full px-3 py-2">
        <MessageSquareText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-1">Message</span>
        <span className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center">
          <Send className="w-3.5 h-3.5 text-white" />
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 px-1">
        <MapPin className="w-3 h-3" />
        <span>Share into the campaign group, then screenshot your sent message as proof.</span>
      </div>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* Generic fallback                                                    */
/* ------------------------------------------------------------------ */

const GenericMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <Shell label={task.platform}>
    <div className="p-6 text-center">
      <Avatar name={task.brandName} size="w-16 h-16" />
      <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-3">{task.brandName}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
        {task.categoryName} task on {task.platform}
      </p>
      <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug mt-4 text-left bg-gray-50 dark:bg-white/5 rounded-2xl p-4 line-clamp-6">
        {task.postCopy.slice(0, 220)}
        {task.postCopy.length > 220 ? '…' : ''}
      </p>
    </div>
  </Shell>
);

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export interface TaskPreviewProps {
  /** The task payload (existing UiTask fields — company, instructions, platform, reward…). */
  task: UiTask;
  /** Force a specific mock variant; defaults to classification from the payload. */
  variant?: TaskPreviewVariant;
}

/**
 * TaskPreview — the reusable task preview system.
 *
 * Fed by the task payload (platform, brand, instructions, reward…). It renders
 * a realistic, clearly-labelled illustrative mockup of what the contributor
 * will do on the real platform — Instagram follow/profile, Instagram post,
 * TikTok video, YouTube, Facebook, review, WhatsApp share, or a generic card.
 *
 * The mockup is guidance only: no action is performed on the real platform.
 */
export const TaskPreview: React.FC<TaskPreviewProps> = ({ task, variant }) => {
  const kind = variant ?? classifyTaskPreview(task);
  switch (kind) {
    case 'instagram_follow':
      return <InstagramFollowMockup task={task} />;
    case 'instagram_story':
      return <InstagramStoryMockup task={task} />;
    case 'instagram_post':
      return <InstagramPostMockup task={task} />;
    case 'tiktok':
      return <TikTokMockup task={task} />;
    case 'youtube':
      return <YouTubeMockup task={task} />;
    case 'facebook':
      return <FacebookMockup task={task} />;
    case 'review':
      return <ReviewMockup task={task} />;
    case 'whatsapp':
      return <WhatsAppMockup task={task} />;
    default:
      return <GenericMockup task={task} />;
  }
};

/**
 * TaskPreviewSummary — compact fact strip rendered under a preview:
 * company, platform, reward, proof requirements and retention rules.
 */
export const TaskPreviewSummary: React.FC<{ task: UiTask }> = ({ task }) => {
  const requirements = proofRequirementLabels(task.campaign?.proof_requirements_json);
  return (
    <div className="rounded-3xl border border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar name={task.brandName} size="w-11 h-11" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{task.brandName}</p>
          <p className="text-sm font-black text-gray-900 dark:text-gray-100 leading-snug">{task.title}</p>
        </div>
        <span className="ml-auto text-sm font-black text-[#16B364] shrink-0">
          ${((task.reward_cents || 0) / 100).toFixed(2)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
        <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">{task.platform}</span>
        <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 capitalize">{task.categoryName}</span>
        <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">~{task.estimated_minutes} min</span>
      </div>
      {requirements.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Proof required</p>
          <ul className="flex flex-wrap gap-1.5">
            {requirements.map((r) => (
              <li key={r} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg capitalize">
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2 leading-snug">
        <span className="font-black">Retention:</span> {humanizeRetention(task.retentionHours)} — reversing the action
        early can reverse this reward.
      </p>
    </div>
  );
};
