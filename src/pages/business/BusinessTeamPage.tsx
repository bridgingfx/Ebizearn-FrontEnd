import React from 'react';
import { Users } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Team access placeholder. The backend has no business team-member or
 * invitation endpoints yet, so no members are listed or invited here —
 * and none are invented.
 */
export const BusinessTeamPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Team Access</h1>
        <p className="text-sm text-gray-500 mt-1">Invite colleagues to manage your campaigns.</p>
      </div>
      <EmptyState
        icon={Users}
        title="Team invitations coming soon"
        description="Inviting team members needs backend support that isn't available yet. Until then, your campaigns are managed from this single business account."
      />
    </div>
  );
};
