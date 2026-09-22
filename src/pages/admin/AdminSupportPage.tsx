import React from 'react';
import { Headset } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Support placeholder. The backend has no support/dispute endpoints, so the
 * previous fabricated ticket list is gone. No demo tickets are shown.
 */
export const AdminSupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Support &amp; Disputes</h1>
        <p className="text-sm text-gray-500 mt-1">Handle user support requests and disputes.</p>
      </div>
      <EmptyState
        icon={Headset}
        title="Support queue coming soon"
        description="A support and dispute ticketing backend is not available yet. Until then, support is handled outside the platform."
      />
    </div>
  );
};
