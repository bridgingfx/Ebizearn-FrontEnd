import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { subscribeToasts, dismissToast, type ToastItem } from '../../utils/toast';

const STYLES: Record<ToastItem['kind'], { icon: React.ElementType; ring: string; iconColor: string }> = {
  error: { icon: AlertCircle, ring: 'border-red-200 dark:border-red-500/30', iconColor: 'text-red-500' },
  success: { icon: CheckCircle2, ring: 'border-emerald-200 dark:border-emerald-500/30', iconColor: 'text-emerald-500' },
  info: { icon: Info, ring: 'border-blue-200 dark:border-blue-500/30', iconColor: 'text-[#168BFF]' },
};

/**
 * Top-center toast stack. Mount once (App). Call `toast.error(...)` etc.
 * from anywhere — see utils/toast.ts.
 */
export const Toaster: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-3 sm:top-5 z-[1000] flex flex-col items-center gap-2 px-3"
    >
      {items.map((t) => {
        const s = STYLES[t.kind];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`toast-in pointer-events-auto w-full max-w-md flex items-start gap-3 rounded-2xl border bg-white/95 dark:bg-[#0C1322]/95 backdrop-blur-xl px-4 py-3 shadow-[0_12px_40px_rgba(7,24,47,0.18)] ${s.ring}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.iconColor}`} />
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-sm font-bold text-slate-900 dark:text-gray-100">{t.title}</p>}
              <p className="text-sm text-slate-600 dark:text-gray-300 leading-snug break-words">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="shrink-0 -mr-1 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
