import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Paperclip, X, FileText, Download, Lock, Loader2, AlertCircle } from 'lucide-react';
import type { SupportAttachment, SupportTicketMessage } from '../../types';

/**
 * Instagram-DM–style ticket conversation: gradient bubbles for your own
 * messages, grouped runs with a single avatar, inline image previews,
 * file chips, and a pill composer with image / file attach. Sits on the
 * branded doodle wallpaper (.chat-wallpaper, public/chat/*.svg).
 *
 * Attachments are private, so images/files are fetched through
 * `fetchAttachment` (auth header) and shown via object URLs.
 */

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,' + IMAGE_ACCEPT;
const GROUP_GAP_MS = 10 * 60 * 1000;

export interface TicketChatProps {
  messages: SupportTicketMessage[];
  /** Whose screen this is: decides which side "my" bubbles sit on. */
  viewer: 'user' | 'staff';
  /** Display name for the other party's avatar initial. */
  counterpartName: string;
  loading?: boolean;
  sending?: boolean;
  error?: string | null;
  /** When set, the composer is replaced by this note (e.g. closed ticket). */
  closedNote?: string | null;
  /** Staff only: show the "internal note" toggle. */
  allowInternal?: boolean;
  fetchAttachment: (messageId: number, index: number) => Promise<Blob>;
  /** Resolve true when sent, so the composer clears. */
  onSend: (text: string, files: File[], internal: boolean) => Promise<boolean>;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return sameDay ? time : `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${time}`;
};

const initialOf = (name: string) => (name.trim()[0] || '?').toUpperCase();

