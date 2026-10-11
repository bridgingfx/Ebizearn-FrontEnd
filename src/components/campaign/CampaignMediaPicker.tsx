import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Film, Play, UploadCloud, X } from 'lucide-react';

export const CAMPAIGN_MEDIA_MAX_ITEMS = 12;
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

const prettySize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Why a file can't be added, or null when it's fine. */
export function campaignMediaError(f: File): string | null {
  const video = f.type.startsWith('video/');
  if (!video && !f.type.startsWith('image/')) return `${f.name}: only photos (JPG, PNG, WebP, GIF) and videos (MP4, WebM, MOV).`;
  if (video && f.size > MAX_VIDEO) return `${f.name} is ${prettySize(f.size)} — videos must be 100 MB or smaller.`;
  if (!video && f.size > MAX_IMAGE) return `${f.name} is ${prettySize(f.size)} — photos must be 10 MB or smaller.`;
  return null;
}

/**
 * Photos & videos picked BEFORE the campaign exists (staff "Create campaign").
 * Files stay in the browser; the form uploads them to the new campaign right
 * after it is created (same endpoint as the campaign page's media panel).
 */
export const CampaignMediaPicker: React.FC<{ files: File[]; onChange: (files: File[]) => void; disabled?: boolean }> = ({ files, onChange, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f), video: f.type.startsWith('video/') })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const add = (list: FileList | File[]) => {
    setError(null);
    const incoming = Array.from(list);
    for (const f of incoming) {
      const problem = campaignMediaError(f);
      if (problem) return setError(problem);
    }
    const next = [...files, ...incoming];
    if (next.length > CAMPAIGN_MEDIA_MAX_ITEMS) return setError(`Up to ${CAMPAIGN_MEDIA_MAX_ITEMS} photos and videos per campaign.`);
    onChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || files.length >= CAMPAIGN_MEDIA_MAX_ITEMS}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={`w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 transition-colors disabled:opacity-60 ${
          dragOver ? 'border-[#168BFF] bg-[#168BFF]/5' : 'border-gray-200 dark:border-white/10 hover:border-[#168BFF]/50 hover:bg-gray-50 dark:hover:bg-white/5'
        }`}
      >
        <UploadCloud className="w-6 h-6 text-[#168BFF]" />
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Drop photos or videos here, or click to choose</span>
        <span className="text-[10px] text-gray-400">JPG · PNG · WebP · GIF up to 10 MB — MP4 · WebM · MOV up to 100 MB · {files.length}/{CAMPAIGN_MEDIA_MAX_ITEMS}</span>
      </button>
      <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && add(e.target.files)} />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {previews.map((p, i) => (
            <div key={`${p.file.name}-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              {p.video ? (
                <>
                  <video src={p.url} muted preload="metadata" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-4 h-4 text-white" />
                  </span>
                </>
              ) : (
                <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-[9px] font-bold text-white">
                {p.video ? <Film className="w-2.5 h-2.5 inline -mt-px mr-0.5" /> : null}
                {prettySize(p.file.size)}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                aria-label="Remove"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
