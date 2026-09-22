import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Mail, Building2, User } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader, StatusBadge, LoadingBlock, ErrorBlock, Card } from '../../components/common/ui';

interface DemoRequest {
  id: number;
  name: string;
  email: string;
  company: string;
  message: string;
  status: string;
  created_at: string;
}

/**
 * Admin CRM — inbound "Request a demo" submissions from the public site
 * (GET /admin/demo-requests). Real rows only; empty state when none.
 */
export const AdminDemoRequestsPage: React.FC = () => {
  const [rows, setRows] = useState<DemoRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.demoRequests({ per_page: 50 });
      if (res.success) {
        setRows(res.data ?? []);
        setTotal(res.meta?.total ?? (res.data ?? []).length);
      } else {
        setLoadError(res.message || 'Could not load demo requests.');
      }
    } catch (e) {
      setLoadError(getApiError(e, 'Could not load demo requests.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Demo Requests" subtitle="Inbound demo requests from the public site." />
        <LoadingBlock label="Loading demo requests…" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Demo Requests" subtitle="Inbound demo requests from the public site." />
        <ErrorBlock message={loadError} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Requests"
        subtitle={`${total} request${total === 1 ? '' : 's'} received. Follow up directly by email.`}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No demo requests yet"
          description="When visitors submit the Request Demo form on the homepage, they will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#101828] dark:text-gray-100">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{r.name}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${r.email}`} className="text-[#168BFF] font-semibold hover:underline">
                        {r.email}
                      </a>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {r.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap border-t border-gray-100 dark:border-white/10 pt-3">
                {r.message}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
