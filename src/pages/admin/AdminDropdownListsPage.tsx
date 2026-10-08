import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ExternalLink, ListChecks, Loader2, Lock, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { getApiError } from '../../api';
import { dropdownListsApi, type OpsTaskCategory, type OpsTaskType, type WizardPreset } from '../../api/dropdownLists';
import { PageHeader } from '../../components/common/ui';
import { ConfirmModal } from '../../components/common/ConfirmModal';

type Tab = 'all' | 'types' | 'categories' | 'presets';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1.5';
const iconBtn = 'p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors';

/** Where each option list is managed. */
type Source =
  | { kind: 'managed'; tab: Exclude<Tab, 'all'> }
  | { kind: 'page'; label: string; path: string }
  | { kind: 'data'; note: string }
  | { kind: 'fixed'; options: string; reason: string };

/** Every dropdown in the project: page → field → where its options come from. */
const INVENTORY: { page: string; fields: { field: string; source: Source }[] }[] = [
  {
    page: 'Admin → Task Library → New / edit template',
    fields: [
      { field: 'Task type', source: { kind: 'managed', tab: 'types' } },
      { field: 'Wizard preset', source: { kind: 'managed', tab: 'presets' } },
    ],
  },
  {
    page: 'Admin → Tasks → Create / edit task',
    fields: [
      { field: 'Campaign', source: { kind: 'data', note: 'Funded campaigns — listed automatically' } },
      { field: 'Task type', source: { kind: 'managed', tab: 'types' } },
      { field: 'Difficulty', source: { kind: 'fixed', options: 'Easy, Medium, Hard', reason: 'Stored as a fixed database field used by task matching' } },
    ],
  },
  {
    page: 'Admin → Campaigns → Create campaign',
    fields: [
      { field: 'Business', source: { kind: 'data', note: 'Business accounts — listed automatically' } },
      { field: 'Category', source: { kind: 'managed', tab: 'categories' } },
      { field: 'Task type', source: { kind: 'managed', tab: 'types' } },
      { field: 'Min. contributor level', source: { kind: 'page', label: 'Contributor Ranks', path: '/admin/ranks' } },
    ],
  },
  { page: 'Admin / Business → Edit campaign', fields: [{ field: 'Min. contributor level', source: { kind: 'page', label: 'Contributor Ranks', path: '/admin/ranks' } }] },
  {
    page: 'Business → Create campaign wizard',
    fields: [
      { field: 'Category / task type', source: { kind: 'managed', tab: 'categories' } },
      { field: 'Platform', source: { kind: 'page', label: 'Platforms', path: '/admin/platforms' } },
      { field: 'Target country', source: { kind: 'fixed', options: 'Worldwide + all countries', reason: 'Standard country list' } },
      { field: 'Minimum contributor level', source: { kind: 'page', label: 'Contributor Ranks', path: '/admin/ranks' } },
    ],
  },
  { page: 'Admin → Users → Create business account', fields: [{ field: 'Industry', source: { kind: 'fixed', options: 'Industry list', reason: 'Same list as business sign-up' } }] },
  { page: 'Business sign-up', fields: [{ field: 'Industry', source: { kind: 'fixed', options: 'Industry list', reason: 'Standard industry list' } }] },
  {
    page: 'Contributor → Tasks feed',
    fields: [
      { field: 'Filter by task type', source: { kind: 'managed', tab: 'categories' } },
      { field: 'Sort tasks', source: { kind: 'fixed', options: 'Newest, Highest reward, Quickest', reason: 'Sorting options built into the feed' } },
    ],
  },
  {
    page: 'Contributor → Profile → KYC',
    fields: [{ field: 'Document type', source: { kind: 'fixed', options: 'National ID card, Passport, Driving licence, Residence permit', reason: 'Accepted identity documents' } }],
  },
  {
    page: 'Contributor → Support',
    fields: [{ field: 'Category', source: { kind: 'fixed', options: 'Payout, Task proof dispute, Account, Technical, Other', reason: 'Routes tickets to the right team' } }],
  },
  {
    page: 'Admin → Support',
    fields: [
      { field: 'Status', source: { kind: 'fixed', options: 'Open, Pending, Resolved, Closed', reason: 'Ticket workflow states' } },
      { field: 'Priority', source: { kind: 'fixed', options: 'Low, Normal, High, Urgent', reason: 'Ticket priorities' } },
    ],
  },
  { page: 'Admin → Verification', fields: [{ field: 'Reject reason', source: { kind: 'fixed', options: 'Standard rejection reasons', reason: 'Shown to contributors with each rejection' } }] },
  { page: 'Admin → Deposits → Method', fields: [{ field: 'Payment gateway', source: { kind: 'page', label: 'Payment Gateways', path: '/admin/payment-gateways' } }] },
  { page: 'Admin → Payment Gateways', fields: [{ field: 'Provider', source: { kind: 'fixed', options: 'Supported payment providers', reason: 'Each provider needs its own integration code' } }] },
  {
    page: 'Admin → Email & Campaigns',
    fields: [
      { field: 'Encryption', source: { kind: 'fixed', options: 'TLS, SSL, None', reason: 'SMTP standards' } },
      { field: 'Audience', source: { kind: 'fixed', options: 'All users, Contributors, Businesses…', reason: 'Defined audience groups' } },
      { field: 'Email template', source: { kind: 'page', label: 'Email & Campaigns', path: '/admin/email' } },
    ],
  },
  { page: 'Public → Contact', fields: [{ field: 'Department / inquiry type', source: { kind: 'fixed', options: 'Contributor, Business, Partnerships, Press, Other', reason: 'Routes the message' } }] },
  { page: 'Live chat widget', fields: [{ field: 'Topic / priority', source: { kind: 'fixed', options: 'Chat topics and priorities', reason: 'Built into the support chat' } }] },
];

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All dropdowns' },
  { key: 'types', label: 'Task types' },
  { key: 'categories', label: 'Categories' },
  { key: 'presets', label: 'Wizard presets' },
];

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/**
 * Super Admin → Task Library → Dropdown lists: every dropdown in the project
 * (page + field + where its options come from), and add / edit / delete for
 * the managed lists. Removing an option in use switches it off instead.
 */
