import React from 'react';
import { Headset } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/ui';

/**
 * Support placeholder. The backend has no support/dispute endpoints, so the
 * previous fabricated ticket list is gone. No demo tickets are shown.
 */
export const AdminSupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Disputes"
        subtitle="Handle user support requests and disputes."
      />
      <EmptyState
        icon={Headset}
        title="No in-app ticketing yet"
        description="In-app support tickets are not wired up yet, so there is no queue to show — and no demo tickets are invented. Users can reach the team by email in the meantime."
        actionLabel="Email support@ebizearn.com"
        onAction={() => { window.location.href = "mailto:support@ebizearn.com"; }}
      />
    </div>
  );
};
