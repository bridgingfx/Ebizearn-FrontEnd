import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Building2, Wallet, Save, FileText } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { api } from '../../api/client';
import { fmtMoney } from '../common/ui';
import { PLATFORM_OPTIONS, PlatformBrandIcon } from '../common/PlatformBrandIcon';
import { usePlatforms } from '../../api/platforms';
import { CampaignLivePreview } from './CampaignLivePreview';
import { GeoTargetSelector, geoTargetToCountries, type GeoTarget } from '../campaign/GeoTargetSelector';
import {
  deleteDraft,
  emptyDraftData,
  isDraftEmpty,
  listDrafts,
  saveDraft,
  type CampaignDraft,
  type CampaignDraftData,
} from '../../lib/campaignDrafts';

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

// What link the contributor needs, based on the task type.
const urlHintFor = (taskTypeKey: string): { label: string; help: string; placeholder: string } => {
  switch (taskTypeKey) {
    case 'follow':
    case 'community':
      return {
        label: 'Profile / channel link *',
        help: 'Paste the exact profile or channel URL the contributor must follow or join.',
        placeholder: 'https://instagram.com/your-profile',
      };
    case 'like_comment':
    case 'share':
    case 'watch':
      return {
        label: 'Post / video link *',
        help: 'Paste the exact post or video URL the contributor must like, comment on, share, or watch.',
        placeholder: 'https://instagram.com/p/…',
      };
    case 'app_test':
    case 'survey':
    case 'ugc':
    case 'referral':
      return {
        label: 'Page / app link',
        help: 'Paste the exact page, product, or app URL the contributor must visit.',
        placeholder: 'https://example.com/your-page',
      };
    default:
      return {
        label: 'Target link',
        help: 'If the contributor must open a specific link, paste it here.',
        placeholder: 'https://…',
      };
  }
};

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

