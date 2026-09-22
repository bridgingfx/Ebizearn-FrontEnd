import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { AiVerificationResult } from '../../types';

/**
 * Verification status flow: Submitted → Checking → Moderator review →
 * Approved → Pending balance → Available. All stages reflect real submission
 * status from the API. AI checks are always labeled simulated until a real
 * provider is wired.
 */
export const VerificationTimeline: React.FC<{
  status: string;
  aiResult?: AiVerificationResult | null;
}> = ({ status, aiResult }) => {
  const stages = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'checking', label: aiResult?.ai_simulated ? 'Checking (simulated)' : 'Checking' },
    { key: 'review', label: 'Moderator review' },
    { key: 'approved', label: 'Approved' },
    { key: 'pending', label: 'Pending balance' },
    { key: 'available', label: 'Available' },
  ];

  const reachedIndex = (() => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 2;
      case 'action_required':
        return 2;
      case 'approved':
        return 5;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  })();

  if (reachedIndex === -1) {
    return (
      <div className="flex items-center gap-2 text-[11px] font-bold text-red-700">
        <AlertCircle className="w-4 h-4" />
        Rejected — see the reviewer note. You can pick up a new task anytime.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  i <= reachedIndex ? 'bg-[#16B364] text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i <= reachedIndex ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </span>
              <span
                className={`text-[9px] font-bold text-center leading-tight ${
                  i <= reachedIndex ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 mb-4 rounded ${i < reachedIndex ? 'bg-[#16B364]' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      {aiResult?.ai_label && (
        <p className="text-[10px] text-gray-400 mt-2 italic">
          AI verdict: {aiResult.ai_label} — never final; a moderator makes the decision.
        </p>
      )}
    </div>
  );
};
