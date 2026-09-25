/**
 * Global toast store (no dependencies). `toast.success("…")` / `toast.error("…")`
 * from any component or plain function; <Toaster/> renders the stack.
 *
 * Every create / update / delete API call also toasts automatically (see
 * api/client.ts). Those are marked `auto`: when a page shows its own toast
 * of the same kind right after, it replaces the automatic one instead of
 * stacking a second message.
 */
export interface ToastItem {
  id: number;
  kind: 'error' | 'success' | 'info';
  message: string;
  title?: string;
  auto?: boolean;
  /** Total visible time (ms) — drives the progress bar. */
  duration: number;
  createdAt: number;
  paused?: boolean;
}

type Listener = (items: ToastItem[]) => void;

const MAX_VISIBLE = 4;
/** A page toast arriving this soon after an automatic one replaces it. */
const REPLACE_WINDOW_MS = 1500;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();
const timers = new Map<number, number>();

const emit = () => listeners.forEach((l) => l(items));

export function dismissToast(id: number): void {
  window.clearTimeout(timers.get(id));
  timers.delete(id);
  items = items.filter((t) => t.id !== id);
  emit();
}

function schedule(id: number, ms: number): void {
  window.clearTimeout(timers.get(id));
  timers.set(id, window.setTimeout(() => dismissToast(id), ms));
}

function push(kind: ToastItem['kind'], message: string, title: string | undefined, duration: number, auto = false): number {
  const now = Date.now();

  // Same message already showing: restart its timer instead of stacking.
  const dup = items.find((t) => t.kind === kind && t.message === message);
  if (dup) {
    items = items.map((t) => (t.id === dup.id ? { ...t, createdAt: now, duration, auto: t.auto && auto, paused: false } : t));
    emit();
    schedule(dup.id, duration);
    return dup.id;
  }

  // A page's own message replaces the automatic one it follows.
  const replaceable = !auto
    ? items.find((t) => t.auto && t.kind === kind && now - t.createdAt < REPLACE_WINDOW_MS)
    : undefined;
  // An automatic toast never overrides a page's message that just appeared.
  if (auto && items.some((t) => !t.auto && t.kind === kind && now - t.createdAt < REPLACE_WINDOW_MS)) {
    return -1;
  }

  const id = replaceable ? replaceable.id : nextId++;
  const item: ToastItem = { id, kind, message, title, auto, duration, createdAt: now };
  items = replaceable ? items.map((t) => (t.id === id ? item : t)) : [...items, item].slice(-MAX_VISIBLE);
  emit();
  schedule(id, duration);
  return id;
}

/** Hovering a toast keeps it on screen. */
export function pauseToast(id: number): void {
  window.clearTimeout(timers.get(id));
  items = items.map((t) => (t.id === id ? { ...t, paused: true } : t));
  emit();
}

export function resumeToast(id: number): void {
  const resumeFor = 2500;
  items = items.map((t) => (t.id === id ? { ...t, paused: false, createdAt: Date.now(), duration: resumeFor } : t));
  emit();
  schedule(id, resumeFor);
}

export const toast = {
  error: (message: string, title?: string) => push('error', message, title, 6000),
  success: (message: string, title?: string) => push('success', message, title, 4500),
  info: (message: string, title?: string) => push('info', message, title, 4500),
  /** Used by the API client for automatic create / update / delete feedback. */
  auto: (kind: 'error' | 'success', message: string) => push(kind, message, undefined, kind === 'error' ? 6000 : 4000, true),
};

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}
