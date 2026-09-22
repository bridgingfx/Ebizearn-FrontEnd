import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Target,
  ClipboardList,
  Globe,
  Wallet,
  Eye,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { businessApi, getApiError, api } from '../../api';
import { COUNTRY_OPTIONS } from '../../config/geoLocations';

interface TaskCategory {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
}

const STEPS = [
  { id: 1, label: 'Goal', icon: Target },
  { id: 2, label: 'Task Type', icon: ClipboardList },
  { id: 3, label: 'Audience', icon: Globe },
  { id: 4, label: 'Budget & Proof', icon: Wallet },
  { id: 5, label: 'Review', icon: Eye },
  { id: 6, label: 'Launch', icon: Rocket },
];

const MIN_REWARD_USD = 0.2;
const MIN_CONTRIBUTORS = 5;
/** Estimated platform fee mirrored from backend config (platform.platformFeePercent, default 15).
 *  The backend is the source of truth — it recalculates the fee and verifies
 *  the balance at launch. This number is only a preview. */
const ESTIMATED_FEE_PERCENT = 15;

const CONTRIBUTOR_LEVELS = ['starter', 'explorer', 'trusted', 'pro', 'elite'] as const;

/** Template → category-name matching used when the Task Library links here. */
const TEMPLATE_TO_CATEGORY = (template: string, categories: TaskCategory[]): TaskCategory | undefined => {
  const t = template.toLowerCase();
  const byName = (needle: string) =>
    categories.find((c) => c.name.toLowerCase().includes(needle));
  if (t.includes('tiktok') || t.includes('video')) return byName('ugc') || byName('video') || byName('content');
  if (t.includes('comment') || t.includes('youtube')) return byName('comment') || byName('engagement');
  if (t.includes('share') || t.includes('story') || t.includes('repost') || t.includes('whatsapp'))
    return byName('share') || byName('engagement') || byName('social');
  if (t.includes('app')) return byName('test') || byName('survey') || categories[0];
  return categories[0];
};

