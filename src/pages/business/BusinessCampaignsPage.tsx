import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Search,
  Play,
  Pause,
  Eye,
  Loader2,
  AlertCircle,
  Zap,
  Wallet,
  CheckSquare,
  Target,
} from 'lucide-react';
import { businessApi, getApiError } from '../../api';
import type { Campaign } from '../../types';
import { money } from '../../utils/apiMappers';
import { EmptyState } from '../../components/common/EmptyState';

type Tab = 'active' | 'draft' | 'paused' | 'all';

export const BusinessCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessApi.campaigns();
      if (res.success) {
        setCampaigns(res.data || []);
      } else {
        setError(res.message || 'Could not load campaigns.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load campaigns.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const tabOk =
        tab === 'all' ||
        (tab === 'active' && c.status === 'active') ||
        (tab === 'draft' && c.status === 'draft') ||
        (tab === 'paused' && c.status === 'paused');
      const qOk = !q || c.title.toLowerCase().includes(q);
      return tabOk && qOk;
    });
  }, [campaigns, search, tab]);

  const kpis = useMemo(() => {
    const active = campaigns.filter((c) => c.status === 'active').length;
    const totalBudget = campaigns.reduce((s, c) => s + (c.total_budget_cents ?? 0), 0);
    const verified = campaigns.reduce((s, c) => s + (c.completed_contributors_count ?? 0), 0);
    const avgCost =
      campaigns.length > 0
        ? Math.round(campaigns.reduce((s, c) => s + (c.reward_per_task_cents ?? 0), 0) / campaigns.length)
        : 0;
    return { active, totalBudget, verified, avgCost };
  }, [campaigns]);

  const handleToggle = async (c: Campaign) => {
    const next = c.status === 'active' ? 'paused' : 'active';
    if (c.status !== 'active' && c.status !== 'paused') return;
    setTogglingId(c.id);
    setActionError(null);
    try {
      const res = await businessApi.updateCampaignStatus(c.id, next);
      if (res.success && res.data) {
        setCampaigns((prev) => prev.map((p) => (p.id === c.id ? res.data : p)));
      } else {
        setActionError(res.message || 'Could not update campaign status.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not update campaign status.'));
    } finally {
      setTogglingId(null);
    }
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active', label: 'Active', count: campaigns.filter((c) => c.status === 'active').length },
    { id: 'draft', label: 'Drafts', count: campaigns.filter((c) => c.status === 'draft').length },
    { id: 'paused', label: 'Paused', count: campaigns.filter((c) => c.status === 'paused').length },
    { id: 'all', label: 'All', count: campaigns.length },
  ];

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'paused':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const spentOf = (c: Campaign) => Math.max(0, (c.total_budget_cents ?? 0) - (c.remaining_budget_cents ?? 0));

  const kpiCards = [
    { icon: Zap, label: 'Active Campaigns', value: String(kpis.active), tone: 'text-[#168BFF]', bg: 'bg-blue-100' },
    { icon: Wallet, label: 'Total Budget', value: money(kpis.totalBudget, 'USD'), tone: 'text-violet-600', bg: 'bg-violet-100' },
    { icon: CheckSquare, label: 'Verified Tasks', value: kpis.verified.toLocaleString(), tone: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: Target, label: 'Avg. Reward / Task', value: money(kpis.avgCost, 'USD'), tone: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Every campaign you have created, live from the server.</p>
        </div>
        <Link
          to="/business/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading campaigns…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load campaigns</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI strip — derived from real campaigns only */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((c) => (
              <div key={c.label} className="bg-white rounded-2xl p-4 border border-[#E7ECF3] shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${c.bg}`}>
                    <c.icon className={`w-4 h-4 ${c.tone}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
                    <p className="text-lg font-extrabold text-gray-900 truncate">{c.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs + search */}
          <div className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      tab === t.id ? 'bg-[#07182F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.label} <span className="opacity-70">({t.count})</span>
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campaigns…"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
                />
              </div>
            </div>
          </div>

          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold text-red-700">
              {actionError}
            </div>
          )}

          {/* Campaign grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title={campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filter'}
              description={
                campaigns.length === 0
                  ? 'Create your first campaign to start collecting verified task completions.'
                  : 'Try a different search term or tab.'
              }
              {...(campaigns.length === 0
                ? { actionLabel: 'Create Campaign', onAction: () => navigate('/business/campaigns/create') }
                : {})}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((c) => {
                const status = c.status;
                const canToggle = status === 'active' || status === 'paused';
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-[#E7ECF3] shadow-xs p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle(status)}`}
                      >
                        {status}
                      </span>
                      {canToggle && (
                        <button
                          type="button"
                          disabled={togglingId === c.id}
                          onClick={() => void handleToggle(c)}
                          title={status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#168BFF] hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          {status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-gray-900 mb-1">{c.title}</h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-4">{c.description}</p>

                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="bg-gray-50 rounded-xl py-2 px-1">
                        <p className="text-xs font-extrabold text-gray-900">{money(c.reward_per_task_cents, 'USD')}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">per task</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2 px-1">
                        <p className="text-xs font-extrabold text-gray-900">
                          {(c.completed_contributors_count ?? 0)}/{(c.target_contributors_count ?? 0)}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">done</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2 px-1">
                        <p className="text-xs font-extrabold text-gray-900">{money(spentOf(c), 'USD')}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">spent</p>
                      </div>
                    </div>

                    <Link
                      to={`/business/campaigns/${c.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> View details
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
