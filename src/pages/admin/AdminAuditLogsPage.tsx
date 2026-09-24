import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollText, Search, Loader2, AlertCircle, Eye } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { AuditLog } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { auditEntityLink, auditModel, auditPage, humanizeAction, humanizeModel } from '../../utils/auditLabels';

/**
 * Audit logs. Rendered only from GET /admin/audit-logs — no demo records, no
 * fabricated "SHA-256 chain" or compliance claims.
 */
export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.auditLogs();
      if (res.success) {
        setLogs(res.data || []);
      } else {
        setError(res.message || 'Could not load audit logs.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load audit logs.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.entity_type || '').toLowerCase().includes(q) ||
        (l.entity_name || '').toLowerCase().includes(q) ||
        auditPage(l).label.toLowerCase().includes(q) ||
        (l.actor?.name || '').toLowerCase().includes(q),
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Immutable record of administrative actions.</p>
      </div>

      <div className="relative sm:w-72">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, entity, actor…"
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading audit logs…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-300 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load audit logs</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title={logs.length === 0 ? 'No audit records yet' : 'No records match your search'}
          description={
            logs.length === 0
              ? 'Administrative actions will be recorded here as they happen.'
              : 'Try a different search term.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Page</th>
                  <th className="py-3 px-4 font-bold">Record</th>
                  <th className="py-3 px-4 font-bold">Actor</th>
                  <th className="py-3 px-4 font-bold">When</th>
                  <th className="py-3 px-4 font-bold text-right">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/5">
                    <td className="py-3 px-4">
                      <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">{humanizeAction(l.action)}</span>
                      <span className="block text-[10px] font-mono text-gray-400 dark:text-gray-500">{l.action}</span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {(() => {
                        const page = auditPage(l);
                        return page.path ? (
                          <Link
                            to={page.path}
                            className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] dark:text-blue-300 font-bold text-[11px] hover:underline"
                          >
                            {page.label}
                          </Link>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold text-[11px]">
                            {page.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="block font-semibold text-gray-900 dark:text-gray-100">
                        {humanizeModel(auditModel(l))} <span className="font-mono text-gray-400 dark:text-gray-500">#{l.entity_id}</span>
                      </span>
                      {l.entity_name &&
                        (auditEntityLink(l)?.startsWith('/admin/users/') ? (
                          <Link to={auditEntityLink(l)!} className="text-[11px] text-[#168BFF] dark:text-blue-300 hover:underline">
                            {l.entity_name}
                          </Link>
                        ) : (
                          <span className="text-[11px]">{l.entity_name}</span>
                        ))}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{l.actor?.name || 'System'}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(l)}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#168BFF] hover:bg-blue-50 dark:bg-blue-500/10 transition-colors"
                        title="View before/after state"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-[#0C1322] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 font-mono">{selected.action}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {auditPage(selected).label} · {humanizeModel(auditModel(selected))} #{selected.entity_id}
                  {selected.entity_name ? ` (${selected.entity_name})` : ''} · {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Close
              </button>
            </div>
            {selected.before_state_json && (
              <div className="mb-3">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Before</p>
                <pre className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-[11px] font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(selected.before_state_json, null, 2)}
                </pre>
              </div>
            )}
            {selected.after_state_json && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">After</p>
                <pre className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-[11px] font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(selected.after_state_json, null, 2)}
                </pre>
              </div>
            )}
            {selected.ip_address && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-mono">IP: {selected.ip_address}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
