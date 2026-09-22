import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  User,
  Check,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformDataContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import type { TaskSubmission } from '../../types';

const mapSubmissionForReview = (submission: TaskSubmission) => {
  const task = submission.task;
  const campaign = task?.campaign;
  const ai = submission.aiResult;
  const firstFile = submission.files?.[0];

  return {
    ...submission,
    contributorAvatar: submission.user?.profile?.avatar_url,
    contributorName: submission.user?.name || 'Contributor',
    contributorLevel: submission.user?.profile?.contributor_level || 'starter',
    location: [submission.user?.profile?.city, submission.user?.profile?.country_code].filter(Boolean).join(', ') || 'Global',
    reward: `${task?.reward_cents ? (task.reward_cents / 100).toFixed(2) : '0.00'} ${submission.user?.wallet?.currency || 'AED'}`,
    taskTitle: task?.title || 'Submitted task proof',
    campaignName: campaign?.title || campaign?.business?.company_name || 'Campaign',
    submittedAt: submission.created_at ? new Date(submission.created_at).toLocaleString() : 'Just now',
    postUrl: submission.proof_data_json?.url || '#',
    screenshotUrl: firstFile?.file_url || '/assets/demo/task-creative.jpg',
    note: submission.proof_data_json?.note || submission.proof_data_json?.text_answer || 'No contributor note supplied.',
    ai: {
      confidence: Math.round(ai?.confidence_score ?? 0),
      summary: ai?.analysis_summary || 'Awaiting AI analysis summary.',
      quality: Math.round(ai?.proof_quality ?? 0),
      timestampMatch: Math.round(ai?.content_match ?? 0),
      duplicateRisk: Math.round(ai?.duplicate_risk ?? 0),
      policyMatch: Math.round(ai?.policy_match ?? 0),
    },
  };
};

