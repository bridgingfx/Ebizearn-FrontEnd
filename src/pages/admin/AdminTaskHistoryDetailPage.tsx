import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  MapPin,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
  Video,
  XCircle,
} from 'lucide-react';
import { taskHistoryApi, getApiError } from '../../api';
import type { ProofFile, TaskHistoryDetail } from '../../api';
import { StatusBadge, fmtMoney } from '../../components/common/ui';
import { UserAvatar } from '../../components/common/UserAvatar';
import { PlatformBrandIcon } from '../../components/common/PlatformBrandIcon';
import { useAuth } from '../../context/AuthContext';
import { humanizeAction } from '../../utils/auditLabels';
import { RewardVerificationPanel } from '../../components/admin/RewardVerificationPanel';
import { RewardStatusBadge } from '../../components/task/RewardStatusBadge';

type Decision = 'approved' | 'rejected' | 'action_required';

const DECISION_META: Record<Decision, { label: string; icon: React.ElementType; active: string; idle: string }> = {
  approved: {
    label: 'Approve',
    icon: CheckCircle2,
    active: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20',
    idle: 'border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  },
  action_required: {
    label: 'Ask for changes',
    icon: AlertTriangle,
    active: 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20',
    idle: 'border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10',
  },
  rejected: {
    label: 'Reject',
    icon: XCircle,
    active: 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20',
    idle: 'border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10',
  },
};

const humanize = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const dateTime = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString() : '—');
const isVideo = (f: { mime_type: string | null; file_url: string }) =>
  (f.mime_type ?? '').startsWith('video/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(f.file_url);
const isImage = (f: { mime_type: string | null; file_url: string }) =>
  (f.mime_type ?? '').startsWith('image/') || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(f.file_url);
const prettySize = (bytes: number | null | undefined) =>
  !bytes ? '' : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const Panel: React.FC<{ title: string; icon: React.ElementType; action?: React.ReactNode; children: React.ReactNode }> = ({ title, icon: Icon, action, children }) => (
  <section className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
    <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/10">
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#168BFF]" /> {title}
      </h2>
      {action}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const Fact: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</dt>
    <dd className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{value ?? '—'}</dd>
  </div>
);

/** One proof file: photo (opens full size), video (inline player) or other file. */
const ProofTile: React.FC<{ file: ProofFile }> = ({ file }) => (
  <figure className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
    {isVideo(file) ? (
      <video src={file.file_url} controls preload="metadata" className="w-full aspect-video bg-black" />
    ) : isImage(file) ? (
      <a href={file.file_url} target="_blank" rel="noopener noreferrer" title="Open full size" className="block">
        <img src={file.file_url} alt={humanize(file.file_type)} loading="lazy" className="w-full aspect-[4/3] object-cover group-hover:opacity-90 transition-opacity" />
      </a>
    ) : (
      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 aspect-[4/3] text-xs font-bold text-[#168BFF]">
        <FileText className="w-7 h-7" /> Open file
      </a>
    )}
    <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400">
      <span className="inline-flex items-center gap-1 font-bold">
        {isVideo(file) ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
        {humanize(file.file_type)} {prettySize(file.file_size_bytes) && `· ${prettySize(file.file_size_bytes)}`}
      </span>
      <a href={file.file_url} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#168BFF] hover:underline">
        <Download className="w-3 h-3" /> Save
      </a>
    </figcaption>
  </figure>
);

/** Admin → Task History → View: the full record of one taken task, with status controls. */
export const AdminTaskHistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const canDecide = me?.role === 'superadmin' || !!me?.permissions?.includes('review_submissions');

  const [data, setData] = useState<TaskHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState<Decision | null>(null);
  const [reasonCode, setReasonCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await taskHistoryApi.show(id);
      setData(res.data);
    } catch (e) {
      setError(getApiError(e, 'Could not load this task record.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const pick = (d: Decision) => {
    setDecision(d);
    setReasonCode(data?.reason_codes[d]?.[0] ?? '');
    setFormError(null);
  };

  const save = async () => {
    if (!data?.submission || !decision) return;
    if (notes.trim().length < 3) {
      setFormError('Add a short note for the contributor (at least 3 characters).');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await taskHistoryApi.decide(data.submission.id, { decision, reason_code: reasonCode, notes: notes.trim() });
      setDecision(null);
      setNotes('');
      await load();
    } catch (e) {
      setFormError(getApiError(e, 'Could not change the status.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-gray-400 dark:text-gray-500">
        <Loader2 className="w-7 h-7 animate-spin inline-block text-[#168BFF]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin/task-history" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft className="w-4 h-4" /> Back to Task History
        </Link>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-5 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error || 'Record not found.'}
        </div>
      </div>
    );
  }

  const { assignment, submission, timeline } = data;
  const task = assignment.task;
  const campaign = task?.campaign;
  const contributor = assignment.user;
  const proof = submission?.proof_data_json ?? {};
  const files = submission?.files ?? [];
  const ai = submission?.ai_result;
  const platform = task?.platform || campaign?.platform || '';

  return (
    <div className="space-y-6">
      <Link to="/admin/task-history" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
        <ArrowLeft className="w-4 h-4" /> Back to Task History
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07182F] via-[#0B2A57] to-[#1B2F7A] p-6 sm:p-7 text-white">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#168BFF]/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {platform ? (
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                <PlatformBrandIcon platform={platform} className="w-8 h-8" />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200/80">
                {campaign?.business?.company_name ?? 'Task'} · Record #{assignment.id}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">{task?.title ?? 'Deleted task'}</h1>
              <p className="text-sm text-blue-100/80 mt-0.5">
                Taken by <span className="font-bold text-white">{contributor?.name ?? 'Deleted user'}</span> on {dateTime(assignment.started_at ?? assignment.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-blue-200/70 font-bold">Reward</p>
              <p className="text-xl font-extrabold text-emerald-300 tabular-nums">{fmtMoney(task?.reward_cents)}</p>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div className="bg-white rounded-full">
              <RewardStatusBadge status={data.status} rewardStatus={submission?.reward_status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Proof */}
          <Panel
            title="Submitted proof"
            icon={ShieldCheck}
            action={submission ? <span className="text-[11px] text-gray-400 dark:text-gray-500">Sent {dateTime(submission.created_at)}</span> : undefined}
          >
            {!submission ? (
              <div className="text-center py-8">
                <Clock className="w-7 h-7 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-200">No proof submitted yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The contributor started this task ({humanize(assignment.status)}).
                  {assignment.reserved_until ? ` Slot reserved until ${dateTime(assignment.reserved_until)}.` : ''}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {proof.url && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Submitted link</p>
                    <a
                      href={proof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-sm font-semibold text-[#168BFF] dark:text-blue-300 hover:bg-blue-100/60 dark:hover:bg-blue-500/15 break-all"
                    >
                      <Link2 className="w-4 h-4 shrink-0" /> {proof.url}
                      <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0" />
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                    Photos & videos ({files.length})
                  </p>
                  {files.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No files attached.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((f) => (
                        <ProofTile key={f.id} file={f} />
                      ))}
                    </div>
                  )}
                </div>

                {(proof.text_answer || proof.note) && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {proof.text_answer && (
                      <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Answer</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{proof.text_answer}</p>
                      </div>
                    )}
                    {proof.note && (
                      <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                          <MessageSquareText className="w-3 h-3" /> Contributor note
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{proof.note}</p>
                      </div>
                    )}
                  </div>
                )}

                {(proof.device || proof.location) && (
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    {proof.device && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5">
                        <Smartphone className="w-3 h-3" /> {proof.device}
                      </span>
                    )}
                    {proof.location && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5">
                        <MapPin className="w-3 h-3" /> {proof.location}
                      </span>
                    )}
                  </div>
                )}

                {assignment.content && (
                  <div className="rounded-xl border border-violet-200 dark:border-violet-500/25 bg-violet-50/50 dark:bg-violet-500/5 p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-1">Post text given to this contributor</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{assignment.content}</p>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <RewardVerificationPanel data={data} assignmentId={assignment.id} canAct={canDecide} onDone={() => void load()} />

          {/* AI check */}
          {ai && (
            <Panel title="Automatic check" icon={Bot}>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Fact label="Confidence" value={ai.confidence_score != null ? `${Math.round(Number(ai.confidence_score))}%` : '—'} />
                <Fact label="Risk" value={ai.risk_score != null ? `${Math.round(Number(ai.risk_score))} / 100` : '—'} />
                <Fact label="Suggestion" value={ai.suggested_decision ? humanize(ai.suggested_decision) : '—'} />
              </dl>
              {ai.analysis_summary && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{ai.analysis_summary}</p>}
            </Panel>
          )}

          {/* Task */}
          <Panel
            title="Task details"
            icon={Briefcase}
            action={
              task ? (
                <Link to="/admin/tasks" className="text-[11px] font-bold text-[#168BFF] dark:text-blue-300 hover:underline">
                  All tasks
                </Link>
              ) : undefined
            }
          >
            {!task ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">This task was deleted.</p>
            ) : (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Fact label="Campaign" value={campaign?.title} />
                  <Fact label="Platform" value={platform || '—'} />
                  <Fact label="Category" value={task.category?.name} />
                  <Fact label="Slots" value={`${task.slots_taken} / ${task.slots_total}`} />
                </dl>
                {campaign?.target_url && (
                  <a href={campaign.target_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] dark:text-blue-300 hover:underline break-all">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {campaign.target_url}
                  </a>
                )}
                {(task.instructions || campaign?.description) && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-white/5 rounded-xl p-3.5">
                    {task.instructions || campaign?.description}
                  </p>
                )}
                {(campaign?.content_image_url || (campaign?.media?.length ?? 0) > 0) && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Campaign media</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {campaign?.content_image_url && (
                        <a href={campaign.content_image_url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                          <img src={campaign.content_image_url} alt="Post image" className="w-full h-full object-cover" />
                        </a>
                      )}
                      {campaign?.media?.map((m) =>
                        m.type === 'video' ? (
                          <video key={m.id} src={m.url} controls preload="metadata" className="aspect-square w-full rounded-xl bg-black object-cover" />
                        ) : (
                          <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                            <img src={m.url} alt={m.original_name ?? ''} loading="lazy" className="w-full h-full object-cover" />
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Timeline */}
          <Panel title="Activity" icon={ScrollText}>
            {timeline.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No recorded activity for this task yet.</p>
            ) : (
              <ol className="relative border-l border-gray-200 dark:border-white/10 ml-2 space-y-4">
                {timeline.map((t) => (
                  <li key={t.id} className="ml-4">
                    <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-[#168BFF] ring-4 ring-white dark:ring-[#0C1322]" />
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{humanizeAction(t.action)}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {dateTime(t.created_at)}
                      {t.actor ? ` · ${t.actor.name} (${t.actor.role})` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status control */}
          <Panel title="Status" icon={CheckCircle2}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Current</span>
              <StatusBadge status={data.status} />
            </div>

            {submission?.reviewed_at && (
              <div className="mt-4 rounded-xl bg-gray-50 dark:bg-white/5 p-3.5 space-y-1">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Reviewed {dateTime(submission.reviewed_at)}
                  {submission.reviewer ? ` by ${submission.reviewer.name}` : ''}
                </p>
                {submission.review_reason_code && <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{humanize(submission.review_reason_code)}</p>}
                {submission.review_notes && <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{submission.review_notes}</p>}
              </div>
            )}

            {submission?.business_decision && (
              <div className="mt-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-3 text-xs text-gray-600 dark:text-gray-300">
                Business recommends <span className="font-bold">{submission.business_decision}</span>
                {submission.business_reason ? ` — ${submission.business_reason}` : ''}
              </div>
            )}

            {!submission ? (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">The status can be changed once the contributor submits proof.</p>
            ) : !canDecide ? (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">You need the "Review task submissions" permission to change the status.</p>
            ) : data.next_decisions.length === 0 ? (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">This status is final — rejected proofs can't be reopened.</p>
            ) : (
              <div className="mt-5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Change status</p>
                <div className="grid gap-2">
                  {data.next_decisions.map((d) => {
                    const meta = DECISION_META[d];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => pick(d)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${decision === d ? meta.active : meta.idle}`}
                      >
                        <Icon className="w-4 h-4" /> {meta.label}
                        {d === 'rejected' && data.status === 'approved' && <span className="ml-auto text-[10px] opacity-80">reverses the reward</span>}
                      </button>
                    );
                  })}
                </div>

                {decision && (
                  <div className="space-y-2.5 pt-1">
                    <label className="block">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Reason</span>
                      <select
                        value={reasonCode}
                        onChange={(e) => setReasonCode(e.target.value)}
                        className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                      >
                        {(data.reason_codes[decision] ?? []).map((c) => (
                          <option key={c} value={c}>{humanize(c)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Note to the contributor</span>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={1000}
                        placeholder={decision === 'approved' ? 'e.g. Follow confirmed — thanks!' : 'Explain what was wrong or what to fix'}
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                      />
                    </label>
                    {formError && <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDecision(null)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void save()}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#2F80FF] text-white text-xs font-bold disabled:opacity-60"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save — {DECISION_META[decision].label}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">The contributor is emailed. Approving pays the reward; rejecting an approved proof takes it back.</p>
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Contributor */}
          <Panel
            title="Contributor"
            icon={UserIcon}
            action={
              contributor ? (
                <Link to={`/admin/users/${contributor.id}`} className="text-[11px] font-bold text-[#168BFF] dark:text-blue-300 hover:underline">
                  Open profile
                </Link>
              ) : undefined
            }
          >
            {!contributor ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">This account was deleted.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserAvatar src={contributor.profile?.avatar_url} name={contributor.name} email={contributor.email} size="lg" />
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-gray-900 dark:text-gray-100 truncate">{contributor.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contributor.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <StatusBadge status={contributor.status} />
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-4">
                  <Fact label="Country" value={contributor.profile?.country_code} />
                  <Fact label="Level" value={contributor.profile?.contributor_level ? humanize(contributor.profile.contributor_level) : '—'} />
                  <Fact label="Approval rate" value={contributor.profile?.approval_rate != null ? `${contributor.profile.approval_rate}%` : '—'} />
                  <Fact label="Completed" value={contributor.profile?.completed_tasks_count ?? 0} />
                  <Fact label="KYC" value={contributor.profile?.kyc_status ? humanize(contributor.profile.kyc_status) : '—'} />
                  <Fact label="Fraud score" value={contributor.profile?.fraud_score != null ? `${contributor.profile.fraud_score} / 100` : '—'} />
                  <Fact label="Wallet" value={contributor.wallet ? fmtMoney(contributor.wallet.available_balance_cents) : '—'} />
                  <Fact label="Joined" value={new Date(contributor.created_at).toLocaleDateString()} />
                </dl>
              </div>
            )}
          </Panel>

          {/* Dates */}
          <Panel title="Dates" icon={Clock}>
            <dl className="space-y-3">
              <Fact label="Started" value={dateTime(assignment.started_at ?? assignment.created_at)} />
              <Fact label="Proof submitted" value={dateTime(submission?.created_at)} />
              <Fact label="Reviewed" value={dateTime(submission?.reviewed_at)} />
              {submission?.bonus_cents ? <Fact label="Rank bonus" value={fmtMoney(submission.bonus_cents)} /> : null}
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
};
