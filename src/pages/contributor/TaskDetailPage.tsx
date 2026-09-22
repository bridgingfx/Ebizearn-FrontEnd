import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  X,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { mapTaskForUi, money } from '../../utils/apiMappers';
import type { UiTask, TaskSubmission } from '../../types';
import { PlatformPreview } from '../../components/task/PlatformPreview';
import { VerificationTimeline } from '../../components/task/VerificationTimeline';
import { humanizeRetention, initials, proofRequirementLabels } from '../../components/task/TaskCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useRequireVerifiedEmail } from '../../components/auth/EmailVerification';

/**
 * Phase 5 — split-screen task execution.
 * LEFT: platform preview mockup (driven by task platform/type from the API).
 * RIGHT: contributor action panel (start task, upload screenshot, proof URL,
 * submit → real submission endpoint, then the live verification status flow).
 */
export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { requireVerified, gate } = useRequireVerifiedEmail();
  const [task, setTask] = useState<UiTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Execution state
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Proof form
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<TaskSubmission | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tasksApi
      .get(id)
      .then((res) => {
        if (res.success && res.data) {
          setTask(mapTaskForUi(res.data));
          setLoadError(null);
        } else {
          setLoadError('Task not found or no longer available.');
        }
      })
      .catch((err) => setLoadError(getApiError(err, 'Could not load this task.')))
      .finally(() => setLoading(false));

    // Check whether the contributor already submitted for this task.
    tasksApi
      .myTasks()
      .then((res) => {
        if (res.success && res.data) {
          const mine = res.data.find((s) => String(s.task_id) === String(id) || s.task?.uuid === id);
          if (mine) {
            setSubmission(mine);
            setStarted(true);
          }
        }
      })
      .catch(() => undefined);
  }, [id]);

  const handleStart = async () => {
    if (!task) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await tasksApi.start(task.uuid || task.id);
      if (res.success !== false) {
        setStarted(true);
      } else {
        setStartError(res.message || 'Could not reserve this task right now.');
      }
    } catch (err) {
      setStartError(getApiError(err, 'Could not reserve this task right now.'));
    } finally {
      setStarting(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError('Screenshot must be under 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setScreenshotName(file.name);
      setSubmitError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Proof submission is a money-moving action — verified email required.
    if (!requireVerified()) return;
    if (!task) return;
    setSubmitError(null);

    const url = proofUrl.trim();
    if (!url && !screenshot && !note.trim()) {
      setSubmitError('Add a proof URL, upload a screenshot, or write a note — at least one is required.');
      return;
    }
    if (url && !/^https?:\/\//i.test(url)) {
      setSubmitError('Proof URL must start with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      const res = await tasksApi.submit(task.uuid || task.id, {
        proof_url: url || undefined,
        proof_screenshot: screenshot,
        note: note.trim() || undefined,
      });
      if (res.success) {
        const fresh: TaskSubmission = {
          id: res.data?.submission?.id || Date.now(),
          uuid: res.data?.submission?.uuid || '',
          task_id: task.id,
          user_id: 0,
          status: 'under_review',
          proof_data_json: { url, note: note.trim() || undefined },
          created_at: new Date().toISOString(),
        };
        setSubmission(fresh);
        // Refresh real status from the API to show the true verification stage.
        tasksApi
          .myTasks()
          .then((r) => {
            const mine = r.data?.find((s) => String(s.task_id) === String(task.id) || s.task?.uuid === task.uuid);
            if (mine) setSubmission(mine);
          })
          .catch(() => undefined);
      } else {
        setSubmitError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setSubmitError(getApiError(err, 'Submission failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[#E7ECF3] h-96 animate-pulse" />
        <div className="bg-white rounded-3xl border border-[#E7ECF3] h-96 animate-pulse" />
      </div>
    );
  }

  if (loadError || !task) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          title="Task unavailable"
          description={loadError || 'This task could not be loaded. It may have been paused or completed.'}
          icon={AlertCircle}
          actionLabel="Back to available tasks"
          onAction={() => (window.location.href = '/app/tasks')}
        />
      </div>
    );
  }

  const requirements = proofRequirementLabels(task.campaign?.proof_requirements_json);

  return (
    <div className="max-w-6xl mx-auto space-y-5 text-left">
      {gate}
      <div className="flex items-center justify-between">
        <Link to="/app/tasks" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to tasks
        </Link>
        <span className="text-[11px] font-mono text-gray-400">#{task.uuid?.slice(0, 8) || task.id}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* LEFT — platform preview + task facts */}
        <div className="space-y-5">
          <PlatformPreview task={task} />

          <div className="bg-white rounded-3xl border border-[#E7ECF3] p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#07182F] text-white flex items-center justify-center text-sm font-black shrink-0">
                {initials(task.brandName)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-500">{task.brandName}</p>
                <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">{task.title}</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-gray-400">Reward</p>
                <p className="text-sm font-black text-[#16B364] mt-0.5">{money(task.reward_cents)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-gray-400">Est. time</p>
                <p className="text-sm font-black text-gray-900 mt-0.5 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {task.estimated_minutes} min
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-gray-400">Platform</p>
                <p className="text-sm font-black text-gray-900 mt-0.5">{task.platform}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-gray-400">Type</p>
                <p className="text-sm font-black text-gray-900 mt-0.5 capitalize">{task.categoryName}</p>
              </div>
            </div>

            {task.description && task.description !== task.title && (
              <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
            )}

            {requirements.length > 0 && (
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Requirements</p>
                <ul className="space-y-1.5">
                  {requirements.map((req) => (
                    <li key={req} className="text-xs text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16B364] shrink-0 mt-px" />
                      <span className="capitalize">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
              <p className="text-[11px] text-amber-800 leading-snug">
                <span className="font-black">Retention rule:</span> reversing this action before the{' '}
                {humanizeRetention(task.retentionHours)} period ends can reverse this reward.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — action panel */}
        <div className="lg:sticky lg:top-6 space-y-5">
          <div className="bg-white rounded-3xl border border-[#E7ECF3] p-5 sm:p-6 shadow-xs">
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-gray-900">Proof submitted</h2>
                    <p className="text-[11px] text-gray-500">Track your verification below — it's updated from the platform.</p>
                  </div>
                </div>
                <div className="pt-1">
                  <VerificationTimeline status={submission.status} aiResult={submission.aiResult} />
                </div>
                {submission.review_notes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <span className="text-amber-800 font-bold block mb-0.5">Reviewer note</span>
                    <p className="text-amber-900">{submission.review_notes}</p>
                  </div>
                )}
                <Link
                  to="/app/my-tasks"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline"
                >
                  View all my tasks <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : !started ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#168BFF] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">Ready to complete this task?</h2>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Reserve a slot first. Then complete the real action on {task.platform} (see the preview for guidance),
                    and submit your proof here.
                  </p>
                </div>
                {startError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-left">{startError}</div>
                )}
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="w-full py-3.5 bg-[#168BFF] hover:bg-[#2F80FF] text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#168BFF]/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{starting ? 'Reserving…' : 'Start task — reserve my slot'}</span>
                </button>
                <p className="text-[10px] text-gray-400">
                  Reserving holds one of the task's slots under your account while you work.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-gray-900">Submit your proof</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Upload a screenshot of the completed action and/or paste the proof link.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{submitError}</div>
                )}

                {/* Screenshot upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Screenshot proof</label>
                  {screenshot ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900">
                      <img src={screenshot} alt="Proof screenshot" className="w-full max-h-56 object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotName(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                        aria-label="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="absolute bottom-2 left-2 text-[10px] text-white/80 bg-black/50 rounded px-2 py-0.5 truncate max-w-[70%]">
                        {screenshotName}
                      </p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#168BFF] rounded-2xl p-6 cursor-pointer transition-colors bg-gray-50/50">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">Tap to upload screenshot</span>
                      <span className="text-[10px] text-gray-400">PNG or JPG, up to 8 MB — sent with your submission</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>

                {/* Proof URL */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Proof link (optional)</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://… link to your completed action"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Note for the reviewer (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="Anything the reviewer should know…"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#16B364] hover:bg-[#12995a] text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{submitting ? 'Submitting…' : 'Submit proof for verification'}</span>
                </button>

                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Every submission is checked for duplicates, wrong URLs, and missing requirements before a moderator
                  approves it. Rewards move Submitted → Checking → Moderator review → Approved → Pending → Available.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