export const AdminVerificationCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { submissions, approveSubmission, rejectSubmission, requestResubmission } = usePlatform();
  const [realQueue, setRealQueue] = useState<ReturnType<typeof mapSubmissionForReview>[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Active selected submission in verification queue
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(101);
  const [decisionNotes, setDecisionNotes] = useState('Proof verified against OCR and timestamp database. Compliant.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisionExecuted, setDecisionExecuted] = useState<string | null>(null);
  const [showSopGuide, setShowSopGuide] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi.verificationQueue({ status: 'under_review' })
      .then((res) => {
        if (!alive) return;
        if (res.success) {
          const mapped = res.data.map(mapSubmissionForReview);
          setRealQueue(mapped);
          setSelectedSubmissionId((current) => current ?? mapped[0]?.id ?? null);
          setLoadError(null);
        }
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(getApiError(err, 'Could not load live verification queue. Showing local fallback data.'));
      });
    return () => {
      alive = false;
    };
  }, []);

  // Queue of submissions pending review from shared platform state
  const fallbackQueue = submissions.filter((s) => s.status === 'under_review');
  const queue = realQueue.length > 0 ? realQueue : fallbackQueue;
  const currentSubmission = queue.find((q) => q.id === selectedSubmissionId) || queue[0];

  const presetReasons = [
    'Verified: Post content, hashtags, and timestamp fully compliant.',
    'Action Required: Device timestamp is cropped out. Please resubmit full screen.',
    'Action Required: Profile is set to private. Make post public for 24h.',
    'Rejected: Missing required campaign sponsor hashtags.',
    'Rejected: Duplicate or recycled image hash detected.',
  ];

  const handleDecision = async (action: 'approved' | 'rejected' | 'action_required') => {
    if (!currentSubmission) return;
    if (!decisionNotes.trim()) {
      alert('A decision reason is mandatory for compliance and audit logging.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await adminApi.recordDecision(currentSubmission.id, {
        decision: action,
        notes: decisionNotes,
      });
      if (res.success && realQueue.length > 0) {
        setRealQueue((items) => items.filter((item) => item.id !== currentSubmission.id));
      }
    } catch (err) {
      if (realQueue.length > 0) {
        setLoadError(getApiError(err, 'Could not record the live verification decision. No local decision was applied.'));
        setIsProcessing(false);
        return;
      }
    }

    if (realQueue.length === 0) {
      if (action === 'approved') {
        approveSubmission(currentSubmission.id, decisionNotes);
      } else if (action === 'rejected') {
        rejectSubmission(currentSubmission.id, decisionNotes);
      } else {
        requestResubmission(currentSubmission.id, decisionNotes);
      }
    }

    setDecisionExecuted(action);
    setIsProcessing(false);

    // Pick next pending submission
    setTimeout(() => {
      const remaining = queue.filter((s) => s.id !== currentSubmission.id);
      if (remaining.length > 0) {
        setSelectedSubmissionId(remaining[0].id);
      }
      setDecisionExecuted(null);
      setDecisionNotes('Proof verified against OCR and timestamp database. Compliant.');
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-7xl mx-auto">
      
      {/* 1. HEADER & QUEUE STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">AI Verification Center</h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Side-by-side computer vision inspection, multi-signal fraud scoring, and manual decision overrides.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSopGuide(!showSopGuide)}
            className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#168BFF] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showSopGuide ? 'Hide SOP Rules' : 'Verification SOP Rules'}</span>
          </button>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            {queue.length} Submissions in Queue
          </span>
        </div>
      </div>

      {loadError && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{loadError}</span>
        </div>
      )}

      {/* 2. SOP & AI CRITERIA EXPLANATION ACCORDION */}
      {showSopGuide && (
        <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <ShieldCheck className="w-5 h-5 text-[#168BFF]" />
              <span>Standard Operating Procedure (SOP): How Verification Works</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">Algorithm Version: Heuristic Pre-Check (Simulated)</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            <strong>Simulated check — heuristic only.</strong> The backend currently uses a
            heuristic pre-check (mock AI provider), not a production computer-vision service.
            Every score and auto-decision below is a placeholder. Human review remains mandatory.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                  Confidence &ge; 90%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#16B364] font-bold text-[10px]">
                  Auto-Approve
                </span>
              </div>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                Computer vision validates image hash, device timestamp matches submission time within 15 minutes, and all required keywords/hashtags exist in the OCR stream.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">
                  Confidence 70% - 89%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">
                  Moderator Queue
                </span>
              </div>
              <p className="text-amber-950 text-[11px] leading-relaxed">
                Quarantined for human spot-check. Commonly caused by partial image cropping, dark mode variations, or non-English system clocks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-800 uppercase tracking-wider text-[11px]">
                  Confidence &lt; 70% / Fraud
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                  Auto-Quarantine
                </span>
              </div>
              <p className="text-red-950 text-[11px] leading-relaxed">
                Submissions with matching image perceptual hashes across different user accounts, missing timestamps, or edited pixels are rejected to protect brand budgets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI OPERATIONS TELEMETRY CARDS (SIMULATED) */}
      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span><strong>Simulated metrics.</strong> Pass rates, latency, and fraud figures below are placeholders from the heuristic pre-check, not live production AI telemetry.</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E4EAF2] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">AI Pass Rate</span>
            <span className="w-2 h-2 rounded-full bg-[#16B364] animate-pulse" />
          </div>
          <div className="text-2xl font-black text-[#16B364]">98.2%</div>
          <div className="text-[10px] text-gray-400">1,429 proofs auto-approved today</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E4EAF2] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vision Latency</span>
            <Clock className="w-3.5 h-3.5 text-[#168BFF]" />
          </div>
          <div className="text-2xl font-black text-[#168BFF]">12.4s</div>
          <div className="text-[10px] text-gray-400">OCR + perceptual hash match</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E4EAF2] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fraud Quarantined</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">1.2%</div>
          <div className="text-[10px] text-gray-400">18 recycled hashes blocked</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E4EAF2] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Queue</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{queue.length}</div>
          <div className="text-[10px] text-gray-400">Pending moderator confirmation</div>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E4EAF2] shadow-sm space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#16B364] mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Verification Queue is Completely Clear!</h3>
          <p className="text-xs text-gray-500">All submitted task proofs have been verified and processed in the ledger.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Queue Item Switcher */}
          {queue.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-500 shrink-0 ml-1">Pending Queue:</span>
              <div className="flex items-center gap-2">
                {queue.map((sub) => {
                  const isSelected = sub.id === currentSubmission?.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubmissionId(sub.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#168BFF] text-white shadow-sm ring-2 ring-[#168BFF]/30'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <UserAvatar src={sub.contributorAvatar} name={sub.contributorName} size="xs" />
                      <span className="truncate max-w-[120px]">{sub.contributorName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {sub.reward}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Contributor Submission & Screenshot Proof (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E4EAF2] shadow-sm space-y-5">
            
            {/* Contributor Metadata */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <UserAvatar src={currentSubmission.contributorAvatar} name={currentSubmission.contributorName} className="ring-2 ring-[#168BFF]/20" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{currentSubmission.contributorName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span className="text-[#16B364] font-semibold">{currentSubmission.contributorLevel}</span>
                    <span>&bull;</span>
                    <span>{currentSubmission.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-[#16B364]">{currentSubmission.reward}</span>
                <span className="text-[10px] text-gray-400 block font-mono">Submission #{currentSubmission.id}</span>
              </div>
            </div>

            {/* Task Info */}
            <div className="space-y-1 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Associated Task</span>
              <p className="text-xs font-bold text-gray-900">{currentSubmission.taskTitle}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Campaign: <strong>{currentSubmission.campaignName}</strong></span>
                <span>Submitted: <strong>{currentSubmission.submittedAt}</strong></span>
              </div>
            </div>

            {/* Proof Screenshot Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Proof Screenshot Evidence</span>
                <a
                  href={currentSubmission.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#168BFF] hover:underline flex items-center gap-1"
                >
                  <span>Open Live Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-black/5 max-h-96 flex items-center justify-center p-2 relative group">
                <img
                  src={currentSubmission.screenshotUrl}
                  alt="Proof Screenshot"
                  className="max-h-88 w-auto object-contain rounded-xl shadow-xs"
                />
                <a
                  href={currentSubmission.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Resolution</span>
                </a>
              </div>
            </div>

            {/* Contributor Note */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-100 text-xs text-gray-600">
              <span className="font-bold text-gray-700 block mb-0.5">Contributor Remark:</span>
              <p className="text-[11px] italic leading-relaxed">"{currentSubmission.note}"</p>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Evaluation & Action Adjudication (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E4EAF2] shadow-sm space-y-6">
            
            {/* AI Analysis Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#168BFF]" />
                  AI Vision Evaluation
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Simulated check — heuristic only
                  </span>
                  <span className="text-xs font-black text-[#16B364] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    {currentSubmission.ai.confidence}% Confidence
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                {currentSubmission.ai.summary}
              </p>
            </div>

            {/* Signal Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Image Quality</span>
                <span className="font-black text-gray-900">{currentSubmission.ai.quality}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Timestamp Match</span>
                <span className="font-black text-emerald-600">{currentSubmission.ai.timestampMatch}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Duplicate Hash Risk</span>
                <span className="font-black text-emerald-600">{currentSubmission.ai.duplicateRisk}% (Low)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Policy Compliance</span>
                <span className="font-black text-blue-600">{currentSubmission.ai.policyMatch}%</span>
              </div>
            </div>

            {/* Presets & Decision Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Decision Compliance Log / Reason <span className="text-red-500">*</span>
              </label>

              {/* Quick Reason Presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Quick Insert Reason:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetReasons.slice(0, 3).map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDecisionNotes(r)}
                      className="text-[10px] px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors truncate max-w-full cursor-pointer"
                    >
                      {r.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                placeholder="Required audit log note explaining approval or rejection reason..."
              />
            </div>

            {/* Decision Status Animation */}
            {decisionExecuted && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Decision executed: {decisionExecuted.toUpperCase()}. Escrow settled.</span>
              </div>
            )}

            {/* Adjudication Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDecision('approved')}
                className="w-full py-3.5 bg-[#16B364] hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Approve Proof &amp; Credit Contributor ({currentSubmission.reward})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('action_required')}
                  className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Request Resubmission (24h)
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('rejected')}
                  className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject &amp; Release Slot
                </button>
              </div>
            </div>

          </div>

          </div>
        </div>
      )}

    </div>
  );
};
