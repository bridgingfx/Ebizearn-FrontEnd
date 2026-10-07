import React, { useEffect, useState } from 'react';
import { X, Loader2, Building2, Wallet } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { api } from '../../api/client';
import { fmtMoney } from '../common/ui';

interface BusinessOption {
  id: number;
  company_name: string;
  available_balance_cents: number;
}

interface TaskCategory {
  id: number;
  name: string;
}

interface TaskType {
  key: string;
  name: string;
  reward_band_min_cents: number;
  reward_band_max_cents: number;
}

const ESTIMATED_FEE_PERCENT = 15;
const CONTRIBUTOR_LEVELS = ['starter', 'explorer', 'trusted', 'pro', 'elite'];

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

/**
 * Admin "post a campaign" modal. The admin picks the business the campaign
 * belongs to, fills the same fields a business would, and the backend runs
 * the identical creation pipeline (reward bands, funding gate against the
 * business wallet, escrow hold, parked in pending_review for approval).
 * `initial` pre-fills the form from a Task Library template.
 */
export interface CampaignPrefill {
  title?: string;
  description?: string;
  instructions?: string;
  taskTypeKey?: string | null;
  platform?: string | null;
}

export const CreateCampaignModal: React.FC<{ onClose: () => void; onCreated: () => void; initial?: CampaignPrefill }> = ({
  onClose,
  onCreated,
  initial,
}) => {
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);

  const [businessId, setBusinessId] = useState('');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [taskTypeKey, setTaskTypeKey] = useState(initial?.taskTypeKey ?? '');
  const [platform, setPlatform] = useState(initial?.platform ?? '');
  const [rewardUsd, setRewardUsd] = useState('1.00');
  const [contributors, setContributors] = useState('10');
  const [minLevel, setMinLevel] = useState('starter');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bizRes, catRes, typeRes] = await Promise.all([
          adminApi.staffBusinessOptions(),
          api.get('/task-categories'),
          api.get('/task-types'),
        ]);
        if (cancelled) return;
        setBusinesses(
          (bizRes?.data ?? []).map((b) => ({
            id: b.id,
            company_name: b.company_name || `Business #${b.id}`,
            available_balance_cents: b.available_balance_cents,
          })),
        );
        setCategories((catRes.data?.data ?? catRes.data ?? []) as TaskCategory[]);
        setTaskTypes(((typeRes.data?.data ?? typeRes.data ?? []) as TaskType[]).filter((t) => t.reward_band_max_cents > 0));
      } catch (e) {
        if (!cancelled) setRefError(getApiError(e, 'Could not load reference data.'));
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedType = taskTypes.find((t) => t.key === taskTypeKey);
  const rewardCents = Math.round((parseFloat(rewardUsd) || 0) * 100);
  const contributorCount = parseInt(contributors, 10) || 0;
  const rewardsBudget = rewardCents * contributorCount;
  const fee = Math.round(rewardsBudget * (ESTIMATED_FEE_PERCENT / 100));
  const bandOk =
    !selectedType ||
    (rewardCents >= selectedType.reward_band_min_cents && rewardCents <= selectedType.reward_band_max_cents);

  const canSubmit =
    businessId &&
    title.trim() &&
    description.trim() &&
    instructions.trim() &&
    categoryId &&
    taskTypeKey &&
    rewardCents >= 20 &&
    contributorCount >= 5 &&
    bandOk &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await adminApi.createStaffCampaign({
        business_id: Number(businessId),
        title: title.trim(),
        objective: objective.trim() || undefined,
        description: description.trim(),
        category_id: Number(categoryId),
        platform: platform.trim() || undefined,
        reward_per_task_cents: rewardCents,
        task_type_key: taskTypeKey,
        target_contributors_count: contributorCount,
        instructions_markdown: instructions.trim(),
        min_contributor_level: minLevel,
      });
      if (res.success) {
        onCreated();
        onClose();
      } else {
        setSubmitError(res.message || 'Could not create the campaign.');
      }
    } catch (e) {
      setSubmitError(getApiError(e, 'Could not create the campaign.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">Post a campaign</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Publish on behalf of a business — funded from their wallet, held in escrow, parked for approval.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {loadingRefs ? (
            <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading businesses, categories and task types…
            </div>
          ) : refError ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {refError}
            </div>
          ) : (
            <>
              <div>
                <label className={labelCls}>Business *</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} className={`${inputCls} pl-10 appearance-none`}>
                    <option value="">Select the business this campaign belongs to…</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.company_name} ({fmtMoney(b.available_balance_cents)} available)
                      </option>
                    ))}
                  </select>
                </div>
                {businesses.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                    No business accounts found. A campaign must belong to a business.
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Campaign title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} placeholder="e.g. Follow our Instagram and share your feedback" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Objective</label>
                  <input value={objective} onChange={(e) => setObjective(e.target.value)} maxLength={255} placeholder="Short goal line (optional)" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputCls} appearance-none`}>
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                  {taskTypes.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">No task types are configured yet. Run the backend migrations to load the catalog.</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Reward per task (USD) *</label>
                  <input
                    value={rewardUsd}
                    onChange={(e) => setRewardUsd(e.target.value)}
                    inputMode="decimal"
                    placeholder="1.00"
                    className={`${inputCls} ${!bandOk ? 'border-red-400 dark:border-red-500' : ''}`}
                  />
                  {selectedType && (
                    <p className={`text-xs mt-1.5 ${bandOk ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400 font-semibold'}`}>
                      Allowed band for {selectedType.name}: {fmtMoney(selectedType.reward_band_min_cents)} – {fmtMoney(selectedType.reward_band_max_cents)}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Contributors (min 5) *</label>
                  <input value={contributors} onChange={(e) => setContributors(e.target.value)} inputMode="numeric" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Platform</label>
                  <input value={platform} onChange={(e) => setPlatform(e.target.value)} maxLength={64} placeholder="e.g. instagram (optional)" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Min. contributor level</label>
                  <select value={minLevel} onChange={(e) => setMinLevel(e.target.value)} className={`${inputCls} appearance-none`}>
                    {CONTRIBUTOR_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l[0].toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this campaign about?" className={`${inputCls} resize-none`} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Contributor instructions *</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    placeholder="Step-by-step: what must the contributor do, and what proof to submit?"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {rewardsBudget > 0 && (
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3.5 flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-[#168BFF] mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {fmtMoney(rewardsBudget)} rewards + {fmtMoney(fee)} fee = {fmtMoney(rewardsBudget + fee)} total
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Taken from the selected business's wallet and held in escrow. The campaign parks in review until approved.
                    </p>
                  </div>
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
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Post campaign
          </button>
        </div>
      </div>
    </div>
  );
};
