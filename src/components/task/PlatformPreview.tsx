import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play, Music2, BadgeCheck } from 'lucide-react';
import type { UiTask } from '../../types';
import { initials } from './TaskCard';

const PreviewShell: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="relative rounded-3xl border border-[#E7ECF3] bg-white shadow-sm overflow-hidden">
    <div className="absolute top-3 left-3 z-10">
      <span className="text-[10px] font-black uppercase tracking-wider bg-[#07182F]/85 text-white px-2.5 py-1 rounded-full backdrop-blur">
        Illustrative preview
      </span>
    </div>
    <div className="pt-11">{children}</div>
    <p className="px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100">
      {label} — mock layout for guidance only; complete the real action on the {label.toLowerCase()} platform.
    </p>
  </div>
);

const MockAvatar: React.FC<{ name: string; size?: string }> = ({ name, size = 'w-10 h-10' }) => (
  <div className={`${size} rounded-full bg-gradient-to-br from-[#168BFF] to-[#7357FF] text-white flex items-center justify-center text-xs font-black shrink-0`}>
    {initials(name)}
  </div>
);

const InstagramProfileMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <PreviewShell label={task.platform}>
    <div className="p-4">
      <div className="flex items-center gap-3">
        <MockAvatar name={task.brandName} size="w-16 h-16" />
        <div className="flex-1">
          <p className="text-sm font-black text-gray-900 flex items-center gap-1">
            {task.brandName.toLowerCase().replace(/\s+/g, '_')}
            <BadgeCheck className="w-4 h-4 text-[#168BFF]" />
          </p>
          <p className="text-[11px] text-gray-500">{task.brandName}</p>
        </div>
      </div>
      <div className="flex gap-6 my-3 text-center">
        {[
          ['Posts', '128'],
          ['Followers', '45.2K'],
          ['Following', '312'],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-sm font-black text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-700 leading-snug mb-3">
        {task.postCopy.slice(0, 120)}{task.postCopy.length > 120 ? '…' : ''}
      </p>
      <div className="flex gap-2">
        <span className="flex-1 text-center py-2 rounded-xl bg-[#168BFF] text-white text-xs font-black">Follow</span>
        <span className="flex-1 text-center py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold">Message</span>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200" />
        ))}
      </div>
    </div>
  </PreviewShell>
);

const InstagramPostMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <PreviewShell label={task.platform}>
    <div>
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <MockAvatar name={task.brandName} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 truncate">{task.brandName.toLowerCase().replace(/\s+/g, '_')}</p>
          <p className="text-[10px] text-gray-400">Sponsored</p>
        </div>
      </div>
      <div className="aspect-square bg-gradient-to-br from-[#0D2342] via-[#168BFF]/30 to-[#7357FF]/30 flex items-center justify-center">
        <span className="text-white/80 text-2xl font-black">{initials(task.brandName)}</span>
      </div>
      <div className="flex items-center gap-4 px-4 py-2.5">
        <Heart className="w-5 h-5 text-gray-800" />
        <MessageCircle className="w-5 h-5 text-gray-800" />
        <Share2 className="w-5 h-5 text-gray-800" />
        <Bookmark className="w-5 h-5 text-gray-800 ml-auto" />
      </div>
      <p className="px-4 pb-4 text-[11px] text-gray-700 leading-snug">
        <span className="font-black">{task.brandName.toLowerCase().replace(/\s+/g, '_')}</span>{' '}
        {task.postCopy.slice(0, 140)}{task.postCopy.length > 140 ? '…' : ''}{' '}
        <span className="text-[#168BFF]">{task.hashtags}</span>
      </p>
    </div>
  </PreviewShell>
);

const FacebookMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <PreviewShell label={task.platform}>
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <MockAvatar name={task.brandName} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 truncate">{task.brandName}</p>
          <p className="text-[10px] text-gray-400">Sponsored · Public</p>
        </div>
      </div>
      <p className="text-[11px] text-gray-700 leading-snug mb-3">
        {task.postCopy.slice(0, 160)}{task.postCopy.length > 160 ? '…' : ''}
      </p>
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div className="aspect-[16/9] bg-gradient-to-br from-[#07182F] to-[#168BFF]/40 flex items-center justify-center">
          <span className="text-white/80 text-2xl font-black">{initials(task.brandName)}</span>
        </div>
        <div className="p-3 bg-gray-50">
          <p className="text-[10px] uppercase text-gray-400 font-bold">{(task.targetUrl || '').replace(/^https?:\/\//, '')}</p>
          <p className="text-xs font-bold text-gray-900">{task.title}</p>
        </div>
      </div>
      <div className="flex justify-around mt-3 pt-2 border-t border-gray-100 text-[11px] font-bold text-gray-500">
        <span>Like</span>
        <span>Comment</span>
        <span>Share</span>
      </div>
    </div>
  </PreviewShell>
);

const TikTokMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <PreviewShell label={task.platform}>
    <div className="relative aspect-[9/16] max-h-[520px] bg-[#0A0F1C] rounded-b-3xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/20 text-6xl font-black">{initials(task.brandName)}</span>
      </div>
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center">
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-bold">12.4K</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">348</span>
        </div>
        <div className="flex flex-col items-center">
          <Share2 className="w-6 h-6" />
          <span className="text-[10px] font-bold">1.1K</span>
        </div>
      </div>
      <div className="absolute left-3 bottom-4 right-16 text-white">
        <p className="text-xs font-black">@{task.brandName.toLowerCase().replace(/\s+/g, '')}</p>
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
  </PreviewShell>
);

const GenericMockup: React.FC<{ task: UiTask }> = ({ task }) => (
  <PreviewShell label={task.platform}>
    <div className="p-6 text-center">
      <MockAvatar name={task.brandName} size="w-16 h-16" />
      <p className="text-sm font-black text-gray-900 mt-3">{task.brandName}</p>
      <p className="text-[11px] text-gray-500 mt-1">{task.categoryName} task on {task.platform}</p>
      <p className="text-[11px] text-gray-700 leading-snug mt-4 text-left bg-gray-50 rounded-2xl p-4">
        {task.postCopy.slice(0, 220)}{task.postCopy.length > 220 ? '…' : ''}
      </p>
    </div>
  </PreviewShell>
);

/**
 * PlatformPreview — illustrative platform mockup for a task.
 * Driven by the task's platform + category. Purely illustrative chrome;
 * the real action happens on the actual platform.
 */
export const PlatformPreview: React.FC<{ task: UiTask }> = ({ task }) => {
  const platform = task.platform.toLowerCase();
  const title = `${task.title} ${task.categoryName}`.toLowerCase();
  const isFollowTask = /follow|subscribe/.test(title);

  if (platform.includes('tiktok')) return <TikTokMockup task={task} />;
  if (platform.includes('facebook')) return <FacebookMockup task={task} />;
  if (platform.includes('instagram')) {
    return isFollowTask ? <InstagramProfileMockup task={task} /> : <InstagramPostMockup task={task} />;
  }
  return <GenericMockup task={task} />;
};
