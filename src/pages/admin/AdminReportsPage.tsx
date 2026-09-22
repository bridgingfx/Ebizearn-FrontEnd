import React, { useState } from 'react';
import { BarChart3, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { PageHeader, Card, CardHeader, fmtMoney } from '../../components/common/ui';

/**
 * Phase 11: real reports. CSV exports are generated client-side from live
 * admin list endpoints (users, payouts, audit log, verification queue) —
 * every row is real platform data, exported on demand.
 */

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(esc).join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}

function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface ReportDef {
  key: string;
  title: string;
  description: string;
  fetch: () => Promise<{ rows: Record<string, unknown>[]; filename: string }>;
}

const REPORTS: ReportDef[] = [
  {
    key: 'users',
    title: 'User directory',
    description: 'Every registered user: role, status, referral code, signup date.',
    fetch: async () => {
      const res = await adminApi.users();
      const users = (res.data ?? []) as { id: number; name: string; email: string; role: string; status: string; referral_code?: string; created_at?: string }[];
      return {
        filename: `ebizearn-users-${new Date().toISOString().slice(0, 10)}.csv`,
        rows: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, referral_code: u.referral_code ?? '', created_at: u.created_at ?? '' })),
      };
    },
  },
  {
    key: 'payouts',
    title: 'Withdrawal requests',
    description: 'All payout requests with amounts, fees, method and status.',
    fetch: async () => {
      const res = await adminApi.payouts();
      const items = (res.data ?? []) as { id: number; uuid: string; user_id: number; amount_cents: number; fee_cents: number; currency: string; payout_method: string; status: string; created_at: string; processed_at?: string }[];
      return {
        filename: `ebizearn-payouts-${new Date().toISOString().slice(0, 10)}.csv`,
        rows: items.map((p) => ({
          id: p.id, uuid: p.uuid, user_id: p.user_id,
          amount: fmtMoney(p.amount_cents), fee: fmtMoney(p.fee_cents),
          currency: p.currency, method: p.payout_method, status: p.status,
          created_at: p.created_at, processed_at: p.processed_at ?? '',
        })),
      };
    },
  },
  {
    key: 'audit',
    title: 'Audit log',
    description: 'Immutable record of admin/staff actions: who did what, when.',
    fetch: async () => {
      const res = await adminApi.auditLogs();
      const items = (res.data ?? []) as { id: number; actor_id?: number; action: string; entity_type: string; entity_id: number; ip_address?: string; created_at: string }[];
      return {
        filename: `ebizearn-audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
        rows: items.map((l) => ({ id: l.id, actor_id: l.actor_id ?? '', action: l.action, entity_type: l.entity_type, entity_id: l.entity_id, ip_address: l.ip_address ?? '', created_at: l.created_at })),
      };
    },
  },
  {
    key: 'queue',
    title: 'Verification queue snapshot',
    description: 'Submissions currently awaiting or under review, with AI flags.',
    fetch: async () => {
      const res = await adminApi.verificationQueue();
      const items = (res.data ?? []) as { id: number; task_id: number; user_id: number; status: string; verification_stage?: string; review_reason_code?: string; created_at: string }[];
      return {
        filename: `ebizearn-verification-queue-${new Date().toISOString().slice(0, 10)}.csv`,
        rows: items.map((s) => ({ id: s.id, task_id: s.task_id, user_id: s.user_id, status: s.status, stage: s.verification_stage ?? '', reason_code: s.review_reason_code ?? '', created_at: s.created_at })),
      };
    },
  },
];

export const AdminReportsPage: React.FC = () => {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doneKey, setDoneKey] = useState<string | null>(null);

  const run = async (def: ReportDef) => {
    setBusyKey(def.key);
    setError(null);
    setDoneKey(null);
    try {
      const { rows, filename } = await def.fetch();
      if (rows.length === 0) {
        setError(`"${def.title}" has no rows to export right now.`);
        return;
      }
      downloadCsv(filename, toCsv(rows));
      setDoneKey(def.key);
    } catch (e) {
      setError(getApiError(e, `Could not generate "${def.title}".`));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="On-demand CSV exports generated from live platform data. No cached figures — each export queries the current records."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((def) => (
          <Card key={def.key}>
            <div className="p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#07182F] text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{def.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{def.description}</p>
                <button
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => void run(def)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#07182F] hover:bg-[#168BFF] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {busyKey === def.key ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : doneKey === def.key ? (
                    <BarChart3 className="w-3.5 h-3.5" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {busyKey === def.key ? 'Generating…' : doneKey === def.key ? 'Exported' : 'Export CSV'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="About these reports" subtitle="How the numbers are produced" />
        <p className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Exports query the live API at the moment you click — there are no stored snapshots and no
          sample data. Money figures come from the immutable wallet ledger; the audit log is
          append-only. If a report has no rows, the platform simply has no such records yet.
        </p>
      </Card>
    </div>
  );
};
