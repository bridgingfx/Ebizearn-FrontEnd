import React, { useCallback, useEffect, useState } from 'react';
import {
  Eye,
  Users,
  Globe,
  Activity,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileText,
  UserPlus,
} from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { StatCard, SectionHeader } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { countryName, countryFlag } from '../../utils/countries';

interface TrafficData {
  range: { from: string; to: string };
  totals: {
    views: number;
    visitors: number;
    today_views: number;
    today_visitors: number;
    yesterday_views: number;
    yesterday_visitors: number;
    live_now: number;
  };
  per_day: Array<{ day: string; views: number; visitors: number }>;
  top_pages: Array<{ path: string; views: number; visitors: number }>;
  top_countries: Array<{ country_code: string; views: number; visitors: number }>;
  recent_signups: Array<{ id: number; name: string; email: string; role: string; country_code?: string; created_at: string }>;
}

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

function rangeDates(key: RangeKey, customFrom: string, customTo: string): { from: string; to: string } {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  switch (key) {
    case 'today':
      return { from: fmt(today), to: fmt(today) };
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { from: fmt(y), to: fmt(y) };
    }
    case '30d': {
      const f = new Date(today); f.setDate(f.getDate() - 29);
      return { from: fmt(f), to: fmt(today) };
    }
    case 'custom':
      return { from: customFrom, to: customTo };
    case '7d':
    default: {
      const f = new Date(today); f.setDate(f.getDate() - 6);
      return { from: fmt(f), to: fmt(today) };
    }
  }
}

export const AdminTrafficPage: React.FC = () => {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = rangeDates(range, customFrom, customTo);
      const res = await adminApi.traffic({ from, to });
      if (res.success) setData(res.data);
      else setError(res.message || 'Could not load traffic data.');
    } catch (e) {
      setError(getApiError(e, 'Could not load traffic data.'));
    } finally {
      setLoading(false);
    }
  }, [range, customFrom, customTo]);

  useEffect(() => { void load(); }, [load]);

  // Auto-refresh live count every 30s
  useEffect(() => {
    const t = setInterval(() => { void load(); }, 30000);
    return () => clearInterval(t);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading traffic analytics…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-[1.5rem] p-6">
        <p className="font-bold text-red-700 dark:text-red-300 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Could not load traffic</p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-2 text-sm font-bold underline">Retry</button>
      </div>
    );
  }

  const t = data?.totals;
  const maxViews = Math.max(...(data?.per_day.map((d) => d.views) || [1]), 1);

  const rangeBtn = (key: RangeKey, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setRange(key)}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
        range === key
          ? 'bg-[#168BFF] text-white shadow'
          : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header + range filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#168BFF]" /> Website Traffic
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Who visits, where they're from, what they view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rangeBtn('today', 'Today')}
          {rangeBtn('yesterday', 'Yesterday')}
          {rangeBtn('7d', '7 days')}
          {rangeBtn('30d', '30 days')}
          {rangeBtn('custom', 'Custom')}
        </div>
      </div>

      {range === 'custom' && (
        <div className="flex items-center gap-2 bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 rounded-2xl p-4">
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm" />
          <span className="text-sm text-gray-400">to</span>
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm" />
          <button type="button" onClick={() => void load()} className="px-4 py-2 rounded-xl bg-[#168BFF] text-white text-sm font-bold">Apply</button>
        </div>
      )}

      {/* Live + headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <p className="text-xs font-black uppercase tracking-wider">Live now</p>
          </div>
          <p className="mt-2 text-4xl font-black">{t?.live_now ?? '—'}</p>
          <p className="text-xs text-emerald-100 mt-1">people on the site right now</p>
        </div>
        <StatCard label="Visitors today" value={String(t?.today_visitors ?? '—')} icon={Users} gradient="from-[#168BFF] to-[#20C4E8]" shadow="shadow-lg shadow-blue-500/25" />
        <StatCard label="Page views today" value={String(t?.today_views ?? '—')} icon={Eye} gradient="from-[#7257FF] to-[#9D7BFF]" shadow="shadow-lg shadow-violet-500/25" />
        <StatCard label="Visitors (range)" value={String(t?.visitors ?? '—')} icon={TrendingUp} gradient="from-amber-500 to-orange-600" shadow="shadow-lg shadow-amber-500/25" />
      </div>

      {/* Daily chart */}
      <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6">
        <SectionHeader title="Traffic over time" subtitle={`${data?.range.from} → ${data?.range.to}`} />
        {!data?.per_day.length ? (
          <EmptyState icon={Activity} title="No traffic yet" description="Page views will appear here once tracking is live." />
        ) : (
          <div className="flex items-end gap-1.5 h-40 mt-4">
            {data.per_day.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">{d.visitors}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#168BFF] to-[#20C4E8] hover:from-[#7257FF] hover:to-[#9D7BFF] transition-all"
                  style={{ height: `${Math.max(3, Math.round((d.views / maxViews) * 100))}%`, minHeight: 3 }}
                  title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                />
                <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top pages */}
        <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6">
          <SectionHeader title="Most visited pages" subtitle="Top pages in this range" />
          {!data?.top_pages.length ? (
            <EmptyState icon={FileText} title="No data" description="No page views recorded yet." />
          ) : (
            <div className="space-y-2">
              {data.top_pages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3 px-4 py-2.5 bg-[#F8FAFD] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
                  <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{p.path}</p>
                    <p className="text-[11px] text-gray-400">{p.visitors} visitors · {p.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top countries */}
        <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6">
          <SectionHeader title="Where visitors come from" subtitle="Top countries in this range" />
          {!data?.top_countries.length ? (
            <EmptyState icon={Globe} title="No country data" description="Country lookup activates once traffic flows." />
          ) : (
            <div className="space-y-2">
              {data.top_countries.map((c, i) => (
                <div key={c.country_code} className="flex items-center gap-3 px-4 py-2.5 bg-[#F8FAFD] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
                  <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                  <span className="text-2xl">{countryFlag(c.country_code)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{countryName(c.country_code)}</p>
                    <p className="text-[11px] text-gray-400">{c.visitors} visitors · {c.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent signups with country */}
      <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-6">
        <SectionHeader title="Recent signups" subtitle="Newest members and where they joined from" />
        {!data?.recent_signups.length ? (
          <EmptyState icon={UserPlus} title="No signups" description="New members will appear here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recent_signups.map((u) => (
              <div key={u.id} className="px-4 py-3 bg-[#F8FAFD] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
                <p className="text-sm font-bold truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1 text-xs">
                    <span className="text-base">{countryFlag(u.country_code)}</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{countryName(u.country_code)}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
