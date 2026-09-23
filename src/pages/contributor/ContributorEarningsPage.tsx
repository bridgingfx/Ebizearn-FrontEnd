import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Wallet } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const ContributorEarningsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#101828] dark:text-gray-100">Earnings & Performance</h2>
          <p className="text-xs text-[#667085] dark:text-gray-400 mt-0.5">
            Detailed breakdown of your completed task rewards, level progression, and payout forecasts.
          </p>
        </div>
        <Link
          to="/app/wallet"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07182F] hover:bg-[#168BFF] text-white text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Wallet className="w-4 h-4" />
          <span>Manage Wallet & Payouts</span>
        </Link>
      </div>

      {/* =========================================================================
          HONEST EMPTY STATE
          No backend earnings-series endpoints exist yet — never render invented
          earnings charts, level progress, or income forecasts.
         ========================================================================= */}
      <EmptyState
        icon={DollarSign}
        title="No earnings yet"
        description="Your earnings history, performance charts, and category breakdown will appear here once you complete tasks and they are verified. Real numbers only — nothing is shown until you've earned it."
        actionLabel="Explore Available Tasks"
        onAction={() => {
          window.location.href = '/app/tasks';
        }}
      />

    </div>
  );
};
