import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';

export const POST_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
export const POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Empty "no image yet" preview used by the picker and the contributor card. */
export const PostImagePlaceholder: React.FC<{ label?: string; className?: string }> = ({ label = 'No image added', className = '' }) => (
  <div
    className={`w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-500/25 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/5 dark:to-fuchsia-500/5 flex flex-col items-center justify-center gap-2 text-violet-400 dark:text-violet-300/70 ${className}`}
  >
    <ImagePlus className="w-9 h-9" strokeWidth={1.5} />
    <span className="text-xs font-semibold">{label}</span>
  </div>
);

/**
 * Pick the image contributors post with the text. Shows the current or
 * newly chosen image, or an empty preview. The caller uploads `file`.
 */
export const PostImagePicker: React.FC<{
  /** Already-uploaded image (edit / resume). */
  currentUrl?: string | null;
  file: File | null;
  onFile: (file: File | null) => void;
  /** Remove an already-uploaded image. */
  onRemoveCurrent?: () => void;
  busy?: boolean;
  error?: string | null;
}> = ({ currentUrl, file, onFile, onRemoveCurrent, busy, error }) => {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || currentUrl || null;

  const choose = (f: File | undefined) => {
    setLocalError(null);
    if (!f) return;
    if (!POST_IMAGE_TYPES.split(',').includes(f.type)) {
      setLocalError('Choose a JPG, PNG or WebP image.');
      return;
    }
    if (f.size > POST_IMAGE_MAX_BYTES) {
      setLocalError('The image must be 5 MB or smaller.');
      return;
    }
    onFile(f);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {shown ? (
          <img src={shown} alt="Post image" className="w-full aspect-[4/3] sm:aspect-[16/10] object-cover rounded-2xl border border-violet-200 dark:border-violet-500/25 bg-white dark:bg-white/5" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="block w-full" aria-label="Add a post image">
            <PostImagePlaceholder label="Add an image (optional)" />
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 rounded-2xl bg-white/60 dark:bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-white dark:bg-white/5 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 disabled:opacity-50"
        >
          {shown ? <RefreshCw className="w-3.5 h-3.5" /> : <ImagePlus className="w-3.5 h-3.5" />} {shown ? 'Replace image' : 'Choose image'}
        </button>
        {file && (
          <button type="button" disabled={busy} onClick={() => onFile(null)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
        {!file && currentUrl && onRemoveCurrent && (
          <button type="button" disabled={busy} onClick={onRemoveCurrent} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" /> Remove image
          </button>
        )}
        <span className="text-[11px] text-gray-500 dark:text-gray-400">JPG, PNG or WebP · up to 5 MB · square or 4:3 looks best</span>
      </div>
      {(localError || error) && <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{localError || error}</p>}
      <input ref={input} type="file" accept={POST_IMAGE_TYPES} className="hidden" onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
};
