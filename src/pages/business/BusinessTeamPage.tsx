import React from 'react';
import { Users } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/ui';

/**
 * Team access placeholder. The backend has no business team-member or
 * invitation endpoints yet, so no members are listed or invited here —
 * and none are invented.
 */
export const BusinessTeamPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Team Access"
        subtitle="Invite colleagues to manage your campaigns."
      />
      <EmptyState
        icon={Users}
        title="Single-seat account for now"
        description="Team invitations are not supported yet, so this business account is managed by one login. Campaigns, billing and reports remain fully available to you here."
      />
    </div>
  );
};
