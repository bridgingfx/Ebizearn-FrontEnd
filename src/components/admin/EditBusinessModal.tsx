import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';
import { toast } from '../../utils/toast';

interface Props {
  user: User;
  onClose: () => void;
  onSaved: (user: User) => void;
}

const inputCls = 'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

export const EditBusinessModal: React.FC<Props> = ({ user, onClose, onSaved }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [companyName, setCompanyName] = useState(user.business?.company_name || '');
  const [industry, setIndustry] = useState(user.business?.industry || '');
  const [website, setWebsite] = useState(user.business?.website || '');
  const [phone, setPhone] = useState((user.business as unknown as { phone?: string })?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateUser(user.id, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        company_name: companyName.trim() || undefined,
        industry: industry.trim() || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      if (res.success && res.data) {
        onSaved(res.data);
      } else {
        toast.error(res.message || 'Could not save changes.');
      }
    } catch (err) {
      toast.error(getApiError(err, 'Could not save changes.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#0C1322] border-b border-gray-100 dark:border-white/10 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Edit business</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Contact name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Company name</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Industry</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputCls} placeholder="https://" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1275DD] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
