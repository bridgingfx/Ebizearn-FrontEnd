import React from 'react';
import { TrendingUp } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const BusinessReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left font-sans max-w-7xl mx-auto">
      
      {/* =========================================================================
          1. HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">
            Analytics & ROI Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#475467] mt-0.5">
            Evaluate brand reach, cost-per-action efficiency, and real-human social media engagement metrics.
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. HONEST EMPTY STATE
          No backend reporting endpoints exist yet — never render invented charts.
         ========================================================================= */}
      <EmptyState
        icon={TrendingUp}
        title="No report data yet"
        description="Launch a campaign to start collecting real engagement and spend data. Reports and ROI charts will appear here automatically once your campaigns generate verified activity."
      />

    </div>
  );
};
