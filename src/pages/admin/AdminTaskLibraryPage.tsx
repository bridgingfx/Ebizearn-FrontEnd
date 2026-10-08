import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, KeyRound, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiError, taskTemplatesApi } from '../../api';
import type { TaskTemplate } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/can';
import { toast } from '../../utils/toast';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ErrorBlock, FilterPills, LoadingBlock, PageHeader } from '../../components/common/ui';
import { TaskTemplateCard } from '../../components/task/TaskTemplateCard';
import { TaskTemplateFormModal } from '../../components/admin/TaskTemplateFormModal';
import { CreateCampaignModal, type CampaignPrefill } from '../../components/admin/CreateCampaignModal';
import { ManageListsMenu } from '../../components/admin/ManageListsMenu';

type Filter = 'all' | 'business' | 'admin' | 'inactive';

/**
 * Task Library in the admin panel — the same templates businesses see at
 * /business/tasks. "Use This Template" opens the staff post-campaign form
 * pre-filled. Holders of manage_task_library (Super Admin by default) also
 * create, edit and delete templates and choose, per template, whether
 * business accounts and/or admins see it.
 */
export const AdminTaskLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<TaskTemplate | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<TaskTemplate | null>(null);
  const [prefill, setPrefill] = useState<CampaignPrefill | null>(null);

  const canPost = can(user, 'post_campaigns');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskTemplatesApi.staffList();
      if (res.success) {
        setTemplates(res.data ?? []);
        setCanManage(Boolean(res.meta?.can_manage));
      } else {
        setError(res.message || 'Could not load the Task Library.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load the Task Library.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'business':
        return templates.filter((t) => t.visible_to_business && t.is_active);
      case 'admin':
        return templates.filter((t) => t.visible_to_admin && t.is_active);
      case 'inactive':
        return templates.filter((t) => !t.is_active);
      default:
        return templates;
    }
  }, [templates, filter]);

  const onSaved = (t: TaskTemplate) =>
    setTemplates((items) => (items.some((x) => x.id === t.id) ? items.map((x) => (x.id === t.id ? t : x)) : [...items, t]));

  const confirmDelete = async () => {
    const t = deleting;
    if (!t) return;
    setDeleting(null);
    try {
      const res = await taskTemplatesApi.remove(t.id);
      if (res.success) {
        setTemplates((items) => items.filter((x) => x.id !== t.id));
        toast.success('Template deleted.');
      } else {
        toast.error(res.message || 'Could not delete the template.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not delete the template.'));
    }
  };

  const startFromTemplate = (t: TaskTemplate) =>
    setPrefill({
      title: t.name,
      description: t.description,
      instructions: t.instructions ?? '',
      taskTypeKey: t.task_type_key,
      platform: t.platform,
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Library"
        subtitle={
          canManage
            ? 'Templates businesses and admins start campaigns from. Choose who sees each one; nothing is published until a campaign is launched.'
            : 'Proven task recipes. Every template opens the post-campaign form pre-filled — nothing is published automatically.'
        }
        actions={
          canManage ? (
            <>
              {user?.role === 'superadmin' && (
                <Link
                  to="/admin/permissions"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Role permissions
                </Link>
              )}
              {user?.role === 'superadmin' && <ManageListsMenu />}
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> New template
              </button>
            </>
          ) : undefined
        }
      />

      {canManage && (
        <FilterPills
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={[
            { value: 'all', label: `All (${templates.length})` },
            { value: 'business', label: 'Shown to business' },
            { value: 'admin', label: 'Shown to admins' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      )}

      {loading ? (
        <LoadingBlock label="Loading templates…" />
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => void load()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={templates.length === 0 ? 'No templates yet' : 'No templates match this filter'}
          description={
            canManage
              ? 'Create a template so businesses and admins can start campaigns from it.'
              : 'Super Admin has not made any templates available to admins yet.'
          }
          {...(canManage && templates.length === 0 ? { actionLabel: 'New template', onAction: () => setEditing(null) } : {})}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <TaskTemplateCard
              key={t.id}
              template={t}
              onUse={canPost ? startFromTemplate : undefined}
              onEdit={canManage ? setEditing : undefined}
              onDelete={canManage ? setDeleting : undefined}
            />
          ))}
        </div>
      )}

      {editing !== undefined && (
        <TaskTemplateFormModal template={editing} onClose={() => setEditing(undefined)} onSaved={onSaved} />
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete this template?"
        message={
          <>
            <strong>{deleting?.name}</strong> will disappear from every Task Library. Campaigns already created from it are not affected.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />

      {prefill && (
        <CreateCampaignModal
          initial={prefill}
          onClose={() => setPrefill(null)}
          onCreated={() => toast.success('Campaign posted — it is waiting in review on the Campaigns page.')}
        />
      )}
    </div>
  );
};
