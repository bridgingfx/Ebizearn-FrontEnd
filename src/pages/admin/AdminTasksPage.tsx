import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search, Loader2, AlertCircle } from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import type { Task } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Task listing for moderation. There is no dedicated admin task endpoint, so
 * this view renders the public task catalog (GET /tasks) — the same tasks
 * contributors see. Task creation/pausing belongs to businesses and their
 * campaign workflow; moderation actions are pending a backend endpoint.
 */
export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.list();
      if (res.success) {
        setTasks(res.data || []);
      } else {
        setError(res.message || 'Could not load tasks.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load tasks.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.campaign?.title || '').toLowerCase().includes(q),
    );
  }, [tasks, search]);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700';
      case 'paused':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live task catalog across all campaigns — {tasks.length} task{tasks.length === 1 ? '' : 's'}.
          Moderation actions (pause/remove) need a backend admin endpoint that is not available yet.
        </p>
      </div>

      <div className="relative sm:w-72">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks or campaigns…"
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading tasks…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load tasks</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match your search'}
          description={
            tasks.length === 0
              ? 'Tasks are created by businesses when they launch campaigns.'
              : 'Try a different search term.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="py-3 px-4 font-bold">Task</th>
                  <th className="py-3 px-4 font-bold">Campaign</th>
                  <th className="py-3 px-4 font-bold">Reward</th>
                  <th className="py-3 px-4 font-bold">Slots</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">{t.title}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{t.campaign?.title || `Campaign #${t.campaign_id}`}</td>
                    <td className="py-3 px-4 text-xs font-bold text-gray-900">
                      ${((t.reward_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {t.slots_taken ?? 0} / {t.slots_total ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