export const AdminDropdownListsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get('tab') as Tab | null;
  const tab: Tab = fromUrl && TABS.some((t) => t.key === fromUrl) ? fromUrl : 'all';
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dropdown lists"
        subtitle="Every dropdown in the platform and where its options come from. Add, edit or delete the options of the managed lists — changes show in every form straight away."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setMsg(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === t.key
                ? 'bg-[#07182F] dark:bg-[#168BFF] text-white'
                : 'bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
        </p>
      )}

      {tab === 'all' && <Inventory onOpen={setTab} />}
      {tab === 'types' && <TaskTypesList onMsg={setMsg} />}
      {tab === 'categories' && <CategoriesList onMsg={setMsg} />}
      {tab === 'presets' && <PresetsList onMsg={setMsg} />}
    </div>
  );
};

const Card: React.FC<{ title: string; subtitle: string; onAdd?: () => void; children: React.ReactNode }> = ({ title, subtitle, onAdd, children }) => (
  <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl">{subtitle}</p>
      </div>
      {onAdd && (
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold">
          <Plus className="w-4 h-4" /> Add
        </button>
      )}
    </div>
    {children}
  </div>
);

const Inventory: React.FC<{ onOpen: (t: Tab) => void }> = ({ onOpen }) => (
  <Card title="All dropdowns" subtitle="Each page, the dropdown field on it, and where its options are managed.">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-white/5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <th className="py-3 px-5">Page</th>
            <th className="py-3 px-4">Dropdown (field)</th>
            <th className="py-3 px-4">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
          {INVENTORY.flatMap((p) =>
            p.fields.map((f, i) => (
              <tr key={`${p.page}-${f.field}`}>
                <td className="py-3 px-5 text-gray-500 dark:text-gray-400 align-top">{i === 0 ? p.page : ''}</td>
                <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100 align-top">{f.field}</td>
                <td className="py-3 px-4 align-top">
                  {f.source.kind === 'managed' ? (
                    <button type="button" onClick={() => onOpen((f.source as { tab: Tab }).tab)} className="inline-flex items-center gap-1 font-bold text-[#168BFF] hover:underline">
                      <Pencil className="w-3 h-3" /> Edit in “{TABS.find((t) => t.key === (f.source as { tab: Tab }).tab)?.label}”
                    </button>
                  ) : f.source.kind === 'page' ? (
                    <Link to={f.source.path} className="inline-flex items-center gap-1 font-bold text-[#168BFF] hover:underline">
                      <ExternalLink className="w-3 h-3" /> Managed in {f.source.label}
                    </Link>
                  ) : f.source.kind === 'data' ? (
                    <span className="text-gray-500 dark:text-gray-400">{f.source.note}</span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mr-1.5 rounded bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        <Lock className="w-2.5 h-2.5" /> Fixed
                      </span>
                      {f.source.options} — <i>{f.source.reason}</i>
                    </span>
                  )}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  </Card>
);

/** Small shared modal shell for the add / edit forms. */
const FormModal: React.FC<{ title: string; onClose: () => void; onSave: () => void; saving: boolean; error: string | null; children: React.ReactNode }> = ({
  title,
  onClose,
  onSave,
  saving,
  error,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
    <div className="w-full max-w-md bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">{title}</h3>
        <button type="button" onClick={onClose} className={iconBtn} aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 space-y-4">
        {children}
        {error && (
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}
      </div>
      <div className="px-5 py-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500">
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </div>
  </div>
);

const StatusPill: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
    {active ? 'Active' : 'Off'}
  </span>
);

const RowActions: React.FC<{ onEdit: () => void; onDelete: () => void; name: string }> = ({ onEdit, onDelete, name }) => (
  <span className="inline-flex gap-1">
    <button type="button" onClick={onEdit} className={`${iconBtn} hover:text-[#168BFF]`} aria-label={`Edit ${name}`} title="Edit">
      <Pencil className="w-4 h-4" />
    </button>
    <button type="button" onClick={onDelete} className={`${iconBtn} hover:text-red-600`} aria-label={`Delete ${name}`} title="Delete">
      <Trash2 className="w-4 h-4" />
    </button>
  </span>
);

type MsgFn = (m: { ok: boolean; text: string } | null) => void;

/** Loads a list and runs add / edit / delete with shared state. */
function useList<T>(load: () => Promise<{ data: T[] }>, onMsg: MsgFn) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => {
    load()
      .then((res) => setItems(res.data))
      .catch((e) => setError(getApiError(e, 'Could not load the list.')));
  }, [load]);
  useEffect(refresh, [refresh]);

  const remove = async (fn: () => Promise<{ message?: string }>) => {
    onMsg(null);
    try {
      const res = await fn();
      onMsg({ ok: true, text: res.message || 'Deleted.' });
      refresh();
    } catch (e) {
      onMsg({ ok: false, text: getApiError(e, 'Could not delete.') });
    }
  };
  return { items, error, refresh, remove };
}

const ListBody: React.FC<{ items: unknown[] | null; error: string | null; empty: string; children: React.ReactNode }> = ({ items, error, empty, children }) =>
  error ? (
    <p className="p-5 text-xs text-red-600 dark:text-red-400">{error}</p>
  ) : items === null ? (
    <div className="p-8 text-center text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin inline-block" />
    </div>
  ) : items.length === 0 ? (
    <p className="p-8 text-center text-xs text-gray-500">{empty}</p>
  ) : (
    <>{children}</>
  );

// ------------------------------------------------------------------ task types

const TaskTypesList: React.FC<{ onMsg: MsgFn }> = ({ onMsg }) => {
  const { items, error, refresh, remove } = useList<OpsTaskType>(dropdownListsApi.taskTypes, onMsg);
  const [editing, setEditing] = useState<OpsTaskType | 'new' | null>(null);
  const [deleting, setDeleting] = useState<OpsTaskType | null>(null);

  return (
    <Card
      title="Task types"
      subtitle="The “Task type” dropdown on Create task, Create campaign and Task Library templates. The reward range limits what a task of this type can pay per slot."
      onAdd={() => setEditing('new')}
    >
      <ListBody items={items} error={error} empty="No task types yet.">
        <ul className="divide-y divide-gray-100 dark:divide-white/10">
          {items?.map((t) => (
            <li key={t.key} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{t.name}</span>{' '}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({dollars(t.reward_band_min_cents)}–{dollars(t.reward_band_max_cents)}) · <code className="text-[11px]">{t.key}</code>
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <StatusPill active={t.is_active} />
                <RowActions name={t.name} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />
              </span>
            </li>
          ))}
        </ul>
      </ListBody>
      {editing && <TaskTypeForm type={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={(text) => { setEditing(null); onMsg({ ok: true, text }); refresh(); }} />}
      <ConfirmModal
        open={!!deleting}
        title="Delete task type?"
        message={deleting ? `“${deleting.name}” will be deleted. If tasks already use it, it is switched off instead so they keep working.` : undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          const t = deleting;
          setDeleting(null);
          if (t) void remove(() => dropdownListsApi.deleteTaskType(t.key));
        }}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
};

const TaskTypeForm: React.FC<{ type: OpsTaskType | null; onClose: () => void; onSaved: (text: string) => void }> = ({ type, onClose, onSaved }) => {
  const [name, setName] = useState(type?.name ?? '');
  const [description, setDescription] = useState(type?.description ?? '');
  const [min, setMin] = useState(type ? (type.reward_band_min_cents / 100).toFixed(2) : '0.10');
  const [max, setMax] = useState(type ? (type.reward_band_max_cents / 100).toFixed(2) : '0.50');
  const [active, setActive] = useState(type?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const minC = Math.round(parseFloat(min) * 100);
    const maxC = Math.round(parseFloat(max) * 100);
    if (name.trim().length < 2) return setError('Enter a name.');
    if (!(minC > 0) || !(maxC >= minC)) return setError('Enter a reward range where the maximum is at least the minimum.');
    setSaving(true);
    try {
      const p = { name: name.trim(), description: description.trim() || undefined, reward_band_min_cents: minC, reward_band_max_cents: maxC };
      if (type) {
        await dropdownListsApi.updateTaskType(type.key, { ...p, is_active: active });
        onSaved(`“${p.name}” saved.`);
      } else {
        const res = await dropdownListsApi.createTaskType(p);
        onSaved(res.message || `“${p.name}” added.`);
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title={type ? 'Edit task type' : 'Add task type'} onClose={onClose} onSave={() => void save()} saving={saving} error={error}>
      <div>
        <label className={labelCls}>Name *</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Story repost" maxLength={100} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Min reward (USD) *</label>
          <input className={inputCls} inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Max reward (USD) *</label>
          <input className={inputCls} inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
      </div>
      {type && (
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="accent-[#168BFF]" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (shown in dropdowns)
        </label>
      )}
    </FormModal>
  );
};

// ------------------------------------------------------------------ categories

const CategoriesList: React.FC<{ onMsg: MsgFn }> = ({ onMsg }) => {
  const { items, error, refresh, remove } = useList<OpsTaskCategory>(dropdownListsApi.categories, onMsg);
  const [editing, setEditing] = useState<OpsTaskCategory | 'new' | null>(null);
  const [deleting, setDeleting] = useState<OpsTaskCategory | null>(null);

  return (
    <Card
      title="Categories"
      subtitle="The “Category” dropdown on Create campaign and the business wizard, and the task-type filter on the contributor Tasks feed."
      onAdd={() => setEditing('new')}
    >
      <ListBody items={items} error={error} empty="No categories yet.">
        <ul className="divide-y divide-gray-100 dark:divide-white/10">
          {items?.map((c) => (
            <li key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{c.name}</span>{' '}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {c.description ? `${c.description} · ` : ''}
                  <code className="text-[11px]">{c.slug}</code>
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <StatusPill active={c.is_active} />
                <RowActions name={c.name} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
              </span>
            </li>
          ))}
        </ul>
      </ListBody>
      {editing && <CategoryForm category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={(text) => { setEditing(null); onMsg({ ok: true, text }); refresh(); }} />}
      <ConfirmModal
        open={!!deleting}
        title="Delete category?"
        message={deleting ? `“${deleting.name}” will be deleted. If campaigns already use it, it is switched off instead so they keep working.` : undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          const c = deleting;
          setDeleting(null);
          if (c) void remove(() => dropdownListsApi.deleteCategory(c.id));
        }}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CategoryForm: React.FC<{ category: OpsTaskCategory | null; onClose: () => void; onSaved: (text: string) => void }> = ({ category, onClose, onSaved }) => {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [active, setActive] = useState(category?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    if (name.trim().length < 2) return setError('Enter a name.');
    setSaving(true);
    try {
      if (category) {
        await dropdownListsApi.updateCategory(category.id, { name: name.trim(), description: description.trim() || null, is_active: active });
        onSaved(`“${name.trim()}” saved.`);
      } else {
        await dropdownListsApi.createCategory({ slug: slugify(name), name: name.trim(), description: description.trim() || undefined });
        onSaved(`“${name.trim()}” added.`);
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title={category ? 'Edit category' : 'Add category'} onClose={onClose} onSave={() => void save()} saving={saving} error={error}>
      <div>
        <label className={labelCls}>Name *</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Giveaways" maxLength={100} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={255} />
      </div>
      {category && (
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="accent-[#168BFF]" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (shown in dropdowns)
        </label>
      )}
    </FormModal>
  );
};

// ------------------------------------------------------------------ wizard presets

const PresetsList: React.FC<{ onMsg: MsgFn }> = ({ onMsg }) => {
  const { items, error, refresh, remove } = useList<WizardPreset>(dropdownListsApi.presets, onMsg);
  const [editing, setEditing] = useState<WizardPreset | 'new' | null>(null);
  const [deleting, setDeleting] = useState<WizardPreset | null>(null);
  const [types, setTypes] = useState<OpsTaskType[]>([]);
  const [cats, setCats] = useState<OpsTaskCategory[]>([]);

  useEffect(() => {
    dropdownListsApi.taskTypes().then((r) => setTypes(r.data)).catch(() => undefined);
    dropdownListsApi.categories().then((r) => setCats(r.data)).catch(() => undefined);
  }, []);

  return (
    <Card
      title="Wizard presets"
      subtitle="The “Wizard preset” dropdown on Task Library templates. When a business starts a campaign from a template, the wizard pre-fills the task type, category and platform set here."
      onAdd={() => setEditing('new')}
    >
      <ListBody items={items} error={error} empty="No presets yet.">
        <ul className="divide-y divide-gray-100 dark:divide-white/10">
          {items?.map((p) => (
            <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{p.label}</span>{' '}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Pre-fills: {[types.find((t) => t.key === p.task_type_key)?.name, p.category?.name, p.platform].filter(Boolean).join(' · ') || 'nothing yet'}
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <StatusPill active={p.is_active ?? true} />
                <RowActions name={p.label} onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
              </span>
            </li>
          ))}
        </ul>
      </ListBody>
      {editing && (
        <PresetForm
          preset={editing === 'new' ? null : editing}
          types={types}
          cats={cats}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            onMsg({ ok: true, text });
            refresh();
          }}
        />
      )}
      <ConfirmModal
        open={!!deleting}
        title="Delete preset?"
        message={deleting ? `“${deleting.label}” will be deleted. If templates already use it, it is switched off instead.` : undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          const p = deleting;
          setDeleting(null);
          if (p) void remove(() => dropdownListsApi.deletePreset(p.id));
        }}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
};

const PresetForm: React.FC<{
  preset: WizardPreset | null;
  types: OpsTaskType[];
  cats: OpsTaskCategory[];
  onClose: () => void;
  onSaved: (text: string) => void;
}> = ({ preset, types, cats, onClose, onSaved }) => {
  const [label, setLabel] = useState(preset?.label ?? '');
  const [taskType, setTaskType] = useState(preset?.task_type_key ?? '');
  const [categoryId, setCategoryId] = useState(preset?.category_id ? String(preset.category_id) : '');
  const [platform, setPlatform] = useState(preset?.platform ?? '');
  const [active, setActive] = useState(preset?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    if (label.trim().length < 2) return setError('Enter a name.');
    setSaving(true);
    const p = {
      label: label.trim(),
      task_type_key: taskType || null,
      category_id: categoryId ? Number(categoryId) : null,
      platform: platform.trim() || null,
      is_active: active,
    };
    try {
      if (preset) {
        await dropdownListsApi.updatePreset(preset.id, p);
        onSaved(`“${p.label}” saved.`);
      } else {
        await dropdownListsApi.createPreset(p);
        onSaved(`“${p.label}” added.`);
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title={preset ? 'Edit wizard preset' : 'Add wizard preset'} onClose={onClose} onSave={() => void save()} saving={saving} error={error}>
      <div>
        <label className={labelCls}>Name *</label>
        <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Google review" maxLength={100} />
      </div>
      <div>
        <label className={labelCls}>Pre-fills task type</label>
        <select className={inputCls} value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          <option value="">None</option>
          {types.filter((t) => t.is_active || t.key === taskType).map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Pre-fills category</label>
        <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">None</option>
          {cats.filter((c) => c.is_active || String(c.id) === categoryId).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Pre-fills platform</label>
        <input className={inputCls} value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g. Instagram" maxLength={64} />
      </div>
      {preset && (
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="accent-[#168BFF]" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (shown in dropdowns)
        </label>
      )}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
        <ListChecks className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Businesses can still change everything in the wizard — these are only starting values.
      </p>
    </FormModal>
  );
};
