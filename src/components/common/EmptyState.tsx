import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Honest empty state shown when no real data exists yet.
 * Real data must come from the backend — never render invented numbers here.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-12 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 flex items-center justify-center mx-auto">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-black text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#07182F] hover:bg-[#168BFF] text-white text-xs font-bold transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
