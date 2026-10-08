import React, { useEffect, useState } from 'react';
import { Loader2, Save, Trophy } from 'lucide-react';
import { api } from '../../api/client';
import { getApiError } from '../../api/client';
import { toast } from '../../utils/toast';
import { RankBadge } from '../../components/common/RankBadge';

interface RankTier {
  id: number;
  level: string;
  display_name: string;
  sort_order: number;
  required_tasks: number;
  required_earnings_cents: number;
  bonus_percent: number | string;
  is_active: boolean;
}

/**
 * Super Admin only: configure contributor rank tiers.
 * Sets promotion thresholds (tasks + earnings) and the bonus %
 * each rank earns on top of task rewards.
 */
export const AdminRankTiersPage: React.FC = () => {
  const [tiers, setTiers] = useState<RankTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Partial<RankTier>>>({});

  useEffect(() => {
    api.get('/admin/rank-tiers')
      .then((r) => setTiers(r.data.data || []))
      .catch((e) => toast.error(getApiError(e, 'Could not load rank tiers.')))
      .finally(() => setLoading(false));
  }, []);

  const setDraft = (id: number, patch: Partial<RankTier>) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const getVal = <K extends keyof RankTier>(tier: RankTier, key: K): RankTier[K] =>
    (drafts[tier.id]?.[key] ?? tier[key]) as RankTier[K];

  const save = async (tier: RankTier) => {
    const patch = drafts[tier.id];
    if (!patch || Object.keys(patch).length === 0) return;
    setSaving(tier.id);
    try {
      const res = await api.patch(`/admin/rank-tiers/${tier.id}`, patch);
      if (res.data.success) {
        setTiers((ts) => ts.map((t) => (t.id === tier.id ? res.data.data : t)));
        setDrafts((d) => { const n = { ...d }; delete n[tier.id]; return n; });
        toast.success(`"${tier.display_name}" rank updated.`);
      } else {
        toast.error(res.data.message || 'Could not save.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not save.'));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#168BFF]" /></div>;
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#168BFF]';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Contributor Ranks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set how many completed (approved) tasks move a contributor up to each level, and the bonus % each level earns on top of every task reward.
          Contributors move up automatically as they complete tasks. To set one contributor's level by hand, open them in Users &amp; KYC.
        </p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier) => {
          const dirty = drafts[tier.id] && Object.keys(drafts[tier.id]!).length > 0;
          return (
            <div key={tier.id} className="bg-white dark:bg-[#0e2240] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <RankBadge level={tier.level} size="lg" />
                <span className="text-xs text-gray-400">Rank #{tier.sort_order}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Display name</label>
                  <input value={getVal(tier, 'display_name')} onChange={(e) => setDraft(tier.id, { display_name: e.target.value })} className={inputCls} disabled={tier.sort_order === 1} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Completed tasks needed</label>
                  <input type="number" min={0} value={getVal(tier, 'required_tasks')} onChange={(e) => setDraft(tier.id, { required_tasks: Math.max(0, parseInt(e.target.value) || 0) })} className={inputCls} disabled={tier.sort_order === 1} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bonus %</label>
                  <div className="flex gap-2">
                    <input type="number" min={0} max={100} step="0.5" value={getVal(tier, 'bonus_percent')} onChange={(e) => setDraft(tier.id, { bonus_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })} className={inputCls} disabled={tier.sort_order === 1} />
                  </div>
                </div>
              </div>
              {tier.sort_order === 1 ? (
                <p className="text-[11px] text-gray-400 mt-3">Starter is the entry rank — everyone starts here with no bonus.</p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-3">
                  Reached at <b>{getVal(tier, 'required_tasks')} completed tasks</b> → earns <b>+{getVal(tier, 'bonus_percent')}%</b> on every task.
                </p>
              )}
              {dirty && (
                <button type="button" onClick={() => save(tier)} disabled={saving === tier.id} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae0] disabled:opacity-50 text-white text-xs font-black transition-colors">
                  {saving === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-200">
        <b>How it works:</b> When a submission is approved, the contributor gets the task reward <b>plus</b> their rank bonus (e.g. a $0.20 task pays $0.21 at Contributor rank with +5%). After each approval the system checks if they've hit the next rank's thresholds and promotes them automatically.
      </div>
    </div>
  );
};
