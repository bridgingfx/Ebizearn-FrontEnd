import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Lock, Megaphone } from 'lucide-react';
import axios from 'axios';
import { getApiError, taskTemplatesApi } from '../../api';
import type { TaskTemplate } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { TaskTemplateCard } from '../../components/task/TaskTemplateCard';

/**
 * Task recipes — content templates only, managed by Super Admin (who also
 * decides which templates businesses see). No performance claims: pass
 * rates, budgets and "top trending" labels require real campaign data and
 * are not shown here. Every template opens the real campaign wizard
 * pre-filled.
 */
export const BusinessTaskLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskTemplatesApi.businessList();
      if (res.success) setTemplates(res.data ?? []);
      else setError(res.message || 'Could not load the Task Library.');
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 403) setDenied(true);
      else setError(getApiError(e, 'Could not load the Task Library.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const applyTemplate = (t: TaskTemplate) => {
    const params = new URLSearchParams();
    if (t.template_key) params.set('template', t.template_key);
    const qs = params.toString();
    navigate(`/business/campaigns/create${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Task Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Proven task recipes to jump-start your campaign. Every template opens the real wizard — nothing is
            pre-published, and reward ranges are guides, not guarantees.
          </p>
        </div>
        <Link
          to="/business/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
        >
          <Megaphone className="w-4 h-4" />
          <span>Start from scratch</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading templates…
        </div>
      ) : denied ? (
        <EmptyState
          icon={Lock}
          title="Task Library isn't enabled for your account"
          description="You can still create a campaign from scratch. Contact support if you think this is a mistake."
        />
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-sm">
          <p className="font-bold text-red-700 dark:text-red-300">Could not load the Task Library</p>
          <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
            Retry
          </button>
        </div>
      ) : templates.length === 0 ? (
        <EmptyState icon={BookOpen} title="No templates available yet" description="Start a campaign from scratch in the meantime." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <TaskTemplateCard key={t.id} template={t} onUse={applyTemplate} />
          ))}
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-[#168BFF] mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <p className="font-bold mb-1">How templates work</p>
          <p>
            A template pre-selects the closest matching task type in the campaign wizard. You still write your
            own instructions, set the reward (within the task type’s allowed range), and launch with a real budget hold.
            Reward guides above come from the platform pricing policy; actual earnings depend on your settings.
          </p>
        </div>
      </div>
    </div>
  );
};
