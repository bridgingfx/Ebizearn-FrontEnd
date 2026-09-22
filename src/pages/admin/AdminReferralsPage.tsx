import React from 'react';
import { Gift } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Referral statistics placeholder. Referrals currently exist only on the
 * contributor side (GET /contributor/referrals). A platform-wide referral
 * ledger endpoint (Worker B's three-level referral ledger) is pending — so no
 * invented referral numbers are shown here.
 */
export const AdminReferralsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Referrals</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide affiliate performance and payouts.</p>
      </div>
      <EmptyState
        icon={Gift}
        title="Referral statistics coming soon"
        description="Platform-wide referral statistics need a backend referral-ledger endpoint that isn't available yet. Individual referral stats are visible to each contributor in their own dashboard."
      />
    </div>
  );
};
