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
  Info,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { adminApi, getApiError } from '../../api';
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
    reward: `${task?.reward_cents ? (task.reward_cents / 100).toFixed(2) : '0.00'} ${submission.user?.wallet?.currency || 'USD'}`,
    taskTitle: task?.title || 'Submitted task proof',
    campaignName: campaign?.title || campaign?.business?.company_name || 'Campaign',
    submittedAt: submission.created_at ? new Date(submission.created_at).toLocaleString() : 'Just now',
    postUrl: submission.proof_data_json?.url || null,
    screenshotUrl: firstFile?.file_url || null,
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
  const [realQueue, setRealQueue] = useState<ReturnType<typeof mapSubmissionForReview>[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Active selected submission in verification queue
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisionExecuted, setDecisionExecuted] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [showSopGuide, setShowSopGuide] = useState(false);

  const reloadQueue = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.verificationQueue({ status: 'under_review' });
      if (res.success) {
        const mapped = res.data.map(mapSubmissionForReview);
        setRealQueue(mapped);
        setSelectedSubmissionId((current) => current ?? mapped[0]?.id ?? null);
      } else {
        setLoadError(res.message || 'Could not load verification queue.');
      }
    } catch (err) {
      setLoadError(getApiError(err, 'Could not load verification queue.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (!alive) return;
      await reloadQueue();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Queue comes from the real API only — no demo fallback.
  const queue = realQueue;
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
      setDecisionError('A decision reason is mandatory for compliance and audit logging.');
      return;
    }

    setIsProcessing(true);
    setDecisionError(null);
    try {
      const res = await adminApi.recordDecision(currentSubmission.id, {
        decision: action,
        notes: decisionNotes,
      });
      if (res.success) {
        setRealQueue((items) => items.filter((item) => item.id !== currentSubmission.id));
        setDecisionExecuted(action);
        setDecisionNotes('');
        // Pick next pending submission
        const remaining = queue.filter((s) => s.id !== currentSubmission.id);
        setSelectedSubmissionId(remaining.length > 0 ? remaining[0].id : null);
      } else {
        setDecisionError(res.message || 'Could not record the decision.');
      }
    } catch (err) {
      setDecisionError(getApiError(err, 'Could not record the decision. Nothing was applied.'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading verification queue…
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans max-w-7xl mx-auto">
      
      {/* 1. HEADER & QUEUE STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">AI Verification Center</h2>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-gray-400 mt-0.5">
            Proof review with heuristic AI pre-screen scores and manual decision recording. Human review remains mandatory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSopGuide(!showSopGuide)}
            className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 dark:bg-blue-500/15 text-[#168BFF] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showSopGuide ? 'Hide SOP Rules' : 'Verification SOP Rules'}</span>
          </button>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-500/30">
            {queue.length} Submissions in Queue
          </span>
        </div>
      </div>

      {/* 3. LIVE QUEUE COUNT — the only metric shown, because it is real */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl p-5 border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Queue</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{queue.length}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">Submissions awaiting a human decision</div>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load verification queue</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{loadError}</p>
            <button
              type="button"
              onClick={() => void reloadQueue()}
              className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* 2. SOP & AI CRITERIA EXPLANATION ACCORDION */}
      {showSopGuide && (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-6 border border-blue-200 dark:border-blue-500/30 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              <ShieldCheck className="w-5 h-5 text-[#168BFF]" />
              <span>Standard Operating Procedure (SOP): How Verification Works</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Algorithm Version: Heuristic Pre-Check (Simulated)</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong>Simulated check — heuristic only.</strong> The backend currently uses a
            heuristic pre-check (mock AI provider), not a production computer-vision service.
            Every score and auto-decision below is a placeholder. Human review remains mandatory.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/15 border border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                  Confidence ≥ 90%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-[#16B364] font-bold text-[10px]">
                  Auto-Approve
                </span>
              </div>
              <p className="text-emerald-950 text-[11px] leading-relaxed">
                Computer vision validates image hash, device timestamp matches submission time within 15 minutes, and all required keywords/hashtags exist in the OCR stream.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-500/15 border border-amber-100 dark:border-amber-500/25 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider text-[11px]">
                  Confidence 70% - 89%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  Moderator Queue
                </span>
              </div>
              <p className="text-amber-950 text-[11px] leading-relaxed">
                Quarantined for human spot-check. Commonly caused by partial image cropping, dark mode variations, or non-English system clocks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-500/10 border border-red-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-800 uppercase tracking-wider text-[11px]">
                  Confidence {'<'} 70% / Fraud
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 font-bold text-[10px]">
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

      {queue.length === 0 ? (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl p-12 text-center border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#16B364] mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Verification queue is clear</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Nothing is waiting for review right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Queue Item Switcher */}
          {queue.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 bg-white dark:bg-[#0C1322] p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0 ml-1">Pending Queue:</span>
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
                          : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <UserAvatar src={sub.contributorAvatar} name={sub.contributorName} size="xs" />
                      <span className="truncate max-w-[120px]">{sub.contributorName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700 dark:text-gray-300'}`}>
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
          <div className="lg:col-span-7 bg-white dark:bg-[#0C1322] rounded-3xl p-6 border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-5">
            
            {/* Contributor Metadata */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <UserAvatar src={currentSubmission.contributorAvatar} name={currentSubmission.contributorName} className="ring-2 ring-[#168BFF]/20" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{currentSubmission.contributorName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="text-[#16B364] font-semibold">{currentSubmission.contributorLevel}</span>
                    <span>•</span>
                    <span>{currentSubmission.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-[#16B364]">{currentSubmission.reward}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block font-mono">Submission #{currentSubmission.id}</span>
              </div>
            </div>

            {/* Task Info */}
            <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-3.5 rounded-2xl border border-gray-100 dark:border-white/10">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Associated Task</span>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{currentSubmission.taskTitle}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                <span>Campaign: <strong>{currentSubmission.campaignName}</strong></span>
                <span>Submitted: <strong>{currentSubmission.submittedAt}</strong></span>
              </div>
            </div>

            {/* Proof Screenshot Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Proof Screenshot Evidence</span>
                {currentSubmission.postUrl && (
                  <a
                    href={currentSubmission.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#168BFF] hover:underline flex items-center gap-1"
                  >
                    <span>Open Live Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {currentSubmission.screenshotUrl ? (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-black/5 max-h-96 flex items-center justify-center p-2 relative group">
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
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/20 p-8 text-center text-xs text-gray-400 dark:text-gray-500">
                  No screenshot file attached to this submission.
                </div>
              )}
            </div>

            {/* Contributor Note */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-gray-100 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Contributor Remark:</span>
              <p className="text-[11px] italic leading-relaxed">"{currentSubmission.note}"</p>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Evaluation & Action Adjudication (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0C1322] rounded-3xl p-6 border border-[#E4EAF2] dark:border-white/10 shadow-sm space-y-6">
            
            {/* AI Analysis Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#168BFF]" />
                  AI Vision Evaluation
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-300">
                    Simulated check — heuristic only
                  </span>
                  <span className="text-xs font-black text-[#16B364] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
                    {currentSubmission.ai.confidence}% Confidence
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-blue-50/50 dark:bg-blue-500/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-500/25">
                {currentSubmission.ai.summary}
              </p>
            </div>

            {/* Signal Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Image Quality</span>
                <span className="font-black text-gray-900 dark:text-gray-100">{currentSubmission.ai.quality}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Timestamp Match</span>
                <span className="font-black text-emerald-600">{currentSubmission.ai.timestampMatch}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Duplicate Hash Risk</span>
                <span className="font-black text-emerald-600">{currentSubmission.ai.duplicateRisk}% (Low)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Policy Compliance</span>
                <span className="font-black text-blue-600">{currentSubmission.ai.policyMatch}%</span>
              </div>
            </div>

            {/* Presets & Decision Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Decision Compliance Log / Reason <span className="text-red-500">*</span>
              </label>

              {/* Quick Reason Presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block uppercase">Quick Insert Reason:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetReasons.slice(0, 3).map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDecisionNotes(r)}
                      className="text-[10px] px-2.5 py-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg transition-colors truncate max-w-full cursor-pointer"
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
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#168BFF]"
                placeholder="Required audit log note explaining approval or rejection reason..."
              />
            </div>

            {/* Decision Status Animation */}
            {decisionExecuted && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Decision recorded: {decisionExecuted.toUpperCase()}. The server applied the outcome.</span>
              </div>
            )}

            {decisionError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{decisionError}</span>
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
                <span>Approve Proof & Credit Contributor ({currentSubmission.reward})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('action_required')}
                  className="py-2.5 bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/20 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Request Resubmission (24h)
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('rejected')}
                  className="py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 dark:bg-red-500/15 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject & Release Slot
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
