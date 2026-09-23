import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { EBizLogo } from '../../components/common/EBizLogo';

/**
 * Branded 404 page — rendered by the catch-all `*` route. Shows real content
 * (never a blank page) with links back home and to support. Lives in its own
 * tiny chunk; head tags for it are handled by RouteSeo's 404 fallback config.
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFF] via-white to-[#EDF4FF] dark:from-[#040F1E] dark:via-[#061425] dark:to-[#040F1E]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <Link to="/" aria-label="eBizEarn home" className="mb-10 shrink-0">
          <EBizLogo size="md" />
        </Link>

        {/* Big 404 mark */}
        <div
          aria-hidden="true"
          className="bg-gradient-to-br from-[#168BFF] to-[#7257FF] bg-clip-text text-transparent"
        >
          <span className="text-[6rem] font-extrabold leading-none tracking-tight sm:text-[8rem]">
            404
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          This page wandered off
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
          The link you followed doesn&apos;t exist or was moved. Don&apos;t
          worry — there&apos;s plenty to earn back on the home page.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF] focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF] focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go back
          </button>
        </div>

        <div className="mt-10 flex items-center gap-5 text-sm">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 font-medium text-[#168BFF] hover:underline dark:text-[#5EA9FF]"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse tasks
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-slate-300 dark:bg-white/20" />
          <Link
            to="/contact"
            className="font-medium text-[#168BFF] hover:underline dark:text-[#5EA9FF]"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
};
