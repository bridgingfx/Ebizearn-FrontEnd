import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { subscribeToasts, dismissToast, pauseToast, resumeToast, type ToastItem } from '../../utils/toast';

const STYLES: Record<ToastItem['kind'], { icon: React.ElementType; title: string; badge: string; bar: string }> = {
  success: {
    icon: CheckCircle2,
    title: 'Success',
    badge: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30',
    bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  },
  error: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    badge: 'bg-gradient-to-br from-rose-400 to-red-600 shadow-red-500/30',
    bar: 'bg-gradient-to-r from-rose-400 to-red-600',
  },
  info: {
    icon: Info,
    title: 'Heads up',
    badge: 'bg-gradient-to-br from-[#168BFF] to-[#7257FF] shadow-blue-500/30',
    bar: 'bg-gradient-to-r from-[#168BFF] to-[#7257FF]',
  },
};

/**
 * Toast stack: top-right on desktop, top-center on phones. Mount once (App).
 * Call `toast.success(...)` etc. from anywhere — see utils/toast.ts.
 */
export const Toaster: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-3 inset-x-3 sm:top-5 sm:right-5 sm:left-auto z-[1000] flex flex-col items-center sm:items-end gap-2.5"
    >
      {items.map((t) => {
        const s = STYLES[t.kind];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            onMouseEnter={() => pauseToast(t.id)}
            onMouseLeave={() => resumeToast(t.id)}
            className="toast-in pointer-events-auto relative w-full sm:w-[380px] overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C1322]/95 backdrop-blur-xl shadow-[0_18px_50px_-12px_rgba(7,24,47,0.35)]"
          >
            <div className="flex items-start gap-3 p-3.5 pr-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${s.badge}`}>
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[13px] font-bold text-slate-900 dark:text-gray-100 leading-tight">{t.title ?? s.title}</p>
                <p className="mt-0.5 text-[13px] text-slate-600 dark:text-gray-300 leading-snug break-words">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Time left */}
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-100 dark:bg-white/5">
              <div
                key={`${t.id}-${t.createdAt}`}
                className={`toast-progress h-full origin-left ${s.bar}`}
                style={{ animationDuration: `${t.duration}ms`, animationPlayState: t.paused ? 'paused' : 'running' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
