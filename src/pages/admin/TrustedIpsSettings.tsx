import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { getApiError } from '../../api/client';

type Props = { value: string; onSaved: () => Promise<void> };

export const TrustedIpsSettings: React.FC<Props> = ({ value, onSaved }) => {
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  let ips: string[] = [];
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    ips = Array.isArray(parsed) ? parsed.filter((ip): ip is string => typeof ip === 'string') : value.split(',').map(ip => ip.trim()).filter(Boolean);
  } catch { ips = value.split(',').map(ip => ip.trim()).filter(Boolean); }
  ips = [...new Set(ips)];

  const save = async (next: string[], notice: string) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await adminApi.updateSystemSetting('trusted_ips', JSON.stringify(next));
      if (result.success === false) throw new Error(result.message || 'Could not save trusted IPs.');
      await onSaved();
      setAddress('');
      setMessage(notice);
    } catch (e) { setError(getApiError(e, 'Could not save trusted IPs.')); }
    finally { setSaving(false); }
  };

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const ip = address.trim();
    if (!ip) return;
    if (ips.includes(ip)) { setError('This IP address is already trusted.'); return; }
    void save([...ips, ip], 'Trusted IP added.');
  };

  return (
    <section className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6" aria-labelledby="trusted-ips-title">
      <h3 id="trusted-ips-title" className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4 text-[#168BFF]" /> Trusted IPs
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Logins from these addresses are recorded without triggering IP risk alerts. This list does not restrict login access. Removing an address restores normal risk checks for future logins.</p>
      <form onSubmit={add} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-48">
          <label htmlFor="trusted-ip-address" className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">IPv4 or IPv6 address</label>
          <input id="trusted-ip-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="91.73.15.62" disabled={saving} autoComplete="off" className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30" />
        </div>
        <button type="submit" disabled={saving || !address.trim()} className="px-4 py-2.5 rounded-xl bg-[#07182F] text-white text-sm font-bold disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" aria-label="Saving" /> : 'Add trusted IP'}</button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
      {ips.length === 0 ? <p className="mt-4 text-xs text-gray-500">No trusted IPs added. Enter an office IP above to trust it.</p> : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-white/10">
          {ips.map(ip => <li key={ip} className="flex items-center justify-between gap-3 py-3">
            <span className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">{ip}</span>
            <button type="button" disabled={saving} aria-label={`Remove trusted IP ${ip}`} onClick={() => void save(ips.filter(item => item !== ip), 'Trusted IP removed.')} className="text-sm font-bold text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50">Remove</button>
          </li>)}
        </ul>
      )}
    </section>
  );
};
