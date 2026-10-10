import React, { useState } from 'react';
import { Download, Film, Loader2 } from 'lucide-react';
import type { Campaign } from '../../types';

type Media = NonNullable<Campaign['media']>[number];

const extFrom = (m: Media) => {
  const fromName = m.original_name?.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const sub = (m.mime_type ?? '').split('/')[1] ?? '';
  return sub === 'quicktime' ? 'mov' : sub === 'jpeg' ? 'jpg' : sub || (m.type === 'video' ? 'mp4' : 'jpg');
};

/** Downloads through a blob so cross-origin files save instead of opening. */
const DownloadButton: React.FC<{ media: Media; name: string }> = ({ media, name }) => {
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch(media.url, { mode: 'cors' });
      if (!res.ok) throw new Error('download failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.${extFrom(media)}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      window.open(media.url, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={save}
      disabled={busy}
      aria-label="Download"
      className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm disabled:opacity-60"
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
    </button>
  );
};

/** Task page: the campaign's photos & videos, each downloadable for posting. */
export const CampaignMediaGallery: React.FC<{ media: Media[]; taskKey: string }> = ({ media, taskKey }) => {
  if (media.length === 0) return null;
  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Film className="w-4 h-4 text-[#168BFF]" /> Campaign photos & videos
        </h2>
        <span className="text-[10px] font-bold text-gray-400">{media.length}</span>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">Use these in your post. Tap the download icon to save one.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {media.map((m, i) => (
          <div key={m.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            {m.type === 'video' ? (
              <video src={m.url} controls preload="metadata" playsInline className="w-full h-full object-cover bg-black" />
            ) : (
              <a href={m.url} target="_blank" rel="noopener noreferrer">
                <img src={m.url} alt={m.original_name ?? `Campaign photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
              </a>
            )}
            <DownloadButton media={m} name={`ebizearn-${taskKey.slice(0, 8)}-${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
