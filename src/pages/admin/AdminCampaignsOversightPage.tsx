import React from 'react';
import { Megaphone } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Campaign oversight placeholder. The backend currently has no admin campaign
 * management endpoint (list/moderate/pause platform-wide), so the previous
 * fabricated demo campaigns and the local-only "launch" modal are gone.
 * Business campaigns remain manageable by their owners in the business portal.
 */
export const AdminCampaignsOversightPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Campaign Oversight</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate campaigns across every business account.</p>
      </div>
      <EmptyState
        icon={Megaphone}
        title="Campaign oversight coming soon"
        description="Platform-wide campaign listing and moderation needs a backend admin endpoint that isn't available yet. Individual campaigns are visible in each business's portal."
      />
    </div>
  );
};
