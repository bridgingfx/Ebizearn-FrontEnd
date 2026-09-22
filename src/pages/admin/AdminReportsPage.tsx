import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Reports placeholder. The backend has no reports/analytics export endpoint,
 * so no charts are rendered here. CSV exports are available inline where real
 * data exists (e.g. campaign detail submissions).
 */
export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Exports, financial summaries, and platform analytics.</p>
      </div>
      <EmptyState
        icon={BarChart3}
        title="Reports coming soon"
        description="Report generation and export need a backend analytics endpoint that isn't available yet. Live figures are already visible on the Dashboard and Health pages."
      />
    </div>
  );
};
