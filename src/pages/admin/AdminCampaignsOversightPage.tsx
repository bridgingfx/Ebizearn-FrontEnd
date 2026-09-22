import React, { useCallback, useEffect, useState } from 'react';
import { Megaphone, Building2, Pause, Play, Loader2 } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { Campaign } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader, StatusBadge, SearchInput, FilterPills, LoadingBlock, ErrorBlock, Card, fmtMoney } from '../../components/common/ui';

/**
 * Phase 11: real campaign oversight. Lists every campaign platform-wide via
 * GET /staff/campaigns (search + status filter), with pause/resume actions.
 * All figures come from the backend — nothing is invented.
 */
export const AdminCampaignsOversightPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.staffCampaigns({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        per_page: 25,
      });
      if (res.success) {
        const pager = res.data;
        setCampaigns(Array.isArray(pager) ? pager : pager?.data ?? []);
      } else {
        setLoadError(res.message || 'Could not load campaigns.');
      }
    } catch (e) {
      setLoadError(getApiError(e, 'Could not load campaigns.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: number, status: 'active' | 'paused') => {
    setActingId(id);
    setActionError(null);
    try {
      const res = await adminApi.updateStaffCampaignStatus(id, status);
      if (res.success && res.data) {
        setCampaigns((items) => items.map((c) => (c.id === id ? res.data : c)));
      } else {
        setActionError(res.message || 'Could not update campaign status.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not update campaign status.'));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Oversight"
        subtitle="Moderate campaigns across every business account. Pausing stops new task acceptance; escrow accounting stays on the ledger."
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterPills
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
            { value: 'draft', label: 'Draft' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
        <div className="ml-auto">
          <SearchInput value={search} onChange={setSearch} placeholder="Search campaigns…" />
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading campaigns…" />
      ) : loadError ? (
        <ErrorBlock message={loadError} onRetry={() => void load()} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="No campaigns match these filters. Businesses create campaigns from the business portal — nothing is shown here until they do."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-3 font-bold">Campaign</th>
                  <th className="px-5 py-3 font-bold">Business</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Reward</th>
                  <th className="px-5 py-3 font-bold text-right">Budget</th>
                  <th className="px-5 py-3 font-bold text-right">Progress</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((c) => {
                  const progress =
                    c.target_contributors_count > 0
                      ? Math.round((c.completed_contributors_count / c.target_contributors_count) * 100)
                      : 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900">{c.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.tasks_count ?? 0} task{(c.tasks_count ?? 0) === 1 ? '' : 's'} · {c.target_contributors_count} slots
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {c.business?.company_name ?? `#${c.business_id}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900 tabular-nums">
                        {fmtMoney(c.reward_per_task_cents)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-gray-600">
                        {fmtMoney(c.total_budget_cents)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-[#168BFF] transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-500 tabular-nums w-9 text-right">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {c.status === 'active' && (
                          <button
                            type="button"
                            disabled={actingId === c.id}
                            onClick={() => void setStatus(c.id, 'paused')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            {actingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                            Pause
                          </button>
                        )}
                        {c.status === 'paused' && (
                          <button
                            type="button"
                            disabled={actingId === c.id}
                            onClick={() => void setStatus(c.id, 'active')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            {actingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            Resume
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