export const CreateCampaignWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateHint = searchParams.get('template');

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Step 1
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');

  // Step 2
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Step 3
  const [country, setCountry] = useState('GLOBAL');
  const [minLevel, setMinLevel] = useState<string>('');
  const [retentionHours, setRetentionHours] = useState('');

  // Step 4
  const [rewardUsd, setRewardUsd] = useState<string>('0.20');
  const [contributors, setContributors] = useState<string>('5');
  const [instructions, setInstructions] = useState('');
  const [proofRequirements, setProofRequirements] = useState<string[]>(['Screenshot']);

  // Launch
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [launchSuccessId, setLaunchSuccessId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await api.get<TaskCategory[]>('/task-categories');
        const list = (res.data as unknown as { data?: TaskCategory[] }).data ?? (res.data as unknown as TaskCategory[]);
        const cats = Array.isArray(list) ? list : [];
        setCategories(cats);
        if (templateHint && cats.length > 0) {
          const match = TEMPLATE_TO_CATEGORY(templateHint, cats);
          if (match) setCategoryId(match.id);
        }
      } catch (e) {
        setCategoriesError(getApiError(e, 'Could not load task categories.'));
      } finally {
        setCategoriesLoading(false);
      }
    };
    void fetchCategories();
  }, [templateHint]);

  const rewardCents = Math.round((parseFloat(rewardUsd) || 0) * 100);
  const contributorCount = parseInt(contributors, 10) || 0;

  const estimate = useMemo(() => {
    const tasksBudget = rewardCents * contributorCount;
    const fee = Math.round(tasksBudget * (ESTIMATED_FEE_PERCENT / 100));
    return { tasksBudget, fee, total: tasksBudget + fee };
  }, [rewardCents, contributorCount]);

  const fmtUsd = (cents: number) =>
    (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const validateStep = (s: number): boolean => {
    setFieldErrors({});
    if (s === 1) {
      const errs: Record<string, string[]> = {};
      if (title.trim().length < 5) errs.title = ['Give your campaign a clear title (min 5 characters).'];
      if (description.trim().length < 20) errs.description = ['Describe the campaign in at least 20 characters.'];
      setFieldErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (s === 2) {
      if (categoryId == null) {
        setFieldErrors({ category_id: ['Pick the task type that best matches this campaign.'] });
        return false;
      }
    }
    if (s === 4) {
      const errs: Record<string, string[]> = {};
      if (!(parseFloat(rewardUsd) >= MIN_REWARD_USD))
        errs.reward = [`Reward must be at least $${MIN_REWARD_USD.toFixed(2)} per task (platform minimum).`];
      if (!(contributorCount >= MIN_CONTRIBUTORS))
        errs.contributors = [`You need at least ${MIN_CONTRIBUTORS} contributors.`];
      if (instructions.trim().length < 10)
        errs.instructions = ['Write clear step-by-step instructions (min 10 characters).'];
      setFieldErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(6, s + 1));
  };
  const back = () => {
    setLaunchError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const toggleProofRequirement = (req: string) => {
    setProofRequirements((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req],
    );
  };

  const handleLaunch = async () => {
    if (launching || !validateStep(4) || !validateStep(1) || categoryId == null) return;
    setLaunching(true);
    setLaunchError(null);
    setFieldErrors({});
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        reward_per_task_cents: rewardCents,
        target_contributors_count: contributorCount,
        instructions_markdown: instructions.trim(),
        proof_requirements_json: proofRequirements,
        target_countries: [country],
      };
      if (objective.trim()) payload.objective = objective.trim();
      if (minLevel) payload.min_contributor_level = minLevel;
      if (retentionHours && parseInt(retentionHours, 10) >= 0)
        payload.retention_hours = parseInt(retentionHours, 10);

      const res = await businessApi.createCampaign(payload);
      if (res.success && res.data) {
        setLaunchSuccessId(res.data.id);
      } else {
        setLaunchError(res.message || 'Campaign could not be created. Please try again.');
      }
    } catch (e: unknown) {
      // Surface real API errors — especially the 422 funding gate — honestly.
      const apiErr = e as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      const status = apiErr.response?.status;
      const errors = apiErr.response?.data?.errors;
      if (status === 422 && errors) setFieldErrors(errors);
      const msg = apiErr.response?.data?.message || getApiError(e, 'Campaign could not be created.');
      setLaunchError(
        status === 422 && msg.includes('funds')
          ? `${msg} Top up your balance (Billing & Invoices → contact support) and try again.`
          : msg,
      );
    } finally {
      setLaunching(false);
    }
  };

  const progress = Math.round((step / STEPS.length) * 100);
  const err = (key: string) => fieldErrors[key]?.[0];

  const selectedCategory = categories.find((c) => c.id === categoryId);

  if (launchSuccessId != null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Campaign launched</h1>
        <p className="text-sm text-gray-500">
          Your campaign is live and the budget hold is on file. Contributors can start completing tasks right away.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/business/campaigns/${launchSuccessId}`)}
          className="px-6 py-3 bg-[#168BFF] hover:bg-[#1275DD] text-white text-sm font-bold rounded-xl transition-colors"
        >
          View campaign
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Campaign</h1>
        <p className="text-sm text-gray-500 mt-1">Real budget, real contributors, real verification.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-900">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </span>
          <span className="text-xs font-bold text-[#168BFF]">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#168BFF] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                s.id === step
                  ? 'bg-[#168BFF] text-white'
                  : s.id < step
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {s.id < step ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ============ STEP 1: GOAL ============ */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Campaign title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Launch our new coffee brand on Instagram"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
            />
            {err('title') && <p className="text-[11px] font-bold text-red-600 mt-1">{err('title')}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Objective (optional)</label>
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Drive 500 authentic reviews this month"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Campaign description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What is this campaign about? What will contributors be doing?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF] resize-none"
            />
            {err('description') && <p className="text-[11px] font-bold text-red-600 mt-1">{err('description')}</p>}
          </div>
        </div>
      )}

      {/* ============ STEP 2: TASK TYPE ============ */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900">What should contributors do?</h3>
          {categoriesLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-6">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading task categories…
            </div>
          )}
          {categoriesError && !categoriesLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
              <p className="font-bold text-red-700">Could not load categories</p>
              <p className="text-red-600 mt-1">{categoriesError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-bold text-red-700 underline"
              >
                Reload
              </button>
            </div>
          )}
          {!categoriesLoading && !categoriesError && (
            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    categoryId === c.id
                      ? 'border-[#168BFF] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    {categoryId === c.id && <Check className="w-4 h-4 text-[#168BFF]" />}
                    {c.name}
                  </p>
                  {c.description && <p className="text-[11px] text-gray-500 mt-1">{c.description}</p>}
                </button>
              ))}
            </div>
          )}
          {err('category_id') && <p className="text-[11px] font-bold text-red-600">{err('category_id')}</p>}
        </div>
      )}

      {/* ============ STEP 3: AUDIENCE ============ */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Target country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF] bg-white"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Minimum contributor level (optional)</label>
            <select
              value={minLevel}
              onChange={(e) => setMinLevel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF] bg-white"
            >
              <option value="">Any level</option>
              {CONTRIBUTOR_LEVELS.map((l) => (
                <option key={l} value={l} className="capitalize">
                  {l}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">Higher levels restrict the campaign to more experienced contributors.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Retention period, hours (optional)</label>
            <input
              type="number"
              min={0}
              value={retentionHours}
              onChange={(e) => setRetentionHours(e.target.value)}
              placeholder="e.g. 72"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
            />
            <p className="text-[11px] text-gray-400 mt-1">How long the completed action must stay live (e.g. a post stays up for 72 hours).</p>
          </div>
        </div>
      )}

      {/* ============ STEP 4: BUDGET & PROOF ============ */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Reward per task (USD) *</label>
              <input
                type="number"
                min={MIN_REWARD_USD}
                step="0.01"
                value={rewardUsd}
                onChange={(e) => setRewardUsd(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
              />
              {err('reward') && <p className="text-[11px] font-bold text-red-600 mt-1">{err('reward')}</p>}
              <p className="text-[11px] text-gray-400 mt-1">Platform minimum: ${MIN_REWARD_USD.toFixed(2)}.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Number of contributors *</label>
              <input
                type="number"
                min={MIN_CONTRIBUTORS}
                value={contributors}
                onChange={(e) => setContributors(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
              />
              {err('contributors') && <p className="text-[11px] font-bold text-red-600 mt-1">{err('contributors')}</p>}
              <p className="text-[11px] text-gray-400 mt-1">Minimum: {MIN_CONTRIBUTORS}.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Step-by-step instructions for contributors *</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              placeholder={'1. Follow @yourbrand on Instagram\n2. Like the pinned post\n3. Leave a genuine comment\n4. Take a screenshot as proof'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF] resize-none"
            />
            {err('instructions') && <p className="text-[11px] font-bold text-red-600 mt-1">{err('instructions')}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Required proof</label>
            <div className="flex gap-2 flex-wrap">
              {['Screenshot', 'Screen Recording', 'Link / URL', 'Text Answer'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleProofRequirement(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    proofRequirements.includes(p)
                      ? 'border-[#168BFF] bg-blue-50 text-[#168BFF]'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Honest budget preview */}
          <div className="bg-[#F7F9FC] border border-[#E7ECF3] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Task payouts ({contributorCount || 0} × {fmtUsd(rewardCents)})</span>
              <span className="font-bold text-gray-900">{fmtUsd(estimate.tasksBudget)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform fee (est. {ESTIMATED_FEE_PERCENT}%)</span>
              <span className="font-bold text-gray-900">{fmtUsd(estimate.fee)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-[#E7ECF3]">
              <span className="font-bold text-gray-900">Estimated total</span>
              <span className="font-extrabold text-[#168BFF]">{fmtUsd(estimate.total)}</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Estimate only. At launch the server recalculates the fee (currently 15%) and checks your balance
              before holding funds. If funds are insufficient, launch is blocked with a clear message.
            </p>
          </div>
        </div>
      )}

      {/* ============ STEP 5: REVIEW ============ */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900">Review before launch</h3>
          <dl className="text-sm space-y-2.5">
            {[
              ['Title', title],
              ['Task type', selectedCategory?.name || '—'],
              ['Target country', COUNTRY_OPTIONS.find((c) => c.code === country)?.label || country],
              ['Reward / task', fmtUsd(rewardCents)],
              ['Contributors', String(contributorCount || 0)],
              ['Proof', proofRequirements.join(', ') || '—'],
              ['Min. contributor level', minLevel || 'Any'],
              ['Retention', retentionHours ? `${retentionHours} hours` : 'None'],
              ['Estimated total', `${fmtUsd(estimate.total)} (incl. est. ${ESTIMATED_FEE_PERCENT}% fee)`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                <dt className="text-gray-500">{k}</dt>
                <dd className="font-bold text-gray-900 text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800">
            <p className="font-bold mb-1">What happens at launch</p>
            <p>
              The server creates your campaign, calculates the real platform fee, and holds the total from your
              balance. If your balance is too low, the launch is stopped with a clear funding error — nothing is
              created and nothing is charged.
            </p>
          </div>
        </div>
      )}

      {/* ============ STEP 6: LAUNCH ============ */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-6 space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#168BFF]/10 text-[#168BFF] flex items-center justify-center mx-auto">
            <Rocket className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Ready to go live?</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Launching creates the campaign and holds an estimated {fmtUsd(estimate.total)} from your balance.
              You can pause it anytime afterwards.
            </p>
          </div>

          {launchError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-red-700">Launch failed</p>
                <p className="text-red-600 mt-1">{launchError}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="text-red-600 mt-2 space-y-1 list-disc list-inside">
                    {Object.entries(fieldErrors).map(([k, msgs]) =>
                      msgs.map((m, i) => (
                        <li key={`${k}-${i}`} className="text-xs">
                          <span className="font-bold">{k}:</span> {m}
                        </li>
                      )),
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={launching}
            onClick={() => void handleLaunch()}
            className="w-full px-6 py-3.5 bg-[#168BFF] hover:bg-[#1275DD] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            {launching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Launching…
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" /> Launch Campaign
              </>
            )}
          </button>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1 || launching}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < 6 ? (
          <button
            type="button"
            onClick={next}
            disabled={categoriesLoading && step === 2}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#07182F] hover:bg-[#168BFF] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[11px] text-gray-400">Review the summary above, then launch.</span>
        )}
      </div>
    </div>
  );
};
