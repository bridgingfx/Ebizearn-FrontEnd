import React, { useCallback, useEffect, useState } from 'react';
import { Globe, Plus, Pencil, Trash2, Loader2, X, ImagePlus } from 'lucide-react';
import { getApiError } from '../../api';
import { platformsApi, type ManagedSocialPlatform } from '../../api/platforms';
import { PlatformBrandIcon } from '../../components/common/PlatformBrandIcon';
import { PageHeader, LoadingBlock, ErrorBlock } from '../../components/common/ui';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from '../../utils/toast';

/**
 * Super Admin → Social Platforms.
 *
 * Add a new social media (name + SVG/PNG logo upload) and it automatically
 * appears in the platform picker for admin, moderator and business users.
 * Built-in networks can be deactivated but not deleted.
 */
export const AdminPlatformsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<ManagedSocialPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedSocialPlatform | null>(null);
  const [deleting, setDeleting] = useState<ManagedSocialPlatform | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformsApi.manageList();
      if (res.success && res.data) setPlatforms(res.data);
      else setError(res.message || 'Could not load platforms.');
    } catch (e) {
      setError(getApiError(e, 'Could not load platforms.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (p: ManagedSocialPlatform) => {
    const form = new FormData();
    form.append('is_active', p.is_active ? '0' : '1');
    try {
      const res = await platformsApi.update(p.id, form);
      if (res.success && res.data) {
        setPlatforms((ps) => ps.map((x) => (x.id === p.id ? res.data! : x)));
        toast.success(res.data.name + (res.data.is_active ? ' is now visible.' : ' is hidden.'));
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update the platform.'));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await platformsApi.remove(deleting.id);
      if (res.success) {
        toast.success(res.message || 'Platform deleted.');
        void load();
      } else {
        toast.error(res.message || 'Could not delete the platform.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not delete the platform.'));
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Platforms"
        subtitle="Networks campaigns can target. Add a new social media with its logo and it appears in every platform picker."
        actions={
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add platform
          </button>
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => void load()} />
      ) : platforms.length === 0 ? (
        <EmptyState icon={Globe} title="No platforms yet" description="Add the first social media platform." />
      ) : (
        <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Key</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {platforms.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          <PlatformBrandIcon platform={p.key} logoUrl={p.logo_url} brandColor={p.brand_color} className="w-5 h-5" />
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{p.name}</span>
                        {p.builtin && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                            Built-in
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono">{p.key}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => void toggleActive(p)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          p.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditing(p); setFormOpen(true); }}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(p)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <PlatformFormModal
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); void load(); }}
        />
      )}

      <ConfirmModal
        open={!!deleting}
        title={`Delete ${deleting?.name}?`}
        message={
          deleting?.builtin
            ? `${deleting.name} is a built-in platform — it will be deactivated (hidden from pickers) rather than deleted.`
            : `This removes ${deleting?.name} from every platform picker. This cannot be undone.`
        }
        confirmLabel={deleting?.builtin ? 'Deactivate' : 'Delete'}
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

const PlatformFormModal: React.FC<{
  editing: ManagedSocialPlatform | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ editing, onClose, onSaved }) => {
  const [name, setName] = useState(editing?.name ?? '');
  const [brandColor, setBrandColor] = useState(editing?.brand_color ?? '#168BFF');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(editing?.logo_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickLogo = (f: File | null) => {
    setLogo(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setLogoPreview(url);
    } else {
      setLogoPreview(editing?.logo_url ?? null);
    }
  };

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('brand_color', brandColor);
      if (logo) form.append('logo', logo);
      const res = editing ? await platformsApi.update(editing.id, form) : await platformsApi.create(form);
      if (res.success) {
        toast.success(editing ? 'Platform updated.' : 'Platform added — it is now in every picker.');
        onSaved();
      } else {
        setError(res.message || 'Could not save the platform.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save the platform.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editing ? 'Edit platform' : 'Add platform'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{editing ? 'Edit platform' : 'Add social media'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Snapchat" className={inputCls} disabled={!!editing?.builtin} />
            {editing?.builtin && <p className="text-xs text-gray-400 mt-1">Built-in platform names cannot be changed.</p>}
          </div>
          <div>
            <label className={labelCls}>Logo (SVG or PNG)</label>
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="" className="w-9 h-9 object-contain" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                )}
              </span>
              <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                {logo ? 'Change logo' : 'Upload logo'}
                <input
                  type="file"
                  accept=".svg,.png,image/svg+xml,image/png"
                  className="hidden"
                  onChange={(e) => pickLogo(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Square SVG or PNG works best. Shown in every platform picker.</p>
          </div>
          <div>
            <label className={labelCls}>Brand color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent" />
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{brandColor}</span>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!name.trim() || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save changes' : 'Add platform'}
          </button>
        </div>
      </div>
    </div>
  );
};