export const TicketChat: React.FC<TicketChatProps> = ({
  messages,
  viewer,
  counterpartName,
  loading,
  sending,
  error,
  closedNote,
  allowInternal,
  fetchAttachment,
  onSend,
}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [internal, setInternal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Object-URL cache for fetched attachments (revoked on unmount).
  const urlCache = useRef(new Map<string, Promise<string>>());
  useEffect(() => {
    const cache = urlCache.current;
    return () => {
      cache.forEach((p) => p.then((u) => URL.revokeObjectURL(u)).catch(() => undefined));
      cache.clear();
    };
  }, []);

  const attachmentUrl = useCallback(
    (messageId: number, index: number) => {
      const key = `${messageId}:${index}`;
      let p = urlCache.current.get(key);
      if (!p) {
        p = fetchAttachment(messageId, index).then((blob) => URL.createObjectURL(blob));
        p.catch(() => urlCache.current.delete(key));
        urlCache.current.set(key, p);
      }
      return p;
    },
    [fetchAttachment]
  );

  // Stick to the newest message.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  // Auto-grow the textarea up to ~5 lines.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    const next = [...files];
    for (const f of list) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXT.includes(ext)) {
        setLocalError(`"${f.name}" isn't an allowed file type.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setLocalError(`"${f.name}" is larger than 10MB.`);
        continue;
      }
      if (next.length >= MAX_FILES) {
        setLocalError('You can attach up to 5 files per message.');
        break;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sending || (!text.trim() && files.length === 0)) return;
    setLocalError(null);
    const ok = await onSend(text.trim(), files, internal);
    if (ok) {
      setText('');
      setFiles([]);
      setInternal(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = Array.from(e.clipboardData.files || []);
    if (pasted.length) {
      e.preventDefault();
      addFiles(pasted);
    }
  };

  const isMine = (m: SupportTicketMessage) => (viewer === 'user' ? !m.from_staff : m.from_staff);
  const canSend = (text.trim().length > 0 || files.length > 0) && !sending;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Conversation */}
      <div ref={scrollRef} className="chat-wallpaper flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4">
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-10 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const mine = isMine(m);
          const newGroup =
            !prev || isMine(prev) !== mine || prev.is_internal_note !== m.is_internal_note ||
            new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > GROUP_GAP_MS;
          const lastInGroup =
            !next || isMine(next) !== mine || next.is_internal_note !== m.is_internal_note ||
            new Date(next.created_at).getTime() - new Date(m.created_at).getTime() > GROUP_GAP_MS;
          const showTime =
            !prev || new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > GROUP_GAP_MS;

          const images = m.attachments.filter((a) => a.is_image);
          const docs = m.attachments.filter((a) => !a.is_image);

          const bubbleBase = m.is_internal_note
            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-300/70 dark:border-amber-400/30'
            : mine
            ? 'bg-gradient-to-br from-[#168BFF] via-[#5B5BF7] to-[#8B3DFF] text-white'
            : 'bg-white dark:bg-[#1B2436] text-gray-900 dark:text-gray-100 border border-gray-200/70 dark:border-white/10';

          // Instagram-style run shape: tight corners on the sender's side
          // between consecutive bubbles.
          const corners = mine
            ? `${newGroup ? 'rounded-tr-[22px]' : 'rounded-tr-md'} ${lastInGroup ? 'rounded-br-[22px]' : 'rounded-br-md'} rounded-l-[22px]`
            : `${newGroup ? 'rounded-tl-[22px]' : 'rounded-tl-md'} ${lastInGroup ? 'rounded-bl-[22px]' : 'rounded-bl-md'} rounded-r-[22px]`;

          return (
            <React.Fragment key={m.id}>
              {showTime && (
                <div className="flex justify-center my-3">
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-black/30 backdrop-blur px-2.5 py-0.5 rounded-full">
                    {timeLabel(m.created_at)}
                  </span>
                </div>
              )}

              <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'} ${lastInGroup ? 'mb-2.5' : 'mb-0.5'}`}>
                {!mine && (
                  <div className="w-7 shrink-0">
                    {lastInGroup && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#07182F] to-[#168BFF] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0B1220]">
                        {initialOf(m.from_staff ? m.sender_name : counterpartName)}
                      </div>
                    )}
                  </div>
                )}

                <div className={`max-w-[78%] sm:max-w-[70%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                  {newGroup && (!mine || m.is_internal_note) && (
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 px-2 flex items-center gap-1">
                      {m.is_internal_note && <Lock className="w-3 h-3" />}
                      {m.is_internal_note ? `Internal note · ${m.sender_name}` : m.sender_name}
                    </span>
                  )}

                  {images.length > 0 && (
                    <div className={`grid gap-1 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {images.map((a) => (
                        <ChatImage key={a.index} attachment={a} load={() => attachmentUrl(m.id, a.index)} />
                      ))}
                    </div>
                  )}

                  {(m.message || docs.length > 0) && (
                    <div className={`px-3.5 py-2 text-[13px] leading-snug shadow-sm ${bubbleBase} ${corners}`}>
                      {m.message && <p className="whitespace-pre-wrap break-words">{m.message}</p>}
                      {docs.length > 0 && (
                        <div className={`flex flex-col gap-1.5 ${m.message ? 'mt-2' : ''}`}>
                          {docs.map((a) => (
                            <ChatFile key={a.index} attachment={a} mine={mine && !m.is_internal_note} load={() => attachmentUrl(m.id, a.index)} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Composer */}
      {closedNote ? (
        <p className="px-5 py-4 border-t border-gray-100 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-[#0C1322]">
          {closedNote}
        </p>
      ) : (
        <form
          onSubmit={submit}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="px-3 sm:px-4 pt-2.5 pb-3 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#0C1322] space-y-2"
        >
          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {files.map((f, i) => (
                <PendingFile key={`${f.name}-${i}`} file={f} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />
              ))}
            </div>
          )}

          {allowInternal && (
            <label className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 dark:text-gray-400 cursor-pointer w-fit">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="accent-amber-500" />
              <Lock className="w-3 h-3" /> Internal note (only staff can see this)
            </label>
          )}

          <div
            className={`flex items-end gap-1.5 rounded-[26px] border px-1.5 py-1.5 transition-colors ${
              internal
                ? 'border-amber-300 bg-amber-50/60 dark:bg-amber-500/10 dark:border-amber-500/40'
                : 'border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5 focus-within:border-[#168BFF]'
            }`}
          >
            <button
              type="button"
              onClick={() => imageInput.current?.click()}
              title="Send a photo"
              className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#168BFF] to-[#8B3DFF] text-white flex items-center justify-center hover:opacity-90"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <textarea
              ref={textRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              maxLength={5000}
              placeholder={internal ? 'Write an internal note…' : 'Message…'}
              className="flex-1 min-w-0 resize-none bg-transparent px-1.5 py-2 text-[13px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              title="Attach a file"
              className="w-9 h-9 shrink-0 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-white/10 flex items-center justify-center"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className="h-9 px-3 shrink-0 rounded-full text-[13px] font-bold text-[#168BFF] disabled:text-gray-300 dark:disabled:text-gray-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 disabled:hover:bg-transparent flex items-center gap-1"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : internal ? 'Add note' : 'Send'}
            </button>
          </div>

          <input ref={imageInput} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <input ref={fileInput} type="file" accept={FILE_ACCEPT} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

          {(localError || error) && (
            <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 px-2">
              <AlertCircle className="w-3.5 h-3.5" /> {localError || error}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

/** Inline image bubble — fetched privately, opens full size on click. */
const ChatImage: React.FC<{ attachment: SupportAttachment; load: () => Promise<string> }> = ({ attachment, load }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    load()
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [load]);

  if (failed) {
    return (
      <div className="w-40 h-28 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[11px] text-gray-500">
        Image unavailable
      </div>
    );
  }
  if (!url) {
    return <div className="w-48 h-36 rounded-2xl bg-gray-200/70 dark:bg-white/10 animate-pulse" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" title={attachment.name}>
      <img
        src={url}
        alt={attachment.name}
        className="max-w-[240px] max-h-[260px] w-full rounded-2xl object-cover border border-black/5 dark:border-white/10 shadow-sm"
      />
    </a>
  );
};

/** File chip inside a bubble — downloads on click. */
const ChatFile: React.FC<{ attachment: SupportAttachment; mine: boolean; load: () => Promise<string> }> = ({
  attachment,
  mine,
  load,
}) => {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const url = await load();
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void download()}
      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left min-w-[180px] ${
        mine ? 'bg-white/15 hover:bg-white/25' : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15'
      }`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mine ? 'bg-white/20' : 'bg-white dark:bg-white/10'}`}>
        <FileText className="w-4 h-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold truncate">{attachment.name}</span>
        <span className="block text-[10px] opacity-70">{formatSize(attachment.size)}</span>
      </span>
      {busy ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0 opacity-80" />}
    </button>
  );
};

/** Selected-but-not-sent file preview in the composer. */
const PendingFile: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, isImage]);

  return (
    <div className="relative shrink-0">
      {isImage && url ? (
        <img src={url} alt={file.name} className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
      ) : (
        <div className="w-40 h-16 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#168BFF] shrink-0" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-gray-900 dark:text-gray-100 truncate">{file.name}</span>
            <span className="block text-[10px] text-gray-500">{formatSize(file.size)}</span>
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center shadow"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
