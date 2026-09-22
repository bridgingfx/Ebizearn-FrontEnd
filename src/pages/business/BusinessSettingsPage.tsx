import React from 'react';
import { Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Settings shows real identity from the auth session only. There is no
 * backend business-profile update endpoint yet, so editing is honestly
 * disabled rather than pretending to save. API keys/webhooks do not exist
 * in the backend — no key is generated or displayed.
 */
export const BusinessSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const business = user?.business;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Business Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your company profile and integrations.</p>
      </div>

      {/* Company profile — real data, read-only until backend supports updates */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-5">
          <Building className="w-4 h-4 text-[#168BFF]" /> Company Profile
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
              Company name
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              {business?.company_name || '—'}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
              Account email
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              {user?.email || '—'}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
              Industry
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              {business?.industry || '—'}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
              Contact name
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              {user?.name || '—'}
            </div>
          </div>
        </div>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-bold">Profile editing is not available yet.</span> The current backend API
            has no business-profile update endpoint, so these fields are read-only. Contact support at{' '}
            <span className="font-bold">support@ebizearn.com</span> if your company details need to change.
          </p>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-4">API & Webhooks</h3>
        <EmptyState
          icon={Building}
          title="Integrations coming soon"
          description="API keys and webhooks are not supported by the current backend API. This section will appear once the backend ships them."
        />
      </div>
    </div>
  );
};
