import React, { useState } from 'react';
import { Check, Copy, Download, Loader2, Sparkles } from 'lucide-react';
import { PostImagePlaceholder } from '../campaign/PostImagePicker';

/**
 * Contributor task page: what to post — the image (or an empty preview)
 * above the ready-to-post text, with copy / download actions.
 * Responsive: stacked on phones, roomier on tablet / desktop.
 */
export const ReadyToPostCard: React.FC<{
  personal: boolean;
  loading: boolean;
  text: string | null;
  imageUrl: string | null;
  error: string | null;
}> = ({ personal, loading, text, imageUrl, error }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers: select-and-copy fallback.
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = async () => {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      a.href = url;
      a.download = `post-image.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Cross-origin download blocked: open the image so it can be saved.
      window.open(imageUrl, '_blank', 'noopener');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-violet-300/50 dark:border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-white to-fuchsia-500/5 dark:via-transparent p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> {personal ? 'Your ready-to-post text' : 'Ready-to-post text'}
        </p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-white/10 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
          Image + text
        </span>
      </div>

      {/* 1. Image (or empty preview) */}
      <div className="space-y-2">
        {imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block group">
            <img
              src={imageUrl}
              alt="Image to post"
              loading="lazy"
              className="w-full max-h-[420px] object-contain rounded-2xl bg-white dark:bg-black/30 border border-violet-200/70 dark:border-violet-500/20 group-hover:opacity-95 transition-opacity"
            />
          </a>
        ) : (
          <PostImagePlaceholder label={loading ? 'Loading image…' : 'No image for this post'} />
        )}
        {imageUrl && (
          <button
            type="button"
            onClick={() => void download()}
            disabled={downloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-violet-300 dark:border-violet-500/40 bg-white dark:bg-white/5 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download image
          </button>
        )}
      </div>

      {/* 2. Text */}
      <div className="rounded-2xl bg-white/90 dark:bg-white/5 border border-violet-200/70 dark:border-violet-500/20 p-4">
        {loading ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing your text…
          </p>
        ) : text ? (
          <p className="text-sm sm:text-[15px] text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">{text}</p>
        ) : (
          <p className="text-xs text-red-600 dark:text-red-400">{error || 'The post text is not available right now.'}</p>
        )}
      </div>
      {text && (
        <button
          type="button"
          onClick={() => void copy()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy text'}
        </button>
      )}

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Post the image with this text where the task asks — then take a screenshot and submit it below.
      </p>
    </div>
  );
};
