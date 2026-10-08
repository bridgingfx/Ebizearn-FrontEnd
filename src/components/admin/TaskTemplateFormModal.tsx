import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { api, getApiError, taskTemplatesApi } from '../../api';
import type { TaskTemplate, TaskTemplateIcon, TaskTemplateInput } from '../../types';
import { TEMPLATE_ICONS } from '../task/TaskTemplateCard';
import { dropdownListsApi } from '../../api/dropdownLists';

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

/**
 * Fallback wizard presets when the API list can't be loaded. The real list
 * is managed by Super Admin (Task Library → Manage → Wizard presets).
 */
const FALLBACK_HINTS = [
  { value: 'share', label: 'Share / repost' },
  { value: 'tiktok', label: 'Short video (TikTok)' },
  { value: 'comment', label: 'Comment / engagement' },
  { value: 'app', label: 'App testing' },
  { value: 'whatsapp', label: 'WhatsApp status' },
  { value: 'review', label: 'Review' },
  { value: 'survey', label: 'Survey / feedback' },
];

interface TaskTypeOption {
  key: string;
  name: string;
}

/**
 * Create or edit a Task Library template (manage_task_library). Visibility
 * toggles decide which audiences see it: businesses, admins, or both.
 */
export const TaskTemplateFormModal: React.FC<{
  template?: TaskTemplate | null;
  onClose: () => void;
  onSaved: (t: TaskTemplate) => void;
}> = ({ template, onClose, onSaved }) => {
  const editing = Boolean(template);
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [icon, setIcon] = useState<TaskTemplateIcon>(template?.icon ?? 'share');
  const [duration, setDuration] = useState(template?.duration_label ?? '');
  const [reward, setReward] = useState(template?.reward_label ?? '');
  const [hint, setHint] = useState(template?.template_key ?? '');
  const [taskType, setTaskType] = useState(template?.task_type_key ?? '');
  const [platform, setPlatform] = useState(template?.platform ?? '');
  const [instructions, setInstructions] = useState(template?.instructions ?? '');
  const [visibleBusiness, setVisibleBusiness] = useState(template?.visible_to_business ?? true);
  const [visibleAdmin, setVisibleAdmin] = useState(template?.visible_to_admin ?? true);
  const [active, setActive] = useState(template?.is_active ?? true);
  const [taskTypes, setTaskTypes] = useState<TaskTypeOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hints, setHints] = useState(FALLBACK_HINTS);

  useEffect(() => {
    api
      .get('/task-types')
      .then((r) => setTaskTypes((r.data?.data ?? r.data ?? []) as TaskTypeOption[]))
      .catch(() => setTaskTypes([]));
    dropdownListsApi
      .publicPresets()
      .then((r) => r.success && r.data.length && setHints(r.data.map((p) => ({ value: p.key, label: p.label }))))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = name.trim() && description.trim() && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const payload: TaskTemplateInput = {
      name: name.trim(),
      description: description.trim(),
      icon,
      duration_label: duration.trim() || null,
      reward_label: reward.trim() || null,
      template_key: hint || null,
      task_type_key: taskType || null,
      platform: platform.trim() || null,
      instructions: instructions.trim() || null,
      visible_to_business: visibleBusiness,
      visible_to_admin: visibleAdmin,
      is_active: active,
    };
    try {
      const res = template ? await taskTemplatesApi.update(template.id, payload) : await taskTemplatesApi.create(payload);
      if (res.success) {
        onSaved(res.data);
        onClose();
      } else {
        setError(res.message || 'Could not save the template.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save the template.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editing ? 'Edit template' : 'New template'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{editing ? 'Edit template' : 'New template'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              A recipe only — nothing is published until someone launches a campaign from it.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Instagram Story Share" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} className={`${inputCls} resize-none`} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Icon</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TEMPLATE_ICONS) as TaskTemplateIcon[]).map((key) => {
                  const Icon = TEMPLATE_ICONS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIcon(key)}
                      aria-label={key}
                      aria-pressed={icon === key}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        icon === key
                          ? 'border-[#168BFF] bg-[#168BFF]/10 text-[#168BFF]'
                          : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} maxLength={64} placeholder="e.g. 2–5 min" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Reward guide</label>
              <input value={reward} onChange={(e) => setReward(e.target.value)} maxLength={64} placeholder="e.g. $0.10 – $0.30" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Task type</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className={`${inputCls} appearance-none`}>
                <option value="">None</option>
                {taskTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Wizard preset</label>
              <select value={hint} onChange={(e) => setHint(e.target.value)} className={`${inputCls} appearance-none`}>
                <option value="">None</option>
                {hints.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Platform</label>
              <input value={platform} onChange={(e) => setPlatform(e.target.value)} maxLength={64} placeholder="e.g. Instagram (optional)" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Default instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Pre-filled contributor instructions (optional)"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10">
            <Toggle label="Show to business accounts" hint="Appears in the business portal Task Library." checked={visibleBusiness} onChange={setVisibleBusiness} />
            <Toggle label="Show to admins" hint="Appears in the admin panel Task Library." checked={visibleAdmin} onChange={setVisibleAdmin} />
            <Toggle label="Active" hint="Inactive templates are hidden from everyone except template managers." checked={active} onChange={setActive} />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-[#141821] border-t border-gray-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save template' : 'Create template'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, hint, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer">
    <span>
      <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">{label}</span>
      <span className="block text-xs text-gray-500 dark:text-gray-400">{hint}</span>
    </span>
    <span className="relative inline-flex shrink-0">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="w-10 h-6 rounded-full bg-gray-200 dark:bg-white/15 peer-checked:bg-[#168BFF] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#168BFF]/40" />
      <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </span>
  </label>
);
