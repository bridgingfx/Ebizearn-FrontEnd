import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/ui';

/**
 * Honest placeholder. There is no backend endpoint exposing a business's
 * contributor directory, so no directory is rendered — and no demo people
 * are invented to fill the space.
 */
export const BusinessContributorsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Contributors"
        subtitle="People completing your tasks."
      />
      <EmptyState
        icon={Users}
        title="No contributor directory yet"
        description="A cross-campaign contributor directory is not available yet — and no sample people are shown. Every real submission on your tasks is visible today in the Proof Gallery."
        actionLabel="Open Proof Gallery"
        onAction={() => navigate("/business/proofs")}
      />
    </div>
  );
};
