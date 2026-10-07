import React, { useState } from 'react';
import { Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profile';
import { getApiError } from '../../api/client';
import { toast } from '../../utils/toast';

/**
 * Blocking modal shown when the signed-in account has no phone number
 * (e.g. Google/Apple signup). The user cannot proceed until they provide
 * one — Dawood: phone is mandatory for every account.
 */
export const PhoneRequiredModal: React.FC = () => {
  const { phoneRequired, setPhoneRequired, updateUser, user } = useAuth();
  const [countryCode, setCountryCode] = useState('+971');
  const [number, setNumber] = useState('');
  const [saving, setSaving] = useState(false);

  if (!phoneRequired) return null;

  const handleSave = async () => {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 4 || digits.length > 15) {
      toast.error('Enter a valid phone number (4–15 digits).');
      return;
    }
    setSaving(true);
    try {
      const res = await profileApi.update({
        phone: `${countryCode}${digits}`,
      });
      if (res.success) {
        if (user) updateUser({ ...user, phone: `${countryCode}${digits}` });
        setPhoneRequired(false);
        toast.success('Phone number saved.');
      } else {
        toast.error(res.message || 'Could not save your phone number.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not save your phone number.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#0e2240] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#168BFF]/10 text-[#168BFF] flex items-center justify-center mb-4">
          <Phone className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
          Add your phone number
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          We need your phone number to secure your account and send important updates. You can't continue without it.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            placeholder="+971"
            className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#168BFF]"
          />
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="501234567"
            inputMode="tel"
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#168BFF]"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae0] disabled:opacity-50 text-white text-sm font-black transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save & continue'}
        </button>
      </div>
    </div>
  );
};
