import React, { useEffect, useState } from 'react';
import { Info, Loader2, X } from 'lucide-react';
import { adminApi, api, getApiError } from '../../api';
import type { StaffTaskCampaignOption } from '../../api/admin';
import type { Task } from '../../types';
import { fmtMoney } from '../common/ui';

interface TaskTypeOption {
  key: string;
  name: string;
  reward_band_min_cents: number;
  reward_band_max_cents: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF] disabled:opacity-60';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

/**
 * Create a task on a funded campaign (POST /staff/tasks, create_tasks) or
 * edit an existing one (PATCH /staff/tasks/{id}, edit_tasks). No money
 * moves here: the backend checks reward × slots against the campaign's
 * funded pool and the task type's reward band, and answers with an honest
 * 422 when either doesn't fit. A task never moves between campaigns.
 */
export const TaskFormModal: React.FC<{
  task?: Task | null;
  onClose: () => void;
  onSaved: (t: Task) => void;
}> = ({ task, onClose, onSaved }) => {
  const editing = Boolean(task);
  const [campaigns, setCampaigns] = useState<StaffTaskCampaignOption[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskTypeOption[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);

  const [campaignId, setCampaignId] = useState(task ? String(task.campaign_id) : '');
  const [taskTypeKey, setTaskTypeKey] = useState(task?.task_type?.key ?? '');
  const [title, setTitle] = useState(task?.title ?? '');
  const [rewardUsd, setRewardUsd] = useState(task ? (task.reward_cents / 100).toFixed(2) : '0.20');
  const [slots, setSlots] = useState(task ? String(task.slots_total) : '10');
  const [platform, setPlatform] = useState(task?.platform ?? '');
  const [minutes, setMinutes] = useState(task ? String(task.estimated_minutes ?? 5) : '5');
  const [difficulty, setDifficulty] = useState<Difficulty>((task?.difficulty as Difficulty) ?? 'easy');
  const [instructions, setInstructions] = useState(task?.instructions ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [campRes, typeRes] = await Promise.all([
          // Editing never changes the campaign, so the options list is only
          // needed (and only permitted) when creating.
          editing ? Promise.resolve(null) : adminApi.staffTaskCampaignOptions(),
          api.get('/task-types'),
        ]);
        if (cancelled) return;
        setCampaigns(campRes?.data ?? []);
        setTaskTypes(((typeRes.data?.data ?? typeRes.data ?? []) as TaskTypeOption[]).filter((t) => t.reward_band_max_cents > 0));
      } catch (e) {
        if (!cancelled) setRefError(getApiError(e, 'Could not load campaigns and task types.'));
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const campaign = campaigns.find((c) => String(c.id) === campaignId);
  const type = taskTypes.find((t) => t.key === taskTypeKey);
  const rewardCents = Math.round((parseFloat(rewardUsd) || 0) * 100);
  const slotCount = parseInt(slots, 10) || 0;
  const cost = rewardCents * slotCount;
  const bandOk = !type || (rewardCents >= type.reward_band_min_cents && rewardCents <= type.reward_band_max_cents);
  const slotsOk = !task || slotCount >= (task.slots_taken ?? 0);

  const pickCampaign = (id: string) => {
    setCampaignId(id);
    const c = campaigns.find((x) => String(x.id) === id);
    if (c) {
      if (!title) setTitle(c.title);
      if (!platform && c.platform) setPlatform(c.platform);
      if (!instructions && c.instructions_markdown) setInstructions(c.instructions_markdown);
    }
  };

  const canSubmit =
    campaignId && taskTypeKey && title.trim() && rewardCents > 0 && slotCount > 0 && bandOk && slotsOk && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    const fields = {
      task_type_key: taskTypeKey,
      title: title.trim(),
      reward_cents: rewardCents,
      slots_total: slotCount,
      platform: platform.trim() || undefined,
      instructions: instructions.trim() || undefined,
      estimated_minutes: parseInt(minutes, 10) || undefined,
      difficulty,
    };
    try {
      const res = task
        ? await adminApi.updateStaffTask(task.id, fields)
        : await adminApi.createStaffTask({ campaign_id: Number(campaignId), ...fields });
      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      } else {
        setSubmitError(res.message || 'Could not save the task.');
      }
    } catch (e) {
      setSubmitError(getApiError(e, 'Could not save the task.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editing ? 'Edit task' : 'Create task'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{editing ? 'Edit task' : 'Create task'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {editing
                ? `${task?.campaign?.title ?? `Campaign #${task?.campaign_id}`} — slots are paid from this campaign's escrow.`
                : "Add a task to a funded campaign. Slots are paid from that campaign's escrow."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {loadingRefs ? (
            <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : refError ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {refError}
            </div>
          ) : (
            <>
              {!editing && (
                <div>
                  <label className={labelCls}>Campaign *</label>
                  <select value={campaignId} onChange={(e) => pickCampaign(e.target.value)} className={`${inputCls} appearance-none`}>
                    <option value="">Select a funded campaign…</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — {c.business_name ?? 'Business'} ({fmtMoney(c.pool_cents)} pool)
                      </option>
                    ))}
                  </select>
                  {campaigns.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">No active, paused or in-review campaigns. Post a campaign first.</p>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Task title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Task type *</label>
                  <select value={taskTypeKey} onChange={(e) => setTaskTypeKey(e.target.value)} className={`${inputCls} appearance-none`}>
                    <option value="">Select…</option>
                    {taskTypes.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.name} ({fmtMoney(t.reward_band_min_cents)}–{fmtMoney(t.reward_band_max_cents)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Platform</label>
                  <input value={platform} onChange={(e) => setPlatform(e.target.value)} maxLength={64} placeholder="e.g. instagram" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Reward per slot (USD) *</label>
                  <input
                    value={rewardUsd}
                    onChange={(e) => setRewardUsd(e.target.value)}
                    inputMode="decimal"
                    className={`${inputCls} ${!bandOk ? 'border-red-400 dark:border-red-500' : ''}`}
                  />
                  {type && (
                    <p className={`text-xs mt-1.5 ${bandOk ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400 font-semibold'}`}>
                      Allowed band: {fmtMoney(type.reward_band_min_cents)} – {fmtMoney(type.reward_band_max_cents)}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Slots *</label>
                  <input
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    inputMode="numeric"
                    className={`${inputCls} ${!slotsOk ? 'border-red-400 dark:border-red-500' : ''}`}
                  />
                  {task && (
                    <p className={`text-xs mt-1.5 ${slotsOk ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400 font-semibold'}`}>
                      {task.slots_taken ?? 0} already taken — can't go lower.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Estimated minutes</label>
                  <input value={minutes} onChange={(e) => setMinutes(e.target.value)} inputMode="numeric" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className={`${inputCls} appearance-none`}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    placeholder="Defaults to the campaign's instructions when empty."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {campaign && cost > 0 && (
                <div
                  className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs border ${
                    cost > campaign.pool_cents
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
                      : 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/25 text-blue-900 dark:text-blue-200'
                  }`}
                >
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>
                    Up to {fmtMoney(cost)} ({slotCount} × {fmtMoney(rewardCents)}). Campaign pool: {fmtMoney(campaign.pool_cents)}
                    {cost > campaign.pool_cents ? ' — too small; the server will refuse this. Lower the slots or reward.' : '.'}
                  </p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
                  {submitError}
                </div>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-[#141821] border-t border-gray-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save task' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
};
