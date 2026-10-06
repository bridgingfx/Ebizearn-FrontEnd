import React, { useEffect, useState } from 'react';
import { Info, Loader2, X } from 'lucide-react';
import { getApiError } from '../../api';
import type { Campaign, CampaignEditInput, ContributorLevel } from '../../types';

const CONTRIBUTOR_LEVELS: ContributorLevel[] = ['starter', 'explorer', 'trusted', 'pro', 'elite'];

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

/**
 * Edit a campaign's copy and targeting. Reward, budget and contributor
 * count are held in escrow and are deliberately not editable here — the
 * backend rejects them too. `save` is the portal-specific API call.
 */
export const EditCampaignModal: React.FC<{
  campaign: Campaign;
  save: (id: number, payload: CampaignEditInput) => Promise<{ success: boolean; message?: string; data: Campaign }>;
  onClose: () => void;
  onSaved: (c: Campaign) => void;
}> = ({ campaign, save, onClose, onSaved }) => {
  const [title, setTitle] = useState(campaign.title);
  const [objective, setObjective] = useState(campaign.objective ?? '');
  const [description, setDescription] = useState(campaign.description ?? '');
  const [instructions, setInstructions] = useState(campaign.instructions_markdown ?? '');
  const [platform, setPlatform] = useState(campaign.platform ?? '');
  const [minLevel, setMinLevel] = useState<ContributorLevel>(campaign.min_contributor_level ?? 'starter');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = title.trim() && description.trim() && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const payload: CampaignEditInput = {
        title: title.trim(),
        objective: objective.trim() || null,
        description: description.trim(),
        platform: platform.trim() || null,
        min_contributor_level: minLevel,
      };
      if (instructions.trim()) payload.instructions_markdown = instructions.trim();
      const res = await save(campaign.id, payload);
      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      } else {
        setError(res.message || 'Could not save the campaign.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save the campaign.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Edit campaign">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">Edit campaign</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{campaign.title}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Campaign title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Objective</label>
              <input value={objective} onChange={(e) => setObjective(e.target.value)} maxLength={255} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Platform</label>
              <input value={platform} onChange={(e) => setPlatform(e.target.value)} maxLength={64} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Min. contributor level</label>
              <select value={minLevel} onChange={(e) => setMinLevel(e.target.value as ContributorLevel)} className={`${inputCls} appearance-none capitalize`}>
                {CONTRIBUTOR_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l[0].toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Contributor instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/25 rounded-xl px-4 py-3 text-xs text-blue-900 dark:text-blue-200">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#168BFF]" />
            <p>Reward per task, budget and contributor count are held in escrow and can't be changed after funding.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-[#141821] border-t border-gray-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};
