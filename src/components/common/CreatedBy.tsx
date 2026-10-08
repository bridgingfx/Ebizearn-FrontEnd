import React from 'react';
import { UserRound } from 'lucide-react';
import type { RecordCreator } from '../../types';

/**
 * "by Priya · Team member" — who created a campaign, task or deposit, so the
 * business owner and staff can tell the owner's work from a team member's
 * (or staff's). Renders nothing for older records without a creator.
 */
export const CreatedBy: React.FC<{ creator?: RecordCreator | null; className?: string }> = ({ creator, className = '' }) => {
  if (!creator) return null;
  const tag = creator.business_owner_id
    ? 'Team member'
    : creator.role === 'business'
      ? 'Owner'
      : creator.role === 'superadmin'
        ? 'Super Admin'
        : creator.role;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 ${className}`}>
      <UserRound className="w-3 h-3 shrink-0" />
      <span className="truncate">
        by <b className="font-semibold text-gray-700 dark:text-gray-300">{creator.name}</b>
        <span className={`ml-1 capitalize ${creator.business_owner_id ? 'text-[#168BFF]' : ''}`}>· {tag}</span>
      </span>
    </span>
  );
};
