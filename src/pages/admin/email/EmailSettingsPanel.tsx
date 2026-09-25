import React, { useEffect, useState } from 'react';
import { emailApi, getApiError } from '../../../api';
import type { EmailLog } from '../../../api';
import { DeliverySettings } from './DeliverySettings';
import { EmailCampaigns } from './EmailCampaigns';
import { PageHeader } from '../../../components/common/ui';
import { TemplateEditor } from './TemplateEditor';

const STATUS_STYLES: Record<EmailLog['status'], string> = {
  sent: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  logged: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
  skipped: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
  failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300',
};

const EmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    emailApi.logs().then((res) => setLogs(res.data)).catch((err) => setError(getApiError(err, 'Could not load logs.')));
  }, []);

  if (error) return <p className="text-xs text-red-600 dark:text-red-400">{error}</p>;
  if (!logs) return <p className="text-xs text-gray-500 dark:text-gray-400">Loading…</p>;
  if (logs.length === 0) return <p className="text-xs text-gray-500 dark:text-gray-400">No emails sent yet.</p>;

  return (
    <div className="glass rounded-2xl overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase text-slate-500 dark:text-gray-400">
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
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 dark:text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
              <td className="px-4 py-2.5 font-mono">{l.event_key}</td>
              <td className="px-4 py-2.5">{l.to_email}</td>
              <td className="px-4 py-2.5">{l.provider_name ?? '—'}</td>
              <td className="px-4 py-2.5">
                <span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                {l.error && <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-xs break-words">{l.error}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

type EmailTab = 'delivery' | 'campaigns' | 'templates' | 'logs';

const TABS: { id: EmailTab; label: string }[] = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'templates', label: 'Templates' },
  { id: 'logs', label: 'Delivery log' },
];

/** Super Admin → Email & Campaigns: sending provider, marketing campaigns, templates and delivery log. */
export const EmailSettingsPanel: React.FC = () => {
  const [tab, setTab] = useState<EmailTab>('delivery');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email & Campaigns"
        subtitle="Choose how the platform sends email (Brevo, SMTP and more), send marketing campaigns and edit the emails users receive."
      />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${tab === t.id ? 'bg-[#07182F] dark:bg-[#168BFF] text-white' : 'bg-slate-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/15'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'delivery' && <DeliverySettings />}
      {tab === 'campaigns' && <EmailCampaigns />}
      {tab === 'templates' && <TemplateEditor />}
      {tab === 'logs' && <EmailLogs />}
    </div>
  );
};
