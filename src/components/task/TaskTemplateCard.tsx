import React from 'react';
import {
  ArrowRight,
  AtSign,
  ClipboardCheck,
  Clock,
  Eye,
  EyeOff,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Pencil,
  Share2,
  Smartphone,
  Star,
  Tag,
  Trash2,
  Video,
} from 'lucide-react';
import type { TaskTemplate, TaskTemplateIcon } from '../../types';

export const TEMPLATE_ICONS: Record<TaskTemplateIcon, React.ComponentType<{ className?: string }>> = {
  share: Share2,
  video: Video,
  comment: MessageSquare,
  app: Smartphone,
  whatsapp: MessagesSquare,
  at: AtSign,
  tag: Tag,
  survey: ClipboardCheck,
  megaphone: Megaphone,
  star: Star,
};

/**
 * One Task Library recipe. `onUse` opens the real creation flow (wizard or
 * staff post form). Passing `onEdit` / `onDelete` turns on the management
 * footer with visibility badges (Super Admin / manage_task_library).
 */
export const TaskTemplateCard: React.FC<{
  template: TaskTemplate;
  onUse?: (t: TaskTemplate) => void;
  onEdit?: (t: TaskTemplate) => void;
  onDelete?: (t: TaskTemplate) => void;
}> = ({ template: t, onUse, onEdit, onDelete }) => {
  const Icon = TEMPLATE_ICONS[t.icon] ?? Share2;
  const managing = Boolean(onEdit || onDelete);

  return (
    <div
      className={`bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-5 flex flex-col hover:shadow-md transition-shadow ${
        managing && !t.is_active ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-[#168BFF]/10 text-[#168BFF] shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex-1 min-w-0 pt-2">{t.name}</h3>
        {managing && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(t)}
                title="Edit template"
                aria-label={`Edit ${t.name}`}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#168BFF] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(t)}
                title="Delete template"
                aria-label={`Delete ${t.name}`}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{t.description}</p>

      <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 mb-4">
        {t.duration_label && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {t.duration_label}
          </span>
        )}
        {t.reward_label && <span className="font-bold text-gray-700 dark:text-gray-300">{t.reward_label}</span>}
      </div>

      {managing && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <VisibilityChip on={t.visible_to_business} label="Business" />
          <VisibilityChip on={t.visible_to_admin} label="Admin" />
          {!t.is_active && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
              Inactive
            </span>
          )}
        </div>
      )}

      {onUse && (
        <button
          type="button"
          onClick={() => onUse(t)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#07182F] hover:bg-[#168BFF] text-white text-xs font-bold rounded-xl transition-colors"
        >
          Use This Template <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

const VisibilityChip: React.FC<{ on: boolean; label: string }> = ({ on, label }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
      on
        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
        : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 line-through'
    }`}
    title={on ? `Visible to ${label.toLowerCase()} accounts` : `Hidden from ${label.toLowerCase()} accounts`}
  >
    {on ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
    {label}
  </span>
);
