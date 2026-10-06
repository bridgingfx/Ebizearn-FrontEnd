import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, CheckSquare, Eye, Megaphone, Plus, Target, Wallet, X, Zap } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { Campaign } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/can';
import { toast } from '../../utils/toast';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PageHeader, SearchInput, LoadingBlock, ErrorBlock, StatusBadge, fmtMoney } from '../../components/common/ui';
import { CreateCampaignModal } from '../../components/admin/CreateCampaignModal';
import { CampaignCard, campaignSpent } from '../../components/campaign/CampaignCard';
import { EditCampaignModal } from '../../components/campaign/EditCampaignModal';

type Tab = 'active' | 'pending_review' | 'draft' | 'paused' | 'cancelled' | 'all';

const PAGE_SIZE = 100;

/**
 * Platform-wide campaign oversight. Lists every campaign (GET
 * /staff/campaigns) as cards with pause/resume, approval of in-review
 * campaigns, edit (edit_campaigns) and delete (delete_campaigns). Super
 * Admin decides per role who gets edit / delete from Roles & Permissions.
 * All figures come from the backend — nothing is invented.
 */
export const AdminCampaignsOversightPage: React.FC = () => {
  const { user } = useAuth();
  const canEdit = can(user, 'edit_campaigns');
  const canDelete = can(user, 'delete_campaigns');
  const canPost = can(user, 'post_campaigns');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.staffCampaigns({ search: debouncedSearch || undefined, per_page: PAGE_SIZE });
      if (res.success) {
        const pager = res.data;
        const rows: Campaign[] = Array.isArray(pager) ? pager : pager?.data ?? [];
        setCampaigns(rows);
        setTotal(Array.isArray(pager) ? rows.length : pager?.total ?? rows.length);
      } else {
        setLoadError(res.message || 'Could not load campaigns.');
      }
    } catch (e) {
      setLoadError(getApiError(e, 'Could not load campaigns.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (c: Campaign) =>
    setCampaigns((items) => items.map((x) => (x.id === c.id ? { ...x, ...c, business: c.business ?? x.business } : x)));

  const setStatus = async (c: Campaign, status: 'active' | 'paused') => {
    setActingId(c.id);
    try {
      const res = await adminApi.updateStaffCampaignStatus(c.id, status);
      if (res.success && res.data) {
        replace(res.data);
      } else {
        toast.error(res.message || 'Could not update campaign status.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update campaign status.'));
    } finally {
      setActingId(null);
    }
  };

  const confirmDelete = async () => {
    const c = deleting;
    if (!c) return;
    setDeleting(null);
    setActingId(c.id);
    try {
      const res = await adminApi.deleteStaffCampaign(c.id);
      if (res.success) {
        setCampaigns((items) => items.filter((x) => x.id !== c.id));
        setTotal((n) => Math.max(0, n - 1));
        toast.success(res.message || 'Campaign deleted.');
      } else {
        toast.error(res.message || 'Could not delete the campaign.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not delete the campaign.'));
    } finally {
      setActingId(null);
    }
  };

  const count = (s: Campaign['status']) => campaigns.filter((c) => c.status === s).length;
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active', label: 'Active', count: count('active') },
    { id: 'pending_review', label: 'In review', count: count('pending_review') },
    { id: 'draft', label: 'Drafts', count: count('draft') },
    { id: 'paused', label: 'Paused', count: count('paused') },
    { id: 'cancelled', label: 'Cancelled', count: count('cancelled') },
    { id: 'all', label: 'All', count: campaigns.length },
  ];

  const filtered = useMemo(() => (tab === 'all' ? campaigns : campaigns.filter((c) => c.status === tab)), [campaigns, tab]);

  const totalBudget = campaigns.reduce((s, c) => s + (c.total_budget_cents ?? 0), 0);
  const verified = campaigns.reduce((s, c) => s + (c.completed_contributors_count ?? 0), 0);
  const avgReward = campaigns.length
    ? Math.round(campaigns.reduce((s, c) => s + (c.reward_per_task_cents ?? 0), 0) / campaigns.length)
    : 0;
  const kpis = [
    { icon: Zap, label: 'Active Campaigns', value: String(count('active')), tone: 'text-[#168BFF]', bg: 'bg-blue-100 dark:bg-blue-500/15' },
    { icon: Wallet, label: 'Total Budget', value: fmtMoney(totalBudget), tone: 'text-violet-600 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-500/15' },
    { icon: CheckSquare, label: 'Verified Tasks', value: verified.toLocaleString(), tone: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    { icon: Target, label: 'Avg. Reward / Task', value: fmtMoney(avgReward), tone: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/15' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Every campaign across all business accounts. Pausing stops new task acceptance; escrow accounting stays on the ledger."
        actions={
          canPost ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Post campaign
            </button>
          ) : undefined
        }
      />

      {loading && campaigns.length === 0 ? (
        <LoadingBlock label="Loading campaigns…" />
      ) : loadError ? (
        <ErrorBlock message={loadError} onRetry={() => void load()} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white dark:bg-[#0C1322] rounded-2xl p-4 border border-[#E7ECF3] dark:border-white/10 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${k.bg}`}>
                    <k.icon className={`w-4 h-4 ${k.tone}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{k.label}</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate tabular-nums">{k.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      tab === t.id
                        ? 'bg-[#07182F] dark:bg-[#168BFF] text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
                    }`}
                  >
                    {t.label} <span className="opacity-70">({t.count})</span>
                  </button>
                ))}
              </div>
              <div className="lg:ml-auto">
                <SearchInput value={search} onChange={setSearch} placeholder="Search campaigns…" />
              </div>
            </div>
          </div>

          {total > campaigns.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing the latest {campaigns.length} of {total} campaigns — search to narrow down.
            </p>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title={campaigns.length === 0 ? 'No campaigns found' : 'No campaigns in this tab'}
              description={
                campaigns.length === 0
                  ? canPost ? 'Post one with the button above, or wait for a business to create one from their portal.' : 'Campaigns appear here when a business creates one from their portal.'
                  : 'Try another tab or search term.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  fmt={fmtMoney}
                  showBusiness
                  busy={actingId === c.id}
                  onToggle={(x) => void setStatus(x, x.status === 'active' ? 'paused' : 'active')}
                  onApprove={(x) => void setStatus(x, 'active')}
                  onEdit={canEdit ? setEditing : undefined}
                  onDelete={canDelete ? setDeleting : undefined}
                  detailsAction={
                    <button
                      type="button"
                      onClick={() => setViewingId(c.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline self-start"
                    >
                      <Eye className="w-3.5 h-3.5" /> View details
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} onCreated={() => void load()} />}

      {editing && (
        <EditCampaignModal
          campaign={editing}
          save={adminApi.updateStaffCampaign}
          onClose={() => setEditing(null)}
          onSaved={replace}
        />
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete this campaign?"
        message={
          <>
            <strong>{deleting?.title}</strong> and its tasks will be removed. Any unspent escrow goes back to the business wallet;
            the platform fee is not refunded. Campaigns that contributors already worked on can't be deleted — cancel those instead.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />

      {viewingId !== null && <CampaignDetailsModal id={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
};

/** Read-only campaign details from GET /staff/campaigns/{id}. */
const CampaignDetailsModal: React.FC<{ id: number; onClose: () => void }> = ({ id, onClose }) => {
  const [data, setData] = useState<(Campaign & { spent_cents: number }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .staffCampaign(id)
      .then((res) => {
        if (cancelled) return;
        if (res.success) setData(res.data);
        else setError(res.message || 'Could not load the campaign.');
      })
      .catch((e) => !cancelled && setError(getApiError(e, 'Could not load the campaign.')));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows: [string, React.ReactNode][] = data
    ? [
        ['Business', data.business?.company_name ?? `#${data.business_id}`],
        ['Category', data.category?.name ?? '—'],
        ['Platform', data.platform || '—'],
        ['Reward per task', fmtMoney(data.reward_per_task_cents)],
        ['Contributors', `${data.completed_contributors_count ?? 0} / ${data.target_contributors_count}`],
        ['Total budget', fmtMoney(data.total_budget_cents)],
        ['Released to contributors', fmtMoney(data.spent_cents ?? campaignSpent(data))],
        ['Platform fee', fmtMoney(data.platform_fee_cents)],
        ['Min. level', <span key="level" className="capitalize">{data.min_contributor_level}</span>],
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Campaign details">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between gap-3 rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate">{data?.title ?? 'Campaign'}</h2>
            {data && (
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={data.status} />
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Building2 className="w-3.5 h-3.5" /> {data.business?.company_name ?? `#${data.business_id}`}
                </span>
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {error ? (
            <ErrorBlock message={error} />
          ) : !data ? (
            <LoadingBlock label="Loading campaign…" />
          ) : (
            <div className="space-y-5">
              {data.description && <p className="text-sm text-gray-600 dark:text-gray-300">{data.description}</p>}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 border-b border-gray-50 dark:border-white/5 pb-2">
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{k}</dt>
                    <dd className="text-xs font-bold text-gray-900 dark:text-gray-100 text-right tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              {data.instructions_markdown && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Instructions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                    {data.instructions_markdown}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Tasks ({data.tasks?.length ?? 0})
                </p>
                <div className="space-y-2">
                  {(data.tasks ?? []).map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-white/10 px-3 py-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{t.title}</span>
                      <span className="flex items-center gap-3 shrink-0 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                        {fmtMoney(t.reward_cents)} · {t.slots_taken}/{t.slots_total}
                        <StatusBadge status={t.status} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
