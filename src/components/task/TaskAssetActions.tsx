import React, { useState } from 'react';
import { Download, Copy, Check, Loader2, ExternalLink, ImageOff } from 'lucide-react';
import type { UiTask } from '../../types';
import {
  InstagramLogo,
  TikTokLogo,
  YouTubeLogo,
  FacebookLogo,
  XTwitterLogo,
  WhatsAppLogo,
  GoogleReviewLogo,
  TrustpilotLogo,
  LinkedInLogo,
} from '../common/PlatformIcons';

/**
 * TaskAssetActions — the contributor's "do the task" action bar.
 *
 * Placed directly under the creative preview on the task detail page.
 * Flow: 1) download the creative image → 2) copy the caption →
 * 3) open the platform and post → 4) come back and submit proof.
 */

const isMobileDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

/** Prefer the platform the business picked in the campaign wizard; fall back to the detected one. */
const resolvePlatform = (task: UiTask): string =>
  task.campaign?.platform?.trim() || task.platform || 'Instagram';

const platformKey = (platform: string) => platform.toLowerCase();

const PLATFORM_ICONS: Record<string, React.FC<{ className?: string }>> = {
  instagram: InstagramLogo,
  tiktok: TikTokLogo,
  youtube: YouTubeLogo,
  facebook: FacebookLogo,
  x: XTwitterLogo,
  twitter: XTwitterLogo,
  whatsapp: WhatsAppLogo,
  'google reviews': GoogleReviewLogo,
  trustpilot: TrustpilotLogo,
  linkedin: LinkedInLogo,
};

/** Where "Open {platform}" takes the contributor — the place they actually post. */
const platformTarget = (platform: string, caption: string): { label: string; url?: string; deepLink?: string } => {
  const key = platformKey(platform);
  const encoded = encodeURIComponent(caption.slice(0, 500));
  switch (key) {
    case 'instagram':
      return {
        label: 'Open Instagram',
        // Mobile: jump straight into the Instagram composer; web fallback if the app isn't installed.
        deepLink: 'instagram://camera',
        url: 'https://www.instagram.com/',
      };
    case 'facebook':
      return { label: 'Open Facebook', url: 'https://www.facebook.com/' };
    case 'tiktok':
      return { label: 'Open TikTok', url: 'https://www.tiktok.com/' };
    case 'x':
    case 'twitter':
      return { label: 'Open X', url: `https://twitter.com/intent/tweet?text=${encoded}` };
    case 'youtube':
      return { label: 'Open YouTube', url: 'https://www.youtube.com/upload' };
    case 'whatsapp':
      return { label: 'Open WhatsApp', url: `https://wa.me/?text=${encoded}` };
    case 'google reviews':
      return { label: 'Open Google Maps', url: 'https://www.google.com/maps' };
    case 'trustpilot':
      return { label: 'Open Trustpilot', url: 'https://www.trustpilot.com/' };
    case 'linkedin':
      return { label: 'Open LinkedIn', url: 'https://www.linkedin.com/feed/' };
    default:
      return { label: `Open ${platform}`, url: 'https://www.instagram.com/' };
  }
};

const extFromContentType = (contentType: string): string => {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
};

export const TaskAssetActions: React.FC<{ task: UiTask }> = ({ task }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const platform = resolvePlatform(task);
  const target = platformTarget(platform, task.postCopy || task.description || '');
  const PlatformIcon = PLATFORM_ICONS[platformKey(platform)];

  const caption = [task.postCopy, task.hashtags].filter(Boolean).join('\n\n');

  const handleDownload = async () => {
    const imageUrl = task.flyerUrl;
    if (!imageUrl) return;
    setDownloading(true);
    try {
      // fetch → blob → object URL so cross-origin creatives still download
      // as a file instead of navigating away.
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `ebizearn-task-${task.uuid?.slice(0, 8) || task.id}.${extFromContentType(blob.type)}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch {
      // Last resort: open the image in a new tab so the user can save it manually.
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // Clipboard API unavailable (older browsers / non-secure contexts).
      const ta = document.createElement('textarea');
      ta.value = caption;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* noop */
      }
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenPlatform = () => {
    // Instagram on mobile: try the native composer first, fall back to the website.
    if (target.deepLink && isMobileDevice()) {
      const fallback = window.setTimeout(() => {
        if (target.url) window.open(target.url, '_blank', 'noopener,noreferrer');
      }, 1500);
      window.location.href = target.deepLink;
      // If the app opened, the page hides — cancel the fallback.
      const onHide = () => {
        window.clearTimeout(fallback);
        document.removeEventListener('visibilitychange', onHide);
      };
      document.addEventListener('visibilitychange', onHide);
      return;
    }
    if (target.url) window.open(target.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">Do the task</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {platform}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        Download the creative, copy the caption, post it on {platform} — then come back here and submit your proof.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        {task.flyerUrl ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-2xl bg-[#168BFF] hover:bg-[#2F80FF] text-white text-xs font-black transition-all shadow-lg shadow-[#168BFF]/25 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{downloading ? 'Downloading…' : 'Download image'}</span>
          </button>
        ) : (
          <div
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-xs font-bold"
            title="The business hasn't attached a creative image to this task yet"
          >
            <ImageOff className="w-4 h-4" />
            <span>No image attached</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleCopy}
          disabled={!caption}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-2xl text-xs font-black transition-all disabled:opacity-50 ${
            copied
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-gray-100'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy caption'}</span>
        </button>

        <button
          type="button"
          onClick={handleOpenPlatform}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-2xl bg-[#07182F] dark:bg-[#D4AF37] hover:bg-[#0D2342] dark:hover:bg-[#E3C25A] text-white dark:text-[#07182F] text-xs font-black transition-all shadow-lg"
        >
          {PlatformIcon && <PlatformIcon className="w-4 h-4" />}
          <span>{target.label}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {caption && (
        <div className="mt-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Caption to post
          </p>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 whitespace-pre-line">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};
