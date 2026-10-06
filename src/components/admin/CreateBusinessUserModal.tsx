import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Info, Loader2, X } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

/** Mirrors the backend StrongPassword rule so the form can explain itself. */
const passwordProblems = (p: string): string[] => {
  const out: string[] = [];
  if (p.length < 10) out.push('10+ characters');
  if (!/[A-Z]/.test(p)) out.push('an uppercase letter');
  if (!/[a-z]/.test(p)) out.push('a lowercase letter');
  if (!/[0-9]/.test(p)) out.push('a digit');
  if (!/[^A-Za-z0-9]/.test(p)) out.push('a symbol');
  return out;
};

/**
 * Create a business user account (POST /admin/businesses,
 * create_business_users). The server fixes the role to `business` and
 * creates the account active and verified, so the owner can sign in to the
 * business portal straight away with this email and password.
 */
export const CreateBusinessUserModal: React.FC<{ onClose: () => void; onCreated: (u: User) => void }> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const problems = passwordProblems(password);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSave = name.trim() && emailOk && company.trim() && problems.length === 0 && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminApi.createBusinessUser({
        name: name.trim(),
        email: email.trim(),
        password,
        company_name: company.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
      });
      if (res.success && res.data) {
        onCreated(res.data);
        onClose();
      } else {
        setError(res.message || 'Could not create the business account.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not create the business account.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Create business account">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141821] rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#141821] border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">Create business account</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">The owner signs in to the business portal with this email and password.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          className="px-6 py-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="biz-company">Company name *</label>
              <input id="biz-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={255} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="biz-name">Owner name *</label>
              <input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={255} autoComplete="off" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="biz-email">Login email *</label>
              <input id="biz-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} autoComplete="off" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="biz-password">Password *</label>
              <div className="relative">
                <input
                  id="biz-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && problems.length > 0 && (
                <p className="text-xs mt-1.5 text-red-600 dark:text-red-400 font-semibold">Needs {problems.join(', ')}.</p>
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="biz-website">Website</label>
              <input id="biz-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" maxLength={255} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="biz-industry">Industry</label>
              <input id="biz-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={255} className={inputCls} />
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/25 rounded-xl px-4 py-3 text-xs text-blue-900 dark:text-blue-200">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#168BFF]" />
            <p>The account gets the Business role only, with the business permissions set in Roles &amp; Permissions. Share the password securely.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
