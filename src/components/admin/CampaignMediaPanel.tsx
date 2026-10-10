import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Film, ImagePlus, Loader2, Play, Trash2, UploadCloud } from 'lucide-react';
import { campaignMediaApi, getApiError } from '../../api';
import type { CampaignMediaItem } from '../../api';
import { useAuth } from '../../context/AuthContext';

const MAX_ITEMS = 12;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;

const prettySize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Staff: photos and videos for a campaign. Contributors see them on the
 * task page and can download them to post. Drag & drop or pick several at
 * once; images up to 10 MB, videos up to 100 MB, 12 per campaign.
 */
export const CampaignMediaPanel: React.FC<{ campaignId: number | string }> = ({ campaignId }) => {
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || !!user?.permissions?.includes('edit_campaigns');

  const [items, setItems] = useState<CampaignMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await campaignMediaApi.list(campaignId);
      setItems(res.data);
    } catch (e) {
      setError(getApiError(e, 'Could not load campaign media.'));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (list: FileList | File[]) => {
    const files = Array.from(list);
    if (files.length === 0) return;
    setError(null);

    const room = MAX_ITEMS - items.length;
    if (files.length > room) {
      setError(room <= 0 ? `This campaign already has ${MAX_ITEMS} files. Remove one first.` : `You can add ${room} more file${room === 1 ? '' : 's'}.`);
      return;
    }
    for (const f of files) {
      const video = f.type.startsWith('video/');
      if (!video && !f.type.startsWith('image/')) return setError(`${f.name}: only photos (JPG, PNG, WebP, GIF) and videos (MP4, WebM, MOV).`);
      if (video && f.size > MAX_VIDEO) return setError(`${f.name} is ${prettySize(f.size)} — videos must be 100 MB or smaller.`);
      if (!video && f.size > MAX_IMAGE) return setError(`${f.name} is ${prettySize(f.size)} — photos must be 10 MB or smaller.`);
    }

    setUploading(true);
    setProgress(0);
    try {
      const res = await campaignMediaApi.upload(campaignId, files, setProgress);
      setItems(res.data);
    } catch (e) {
      setError(getApiError(e, 'Upload failed.'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (m: CampaignMediaItem) => {
    setRemoving(m.id);
    try {
      const res = await campaignMediaApi.remove(campaignId, m.id);
      setItems(res.data);
    } catch {
      /* toasted by the API client */
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E7ECF3] dark:border-white/10 bg-white dark:bg-[#0C1322] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-[#168BFF]" /> Photos & videos for contributors
        </p>
        <span className="text-[10px] font-bold text-gray-400 tabular-nums">{items.length} / {MAX_ITEMS}</span>
      </div>

      {canEdit && (
        <button
          type="button"
          disabled={uploading || items.length >= MAX_ITEMS}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading) void upload(e.dataTransfer.files);
          }}
          className={`w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 transition-colors disabled:opacity-60 ${
            dragOver ? 'border-[#168BFF] bg-[#168BFF]/5' : 'border-gray-200 dark:border-white/10 hover:border-[#168BFF]/50 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-[#168BFF]" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Uploading… {progress}%</span>
              <span className="w-40 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <span className="block h-full bg-[#168BFF] transition-all" style={{ width: `${progress}%` }} />
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="w-6 h-6 text-[#168BFF]" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Drop photos or videos here, or click to choose</span>
              <span className="text-[10px] text-gray-400">JPG · PNG · WebP · GIF up to 10 MB — MP4 · WebM · MOV up to 100 MB</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && void upload(e.target.files)} />

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <div className="py-4 text-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin inline-block" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <ImagePlus className="w-3.5 h-3.5" /> No photos or videos yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((m) => (
            <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              {m.type === 'video' ? (
                <>
                  <video src={m.url} preload="metadata" muted className="w-full h-full object-cover" />
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-900 ml-0.5" />
                    </span>
                  </a>
                </>
              ) : (
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  <img src={m.url} alt={m.original_name ?? ''} loading="lazy" className="w-full h-full object-cover" />
                </a>
              )}
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">{prettySize(m.size_bytes)}</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => void remove(m)}
                  disabled={removing === m.id}
                  aria-label="Remove"
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  {removing === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
