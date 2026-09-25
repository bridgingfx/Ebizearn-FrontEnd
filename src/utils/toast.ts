/**
 * Minimal global toast store (no dependencies). `toast.error("…")` from any
 * component or plain function; <Toaster/> renders the stack at the top.
 */
export interface ToastItem {
  id: number;
  kind: 'error' | 'success' | 'info';
  message: string;
  title?: string;
}

type Listener = (items: ToastItem[]) => void;

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

function push(kind: ToastItem['kind'], message: string, title?: string, durationMs = 5000): number {
  // Same message already showing: restart its timer instead of stacking.
  const dup = items.find((t) => t.kind === kind && t.message === message);
  const id = dup ? dup.id : nextId++;
  if (!dup) {
    items = [...items, { id, kind, message, title }].slice(-3);
    emit();
  }
  window.clearTimeout(timers.get(id));
  timers.set(id, window.setTimeout(() => dismissToast(id), durationMs));
  return id;
}

export const toast = {
  error: (message: string, title?: string) => push('error', message, title, 6000),
  success: (message: string, title?: string) => push('success', message, title),
  info: (message: string, title?: string) => push('info', message, title),
};

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}
