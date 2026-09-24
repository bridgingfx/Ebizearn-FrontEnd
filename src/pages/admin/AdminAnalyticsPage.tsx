import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left font-sans max-w-7xl mx-auto">
      
      {/* =========================================================================
          1. HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">
            Platform Macro Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#475467] dark:text-gray-300 mt-0.5">
            Network financial performance, take-rate revenues, geographic demographics, and disbursal volumes.
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. HONEST EMPTY STATE
          No backend analytics endpoints exist yet (GMV, take-rate, geo splits).
          Never render invented platform metrics here.
         ========================================================================= */}
      <EmptyState
        icon={BarChart3}
        title="No platform analytics available yet"
        description="Platform-wide metrics such as GMV, take-rate revenue, geographic distribution, and payout-rail splits are not collected or exposed by the backend yet. These charts will appear once a real analytics pipeline is connected."
      />

    </div>
  );
};
