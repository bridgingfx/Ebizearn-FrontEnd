import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Search,
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
import { useMoney } from '../../hooks/useMoney';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { CampaignCard } from '../../components/campaign/CampaignCard';
import { EditCampaignModal } from '../../components/campaign/EditCampaignModal';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/can';
import { toast } from '../../utils/toast';

type Tab = 'active' | 'in_review' | 'draft' | 'paused' | 'all';

const VALID_TABS: Tab[] = ['active', 'in_review', 'draft', 'paused', 'all'];

export const BusinessCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { fmt } = useMoney();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    return (VALID_TABS as string[]).includes(t ?? '') ? (t as Tab) : 'all';
  });
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const { user } = useAuth();
  const canEdit = can(user, 'edit_own_campaigns');
  const canDelete = can(user, 'delete_own_campaigns');

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
        (tab === 'in_review' && c.status === 'pending_review') ||
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
    { id: 'in_review', label: 'In review', count: campaigns.filter((c) => c.status === 'pending_review').length },
    { id: 'draft', label: 'Drafts', count: campaigns.filter((c) => c.status === 'draft').length },
    { id: 'paused', label: 'Paused', count: campaigns.filter((c) => c.status === 'paused').length },
    { id: 'all', label: 'All', count: campaigns.length },
  ];

  const confirmDelete = async () => {
    const c = deleting;
    if (!c) return;
    setDeleting(null);
    setTogglingId(c.id);
    try {
      const res = await businessApi.deleteCampaign(c.id);
      if (res.success) {
        setCampaigns((prev) => prev.filter((p) => p.id !== c.id));
        toast.success(res.message || 'Campaign deleted.');
      } else {
        toast.error(res.message || 'Could not delete the campaign.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not delete the campaign.'));
    } finally {
      setTogglingId(null);
    }
  };

  const kpiCards = [
    { icon: Zap, label: 'Active Campaigns', value: String(kpis.active), tone: 'text-[#168BFF]', bg: 'bg-blue-100 dark:bg-blue-500/15' },
    { icon: Wallet, label: 'Total Budget', value: fmt(kpis.totalBudget), tone: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-500/15' },
    { icon: CheckSquare, label: 'Verified Tasks', value: kpis.verified.toLocaleString(), tone: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    { icon: Target, label: 'Avg. Reward / Task', value: fmt(kpis.avgCost), tone: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/15' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Every campaign you have created, live from the server.</p>
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
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading campaigns…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load campaigns</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
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
              <div key={c.label} className="bg-white dark:bg-[#0C1322] rounded-2xl p-4 border border-[#E7ECF3] dark:border-white/10 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${c.bg}`}>
                    <c.icon className={`w-4 h-4 ${c.tone}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{c.label}</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate">{c.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs + search */}
          <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      tab === t.id ? 'bg-[#07182F] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {t.label} <span className="opacity-70">({t.count})</span>
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto sm:w-72">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campaigns…"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
                />
              </div>
            </div>
          </div>

          {actionError && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3 text-xs font-bold text-red-700 dark:text-red-300">
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
              {filtered.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  fmt={fmt}
                  busy={togglingId === c.id}
                  onToggle={(x) => void handleToggle(x)}
                  // Drafts are edited in the wizard ("Continue editing").
                  onEdit={canEdit && c.status !== 'draft' ? setEditing : undefined}
                  onDelete={canDelete ? setDeleting : undefined}
                  detailsAction={
                    c.status === 'draft' ? (
                      <Link
                        to={`/business/campaigns/create?draft=${c.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline self-start"
                      >
                        <Eye className="w-3.5 h-3.5" /> Continue editing
                      </Link>
                    ) : (
                      <Link
                        to={`/business/campaigns/${c.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline self-start"
                      >
                        <Eye className="w-3.5 h-3.5" /> View details
                      </Link>
                    )
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <EditCampaignModal
          campaign={editing}
          save={businessApi.updateCampaign}
          onClose={() => setEditing(null)}
          onSaved={(c) => setCampaigns((prev) => prev.map((p) => (p.id === c.id ? { ...p, ...c } : p)))}
        />
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete this campaign?"
        message={
          <>
            <strong>{deleting?.title}</strong> will be removed. Any unspent escrow returns to your wallet; the platform fee
            is not refunded. Campaigns contributors already worked on can't be deleted — pause or cancel those instead.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};
