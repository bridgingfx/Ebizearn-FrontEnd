import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { FraudEvent } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Fraud alerts come only from GET /admin/fraud-alerts. No demo alerts, no
 * fabricated severity counts, no invented incident values.
 */
export const AdminFraudPage: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severity, setSeverity] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.fraudAlerts();
      if (res.success) {
        setAlerts(res.data || []);
      } else {
        setError(res.message || 'Could not load fraud alerts.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load fraud alerts.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (severity === 'all') return alerts;
    return alerts.filter((a) => a.severity === severity);
  }, [alerts, severity]);

  const riskStyle = (sev?: string) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fraud &amp; Risk</h1>
        <p className="text-sm text-gray-500 mt-1">
          Alerts raised by the platform fraud service. {alerts.length} open alert{alerts.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeverity(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              severity === s ? 'bg-[#07182F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading fraud alerts…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load fraud alerts</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={ShieldAlert}
          title={alerts.length === 0 ? 'No open fraud alerts' : 'No alerts at this severity'}
          description={
            alerts.length === 0
              ? 'The fraud service has not raised any alerts. New alerts will appear here automatically.'
              : 'Try a different severity filter.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 w-fit">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${riskStyle(a.severity)}`}
                  >
                    {a.severity} severity
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {a.status ? `· ${a.status.replace(/_/g, ' ')} ` : ''}· {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {a.event_type ? a.event_type.replace(/_/g, ' ') : `Alert #${a.id}`}
                </p>
                {a.details_json && (
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 font-mono">
                    {JSON.stringify(a.details_json)}
                  </p>
                )}
              </div>
              {a.user_id != null && (
                <Link
                  to={`/admin/users?search=${a.user_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors shrink-0"
                >
                  View user <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
