import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  AlertCircle,
  Play,
  Pause,
  Download,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import { businessApi, getApiError } from '../../api';
import type { Campaign, Task, TaskSubmission } from '../../types';
import { money } from '../../utils/apiMappers';
import { EmptyState } from '../../components/common/EmptyState';

export const BusinessCampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await businessApi.campaign(Number(id));
      if (res.success) {
        setCampaign(res.data as Campaign);
        try {
          const subRes = await businessApi.submissions();
          if (subRes.success) {
            const taskIds = new Set((res.data?.tasks ?? []).map((t: Task) => t.id));
            setSubmissions(
              (subRes.data || []).filter((s: TaskSubmission) => s.task_id != null && taskIds.has(Number(s.task_id))),
            );
          }
        } catch {
          // Submissions are supplementary; the campaign itself is the point.
        }
      } else {
        setError(res.message || 'Campaign not found.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load campaign.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async () => {
    if (!campaign || toggling) return;
    const next = campaign.status === 'active' ? 'paused' : 'active';
    setToggling(true);
    setActionError(null);
    try {
      const res = await businessApi.updateCampaignStatus(campaign.id, next);
      if (res.success && res.data) {
        setCampaign(res.data as Campaign);
      } else {
        setActionError(res.message || 'Could not update campaign status.');
      }
    } catch (e) {
      setActionError(getApiError(e, 'Could not update campaign status.'));
    } finally {
      setToggling(false);
    }
  };

  const handleExportCsv = useCallback(() => {
    const rows = submissions.map((s) => [
      s.id,
      s.task?.title ?? '',
      s.user?.name ?? '',
      String(s.status),
      new Date(s.created_at).toISOString(),
    ]);
    const csv = ['id,task,contributor,status,submitted_at', ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${id}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [submissions, id]);

  const verifiedCount = useMemo(
    () => submissions.filter((s) => s.status === 'approved').length,
    [submissions],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading campaign…
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link to="/business/campaigns" className="inline-flex items-center gap-2 text-xs font-bold text-[#168BFF]">
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load campaign</p>
            <p className="text-red-600 mt-1">{error || 'Campaign not found.'}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = campaign.status;
  const canToggle = status === 'active' || status === 'paused';
  const spent = Math.max(0, (campaign.total_budget_cents ?? 0) - (campaign.remaining_budget_cents ?? 0));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to="/business/campaigns" className="inline-flex items-center gap-2 text-xs font-bold text-[#168BFF]">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              {status}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{campaign.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{campaign.description}</p>
          {campaign.instructions_markdown && (
            <details className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <summary className="font-bold cursor-pointer text-[#168BFF]">Contributor instructions</summary>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{campaign.instructions_markdown}</p>
            </details>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canToggle && (
            <button
              type="button"
              disabled={toggling}
              onClick={() => void handleToggle()}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                status === 'active'
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {toggling ? 'Updating…' : status === 'active' ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold text-red-700">
          {actionError}
        </div>
      )}

      {/* Stats — real values from the API only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Reward / task', value: money(campaign.reward_per_task_cents, 'USD') },
          { label: 'Completed', value: `${campaign.completed_contributors_count ?? 0} / ${campaign.target_contributors_count ?? 0}` },
          { label: 'Total budget', value: money(campaign.total_budget_cents, 'USD') },
          { label: 'Spent', value: money(spent, 'USD') },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" /> Submissions ({submissions.length})
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">· {verifiedCount} verified</span>
          </h3>
          {submissions.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>

        {submissions.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No submissions yet"
            description="Proof submitted by contributors for this campaign will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                  <th className="py-2 pr-4 font-bold">Contributor</th>
                  <th className="py-2 pr-4 font-bold">Task</th>
                  <th className="py-2 pr-4 font-bold">Status</th>
                  <th className="py-2 pr-4 font-bold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-bold text-gray-900 dark:text-gray-100">{s.user?.name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{s.task?.title || `Task #${s.task_id}`}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                        {String(s.status).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {campaign.tasks && campaign.tasks.length > 0 && (
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-6">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-[#168BFF]" /> Tasks in this campaign
          </h3>
          <div className="space-y-2">
            {campaign.tasks.map((t: Task) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3 bg-[#F7F9FC] dark:bg-[#0B0F19] border border-[#E7ECF3] dark:border-white/10 rounded-xl"
              >
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{t.title}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                  {String(t.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
