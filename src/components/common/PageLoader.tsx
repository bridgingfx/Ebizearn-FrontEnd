import React from 'react';

/**
 * Premium route-loading fallback shown while a lazy route chunk downloads.
 * Matches the site aesthetic: glassmorphism, brand blue accents, dark/light
 * aware via the `dark:` variant, Apple system font inherited from body.
 * Kept dependency-free so it renders instantly inside Suspense.
 */
export const PageLoader: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-white/70 dark:bg-[#040F1E]/70 backdrop-blur-xl"
      role="status"
      aria-label="Loading page"
    >
      <div className="glass flex flex-col items-center gap-5 rounded-3xl px-10 py-9 shadow-2xl">
        {/* Brand mark pulse */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] opacity-30 blur-md animate-pulse"
            aria-hidden="true"
          />
          <span
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] text-2xl font-extrabold text-white shadow-lg"
            aria-hidden="true"
          >
            eB
          </span>
        </div>

        {/* Shimmer progress bar */}
        <div
          className="relative h-1.5 w-44 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10"
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-[#168BFF] to-[#7257FF] animate-[loader-sweep_1.1s_ease-in-out_infinite]" />
        </div>

        <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
          Loading…
        </p>
      </div>

      <style>{`
        @keyframes loader-sweep {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
