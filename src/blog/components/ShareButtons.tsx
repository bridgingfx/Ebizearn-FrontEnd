/**
 * Social share buttons for blog posts: X, Facebook, Telegram, copy link.
 */
import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';

function openShare(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=540');
}

export const ShareButtons: React.FC<{ title: string; path: string }> = ({ title, path }) => {
  const [copied, setCopied] = useState(false);
  const pageUrl = `https://ebizearn.com${path}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = pageUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const btn =
    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5';

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={() =>
          openShare(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)
        }
        className={`${btn} bg-[#0B0F19] text-white border-[#0B0F19] hover:opacity-90`}
        aria-label="Share on X"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden>
          <path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.4l7.3-8.3L1 2h6.5l4.4 5.9L18.9 2Zm-1.1 17.8h1.7L7.6 3.9H5.7l12.1 15.9Z" />
        </svg>
        Post on X
      </button>
      <button
        type="button"
        onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        className={`${btn} bg-[#1877F2] text-white border-[#1877F2] hover:opacity-90`}
        aria-label="Share on Facebook"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden>
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
        </svg>
        Share
      </button>
      <button
        type="button"
        onClick={() => openShare(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`)}
        className={`${btn} bg-[#229ED9] text-white border-[#229ED9] hover:opacity-90`}
        aria-label="Share on Telegram"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden>
          <path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-1.98.94l-5.5-4.07-2.66 2.57c-.3.3-.55.55-1.11.55l.39-5.63L19.7 5.5c.45-.4-.1-.62-.7-.22L6.7 13.1.6 11.2c-1.32-.42-1.35-1.32.28-1.95L22.4 1.3c1.1-.4 2.05.26 1.5 2.49Z" />
        </svg>
        Telegram
      </button>
      <button
        type="button"
        onClick={copyLink}
        className={`${btn} bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-[#E4EAF2] dark:border-white/15 hover:border-[#168BFF] hover:text-[#168BFF]`}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#16B364]" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
};
