import React from 'react';
import { Users } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Honest placeholder. There is no backend endpoint exposing a business's
 * contributor directory, so no directory is rendered — and no demo people
 * are invented to fill the space.
 */
export const BusinessContributorsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Contributors</h1>
        <p className="text-sm text-gray-500 mt-1">People completing your tasks.</p>
      </div>
      <EmptyState
        icon={Users}
        title="Contributor directory coming soon"
        description="A directory of contributors who have worked on your campaigns needs backend support that isn't available yet. Individual submissions are already visible in the Proof Gallery."
      />
    </div>
  );
};
