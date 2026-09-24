import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Database, Server, HardDrive, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { adminApi, getApiError } from '../../api';

interface HealthData {
  status?: string;
  database?: string;
  cache?: string;
  queue?: string;
  storage?: string;
  server_time?: string;
  php_version?: string;
  laravel_version?: string;
}

/**
 * System health. Renders only what GET /admin/health returns (status,
 * database, cache, queue, storage, server time, versions). No fabricated
 * CPU/memory gauges, service grids, or log streams.
 */
export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.health();
      if ((res as { success?: boolean }).success !== false) {
        setHealth((res as { data?: HealthData }).data ?? null);
      } else {
        setError((res as { message?: string }).message || 'Could not load system health.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load system health.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = [
    { icon: Activity, label: 'Overall status', value: health?.status },
    { icon: Database, label: 'Database', value: health?.database },
    { icon: Server, label: 'Cache', value: health?.cache },
    { icon: HardDrive, label: 'Storage', value: health?.storage },
    { icon: Activity, label: 'Queue', value: health?.queue },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">System Health</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live service status from the backend health endpoint.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Checking system health…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-300 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-300">Could not load system health</p>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && health && (
        <>
          <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">API status</p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100 capitalize">{health.status || 'unknown'}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <r.icon className="w-4 h-4 text-gray-400 dark:text-gray-500" /> {r.label}
                  </span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100 capitalize">{r.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0C1322] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs p-6">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-3">Server info</h3>
            <dl className="text-xs space-y-2">
              {[
                ['Server time', health.server_time ? new Date(health.server_time).toLocaleString() : '—'],
                ['PHP version', health.php_version || '—'],
                ['Laravel version', health.laravel_version || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="font-bold text-gray-900 dark:text-gray-100 font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Infrastructure metrics (CPU, memory, uptime graphs) need a monitoring backend that is not
            available yet — this page only reports what the API health endpoint returns.
          </p>
        </>
      )}
    </div>
  );
};
