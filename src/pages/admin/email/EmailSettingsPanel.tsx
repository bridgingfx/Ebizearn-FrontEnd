import React, { useEffect, useState } from 'react';
import { emailApi, getApiError } from '../../../api';
import type { EmailLog } from '../../../api';
import { ProviderManager } from './ProviderManager';
import { TemplateEditor } from './TemplateEditor';

const STATUS_STYLES: Record<EmailLog['status'], string> = {
  sent: 'bg-emerald-50 text-emerald-700',
  logged: 'bg-blue-50 text-blue-700',
  skipped: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
};

const EmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    emailApi.logs().then((res) => setLogs(res.data)).catch((err) => setError(getApiError(err, 'Could not load logs.')));
  }, []);

  if (error) return <p className="text-xs text-red-600">{error}</p>;
  if (!logs) return <p className="text-xs text-gray-500">Loading…</p>;
  if (logs.length === 0) return <p className="text-xs text-gray-500">No emails sent yet.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2.5">When</th>
            <th className="px-4 py-2.5">Event</th>
            <th className="px-4 py-2.5">To</th>
            <th className="px-4 py-2.5">Provider</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
              <td className="px-4 py-2.5 font-mono">{l.event_key}</td>
              <td className="px-4 py-2.5">{l.to_email}</td>
              <td className="px-4 py-2.5">{l.provider_name ?? '—'}</td>
              <td className="px-4 py-2.5">
                <span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                {l.error && <p className="text-[10px] text-red-600 mt-1 max-w-xs break-words">{l.error}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

type EmailTab = 'providers' | 'templates' | 'logs';

const TABS: { id: EmailTab; label: string }[] = [
  { id: 'providers', label: 'Providers' },
  { id: 'templates', label: 'Templates' },
  { id: 'logs', label: 'Delivery log' },
];

/** Super Admin → Email: providers, templates and delivery log, all backed by the Laravel API. */
export const EmailSettingsPanel: React.FC = () => {
  const [tab, setTab] = useState<EmailTab>('providers');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">Transactional Email</h3>
        <p className="text-xs text-gray-500">Configure the sending provider and the emails users receive.</p>
      </div>

      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${tab === t.id ? 'bg-[#07182F] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'providers' && <ProviderManager />}
      {tab === 'templates' && <TemplateEditor />}
      {tab === 'logs' && <EmailLogs />}
    </div>
  );
};
