import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search, Loader2, AlertCircle, X, Eye, Plus, Pause, Play, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { Task } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { mapTaskForUi } from '../../utils/apiMappers';
import { toast } from '../../utils/toast';
import { TaskPreview, TaskPreviewSummary } from '../../components/task/TaskPreview';
import { TaskFormModal } from '../../components/admin/TaskFormModal';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/can';

/**
 * Staff task management (/staff/tasks). manage_task_templates opens the
 * list; create_tasks / edit_tasks (incl. pause/resume) / delete_tasks each
 * show their control only when held — Super Admin switches them per role
 * in Roles & Permissions, and the backend enforces the same gates. Create
 * adds a task to a funded campaign (reward band + pool checked
 * server-side); delete is refused once contributors have taken the task.
 */
export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const { user } = useAuth();
  const canCreate = can(user, 'create_tasks');
  const canEdit = can(user, 'edit_tasks');
  const canDelete = can(user, 'delete_tasks');
  const hasActions = canEdit || canDelete;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.staffTasks({ page });
      if (res.success) {
        setTasks(res.data || []);
        setLastPage(res.meta?.last_page ?? 1);
        setTotal(res.meta?.total ?? (res.data || []).length);
      } else {
        setError(res.message || 'Could not load tasks.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load tasks.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

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

  const toggle = async (t: Task) => {
    const next = t.status === 'available' ? 'paused' : 'available';
    setActingId(t.id);
    try {
      const res = await adminApi.updateStaffTask(t.id, { status: next });
      if (res.success && res.data) {
        setTasks((items) => items.map((x) => (x.id === t.id ? { ...x, ...res.data, campaign: x.campaign } : x)));
      } else {
        toast.error(res.message || 'Could not update the task.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update the task.'));
    } finally {
      setActingId(null);
    }
  };

  const confirmDelete = async () => {
    const t = deleting;
    if (!t) return;
    setDeleting(null);
    setActingId(t.id);
    try {
      const res = await adminApi.deleteStaffTask(t.id);
      if (res.success) {
        setTasks((items) => items.filter((x) => x.id !== t.id));
        setTotal((n) => Math.max(0, n - 1));
        toast.success('Task deleted.');
      } else {
        toast.error(res.message || 'Could not delete the task.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not delete the task.'));
    } finally {
      setActingId(null);
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
      case 'paused':
        return 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300';
      default:
        return 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Every task across all campaigns — {total} task{total === 1 ? '' : 's'}. Tasks with contributor activity can only be paused, not deleted.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Create task
          </button>
        )}
      </div>

      <div className="relative sm:w-72">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks or campaigns…"
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading tasks…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-300 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load tasks</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
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
              ? canCreate ? 'Tasks are created when a campaign launches, or with "Create task" above.' : 'Tasks are created when a campaign launches.'
              : 'Try a different search term.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                  <th className="py-3 px-4 font-bold">Task</th>
                  <th className="py-3 px-4 font-bold">Campaign</th>
                  <th className="py-3 px-4 font-bold">Reward</th>
                  <th className="py-3 px-4 font-bold">Slots</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">
                      <button
                        type="button"
                        onClick={() => setPreviewTask(t)}
                        className="text-left hover:text-[#168BFF] hover:underline inline-flex items-center gap-1.5"
                        title="Preview what contributors see"
                      >
                        <span>{t.title}</span>
                        <Eye className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      </button>
                      {t.task_type?.name && <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{t.task_type.name}</p>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {t.campaign?.title || `Campaign #${t.campaign_id}`}
                      {t.campaign?.business?.company_name && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{t.campaign.business.company_name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-gray-900 dark:text-gray-100">
                      ${((t.reward_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {t.slots_taken ?? 0} / {t.slots_total ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {actingId === t.id && <Loader2 className="w-4 h-4 animate-spin text-[#168BFF] mr-1" />}
                        {!hasActions && <span className="text-[11px] text-gray-400 dark:text-gray-500">View only</span>}
                        {canEdit && (t.status === 'available' || t.status === 'paused') && (
                          <button
                            type="button"
                            disabled={actingId === t.id}
                            onClick={() => void toggle(t)}
                            title={t.status === 'available' ? 'Pause task' : 'Resume task'}
                            aria-label={t.status === 'available' ? `Pause ${t.title}` : `Resume ${t.title}`}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                          >
                            {t.status === 'available' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            disabled={actingId === t.id}
                            onClick={() => setEditing(t)}
                            title="Edit task"
                            aria-label={`Edit ${t.title}`}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            disabled={actingId === t.id}
                            onClick={() => setDeleting(t)}
                            title="Delete task"
                            aria-label={`Delete ${t.title}`}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && lastPage > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl font-bold bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="font-bold text-gray-500 dark:text-gray-400">
            Page {page} of {lastPage}
          </span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl font-bold bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showCreate && (
        <TaskFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            toast.success('Task created.');
            if (page === 1) void load();
            else setPage(1);
          }}
        />
      )}

      {editing && (
        <TaskFormModal
          task={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            toast.success('Task saved.');
            setTasks((items) =>
              items.map((x) => (x.id === saved.id ? { ...x, ...saved, campaign: x.campaign } : x)),
            );
          }}
        />
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete this task?"
        message={
          <>
            <strong>{deleting?.title}</strong> will be removed from the marketplace. Tasks contributors have already taken can't be
            deleted — pause them instead.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />

      {/* Task preview modal — exactly what contributors see for this task. */}
      {previewTask && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewTask(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Task preview"
        >
          <div
            className="bg-[#F7F9FC] dark:bg-[#0B0F19] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Contributor preview</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">What contributors see for this task, from live task data.</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTask(null)}
                className="p-2 rounded-xl bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(() => {
              const ui = mapTaskForUi(previewTask);
              return (
                <div className="grid sm:grid-cols-2 gap-4 items-start">
                  <TaskPreview task={ui} />
                  <TaskPreviewSummary task={ui} />
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