export const CreateCampaignModal: React.FC<{
  onClose: () => void;
  onCreated: () => void;
  initial?: CampaignPrefill;
  resumeDraft?: CampaignDraft | null;
}> = ({ onClose, onCreated, initial, resumeDraft }) => {
  const draftSeed: CampaignDraftData | null = resumeDraft?.data ?? null;

  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);

  const [businessId, setBusinessId] = useState(draftSeed?.businessId ?? '');
  const [title, setTitle] = useState(draftSeed?.title ?? initial?.title ?? '');
  const [objective, setObjective] = useState(draftSeed?.objective ?? '');
  const [description, setDescription] = useState(draftSeed?.description ?? initial?.description ?? '');
  const [instructions, setInstructions] = useState(draftSeed?.instructions ?? initial?.instructions ?? '');
  const [categoryId, setCategoryId] = useState(draftSeed?.categoryId ?? '');
  const [taskTypeKey, setTaskTypeKey] = useState(draftSeed?.taskTypeKey ?? initial?.taskTypeKey ?? '');
  const [platform, setPlatform] = useState(draftSeed?.platform ?? initial?.platform ?? '');
  const [targetUrl, setTargetUrl] = useState(draftSeed?.targetUrl ?? '');
  const [geoTarget, setGeoTarget] = useState<GeoTarget>({ mode: 'global' });
  const [rewardUsd, setRewardUsd] = useState(draftSeed?.rewardUsd ?? '1.00');
  const [contributors, setContributors] = useState(draftSeed?.contributors ?? '10');
  const [minLevel, setMinLevel] = useState(draftSeed?.minLevel ?? 'starter');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Draft bookkeeping.
  const [draftId, setDraftId] = useState<string | null>(resumeDraft?.id ?? null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(resumeDraft?.updatedAt ?? null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(!!resumeDraft);
  const submittedRef = useRef(false);

  // Platforms Super Admin configured (API) — falls back to the built-in set.
  const { platforms: platformOptions } = usePlatforms();

  const seedTypes = async () => {
    setSeeding(true);
    try {
      const res = await adminApi.seedTaskTypes();
      if (res.success) {
        const typeRes = await api.get('/task-types');
        setTaskTypes((((typeRes.data?.data ?? typeRes.data ?? []) as TaskType[]).filter((t) => t.reward_band_max_cents > 0)));
      } else {
        setRefError(res.message || 'Could not seed task types.');
      }
    } catch (e) {
      setRefError(getApiError(e, 'Could not seed task types.'));
    } finally {
      setSeeding(false);
    }
  };

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
  // Minimum reward comes from the selected task type's band (e.g. Follow allows $0.10),
  // not a hardcoded $0.20 — the band is the source of truth.
  const minRewardCents = selectedType ? selectedType.reward_band_min_cents : 1;
  const bandOk =
    !selectedType ||
    (rewardCents >= selectedType.reward_band_min_cents && rewardCents <= selectedType.reward_band_max_cents);

  // Engagement tasks are meaningless without the link the contributor must open.
  const urlRequired = ['follow', 'like_comment', 'share', 'watch', 'community'].includes(taskTypeKey);
  const urlValid = !urlRequired || /^https?:\/\/.+\..+/.test(targetUrl.trim());

  const canSubmit =
    businessId &&
    title.trim() &&
    description.trim() &&
    instructions.trim() &&
    categoryId &&
    taskTypeKey &&
    rewardCents >= minRewardCents &&
    contributorCount >= 5 &&
    bandOk &&
    urlValid &&
    !submitting;

  // Live preview data — every keystroke in the form flows straight here.
  const selectedPlatform = platformOptions.find((p) => p.key === platform);
  const previewData = {
    title,
    objective,
    description,
    businessName: businesses.find((b) => String(b.id) === businessId)?.company_name ?? '',
    categoryName: categories.find((c) => String(c.id) === categoryId)?.name ?? '',
    taskTypeName: selectedType?.name ?? '',
    platform,
    platformLogoUrl: selectedPlatform?.logo_url ?? null,
    platformBrandColor: selectedPlatform?.brand_color ?? null,
    targetUrl: targetUrl.trim(),
    rewardCents,
    contributors: contributorCount,
    minLevel,
    totalCents: rewardsBudget + fee,
  };

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
        target_url: targetUrl.trim() || undefined,
        target_countries: geoTargetToCountries(geoTarget),
        instructions_markdown: instructions.trim(),
        min_contributor_level: minLevel,
      });
      if (res.success) {
        // Published — the draft is no longer needed.
        if (draftId) deleteDraft(draftId);
        submittedRef.current = true;
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

  // ---- Draft auto-save -------------------------------------------------
  const draftData: CampaignDraftData = {
    businessId, title, objective, description, instructions,
    categoryId, taskTypeKey, platform, targetUrl,
    rewardUsd, contributors, minLevel,
  };
  const draftDirty = !isDraftEmpty(draftData);

  // Auto-save 1.5s after the user stops typing.
  useEffect(() => {
    if (submittedRef.current || !draftDirty) return;
    const t = setTimeout(() => {
      const saved = saveDraft(draftData, draftId ?? undefined);
      setDraftId(saved.id);
      setDraftSavedAt(saved.updatedAt);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, title, objective, description, instructions, categoryId, taskTypeKey, platform, targetUrl, rewardUsd, contributors, minLevel]);

  const saveDraftNow = () => {
    const saved = saveDraft(draftData, draftId ?? undefined);
    setDraftId(saved.id);
    setDraftSavedAt(saved.updatedAt);
  };

  const startFresh = () => {
    if (draftId) deleteDraft(draftId);
    const fresh = emptyDraftData();
    setBusinessId(fresh.businessId);
    setTitle(fresh.title);
    setObjective(fresh.objective);
    setDescription(fresh.description);
    setInstructions(fresh.instructions);
    setCategoryId(fresh.categoryId);
    setTaskTypeKey(fresh.taskTypeKey);
    setPlatform(fresh.platform);
    setTargetUrl(fresh.targetUrl);
    setRewardUsd(fresh.rewardUsd);
    setContributors(fresh.contributors);
    setMinLevel(fresh.minLevel);
    setDraftId(null);
    setDraftSavedAt(null);
    setRestoredNotice(false);
  };

  // Close: if there's unsaved work, ask first.
  const requestClose = () => {
    if (submittedRef.current || !draftDirty) {
      onClose();
      return;
    }
    saveDraftNow(); // always keep a draft copy
    setShowCloseDialog(true);
  };

  const closeAndDiscard = () => {
    if (draftId) deleteDraft(draftId);
    setShowCloseDialog(false);
    onClose();
  };

  const closeKeepDraft = () => {
    setShowCloseDialog(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={requestClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-20 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">Post a campaign</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Publish on behalf of a business — funded from their wallet, held in escrow, parked for approval.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {draftSavedAt && draftDirty && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Save className="w-3.5 h-3.5" />
                Draft saved
              </span>
            )}
            <button
              type="button"
              onClick={requestClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {restoredNotice && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Your unfinished draft was restored — pick up where you left off.
              </p>
              <button
                type="button"
                onClick={startFresh}
                className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
              >
                Start fresh
              </button>
            </div>
          )}
          {loadingRefs ? (
            <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading businesses, categories and task types…
            </div>
          ) : refError ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {refError}
            </div>
          ) : (
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
              {/* Live preview — left side, updates as the form is filled. */}
              <CampaignLivePreview data={previewData} />
              <div className="space-y-4 min-w-0">
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
                  {taskTypes.length === 0 && !loadingRefs && (
                    <button
                      type="button"
                      onClick={() => void seedTypes()}
                      disabled={seeding}
                      className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline disabled:opacity-50"
                    >
                      {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {seeding ? 'Restoring…' : 'Or restore the standard list now'}
                    </button>
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
                <div className="sm:col-span-2">
                  <label className={labelCls}>Target platform</label>
                  <div className="flex flex-wrap gap-2">
                    {platformOptions.map((p) => {
                      const active = platform === p.key;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setPlatform(active ? '' : p.key)}
                          title={p.name}
                          className={`inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-full border text-xs font-bold transition-colors ${
                            active
                              ? 'border-[#168BFF] bg-[#168BFF]/10 text-gray-900 dark:text-gray-100'
                              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          <PlatformBrandIcon platform={p.key} logoUrl={p.logo_url} brandColor={p.brand_color} className="w-5 h-5" />
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  {(() => {
                    const hint = urlHintFor(taskTypeKey);
                    return (
                      <>
                        <label className={labelCls}>{hint.label}</label>
                        <input
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          type="url"
                          inputMode="url"
                          placeholder={hint.placeholder}
                          className={inputCls}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint.help}</p>
                      </>
                    );
                  })()}
                </div>
                <div className="sm:col-span-2">
                  <GeoTargetSelector value={geoTarget} onChange={setGeoTarget} />
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
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-base">
                      Total budget: {fmtMoney(rewardsBudget + fee)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {contributorCount.toLocaleString()} contributors × {fmtMoney(rewardCents)} each = {fmtMoney(rewardsBudget)} rewards + {fmtMoney(fee)} platform fee (15%)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-20 bg-white dark:bg-[#141821] border-t border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={requestClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!draftDirty}
            onClick={() => { saveDraftNow(); closeKeepDraft(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save draft
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

      {showCloseDialog && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCloseDialog(false)} />
          <div className="relative bg-white dark:bg-[#1a1f2b] rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Keep your progress?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Your campaign was auto-saved as a draft. You can come back and finish it any time.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={closeKeepDraft}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors"
              >
                Save draft & close
              </button>
              <button
                type="button"
                onClick={closeAndDiscard}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Discard draft
              </button>
              <button
                type="button"
                onClick={() => setShowCloseDialog(false)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
