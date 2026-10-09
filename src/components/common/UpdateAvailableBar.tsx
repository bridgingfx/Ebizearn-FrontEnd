import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { isUpdateReady, onUpdateReady } from '../../utils/appUpdate';

/** "New version" prompt shown once a newer deploy is live. */
export const UpdateAvailableBar: React.FC = () => {
  const [ready, setReady] = useState(isUpdateReady());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const off = onUpdateReady(() => setReady(true));
    return () => {
      off();
    };
  }, []);

  if (!ready || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed z-[100] bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#07182F] text-white shadow-2xl"
    >
      <RefreshCw className="w-4 h-4 shrink-0 text-[#38BDF8]" />
      <p className="flex-1 min-w-0 text-xs sm:text-sm font-semibold">A new version of eBizEarn is available.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 px-3 py-1.5 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae6] text-xs font-bold"
      >
        Refresh
      </button>
      <button type="button" aria-label="Dismiss" onClick={() => setDismissed(true)} className="shrink-0 p-1 rounded-lg hover:bg-white/10">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
