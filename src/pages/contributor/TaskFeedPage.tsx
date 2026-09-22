import React, { useEffect, useMemo, useState } from 'react';
import { Search, Compass, Zap, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { mapTaskForUi } from '../../utils/apiMappers';
import type { UiTask } from '../../types';
import { TaskCard, PlatformMark } from '../../components/task/TaskCard';
import { EmptyState } from '../../components/common/EmptyState';

const CATEGORIES = [
  { slug: '', name: 'All types' },
  { slug: 'social', name: 'Social' },
  { slug: 'survey', name: 'Surveys' },
  { slug: 'app-testing', name: 'App testing' },
  { slug: 'website-testing', name: 'Web testing' },
  { slug: 'ugc', name: 'UGC & video' },
  { slug: 'content', name: 'Content' },
  { slug: 'research', name: 'Research' },
  { slug: 'feedback', name: 'Feedback' },
];

const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'Google Reviews', 'Trustpilot', 'WhatsApp', 'LinkedIn'];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'reward_desc', label: 'Highest reward' },
  { value: 'reward_asc', label: 'Lowest reward' },
  { value: 'time_asc', label: 'Quickest first' },
];

interface TaskFeedPageProps {
  /** 'cards' = Available Tasks grid; 'feed' = compact Task Feed stream. */
  variant?: 'cards' | 'feed';
}

export const TaskFeedPage: React.FC<TaskFeedPageProps> = ({ variant = 'cards' }) => {
  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('All platforms');
  const [sort, setSort] = useState('newest');

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.list({
        ...(category ? { category } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        sort,
        per_page: 48,
      });
      if (res.success) {
        setTasks(res.data.map(mapTaskForUi));
      } else {
        setError('Could not load tasks. Please try again.');
      }
    } catch (err) {
      setError(getApiError(err, 'Could not load tasks. Please check your connection.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  const visible = useMemo(
    () => (platform === 'All platforms' ? tasks : tasks.filter((t) => t.platform === platform)),
    [tasks, platform]
  );

  const isFeed = variant === 'feed';
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPlatform('All platforms');
    fetchTasks();
  };

  const selectClass =
    'min-h-[48px] text-sm font-bold text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0C1322] border-2 border-slate-200 dark:border-white/10 rounded-2xl px-4 focus:outline-none focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/10 transition-all cursor-pointer';

  return (
    <div className="space-y-5 text-left">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${isFeed ? 'bg-gradient-to-br from-[#7357FF] to-[#9D7BFF] shadow-violet-500/25' : 'bg-gradient-to-br from-[#168BFF] to-[#20C4E8] shadow-blue-500/25'}`}>
          {isFeed ? <Zap className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-[#101828] dark:text-gray-100">
            {isFeed ? 'Task Feed' : 'Available Tasks'}
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            {isFeed
              ? 'A live stream of open tasks across platforms.'
              : 'Open tasks from verified businesses. Complete the real action, then submit proof.'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 card-shadow p-4 sm:p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
            placeholder="Search tasks or companies…"
            aria-label="Search tasks"
            className="w-full min-h-[52px] pl-12 pr-12 py-3 text-base bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/10 focus:bg-white dark:focus:bg-[#0C1322] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={clearFilters}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-400 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Platform pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Filter by platform">
          {['All platforms', ...PLATFORMS].map((p) => {
            const active = platform === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                aria-pressed={active}
                className={`shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border-2 text-sm font-bold transition-all ${
                  active
                    ? 'bg-[#07182F] border-[#07182F] text-white shadow-md'
                    : 'bg-white dark:bg-[#0C1322] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {p !== 'All platforms' && <PlatformMark platform={p} className="w-4 h-4" />}
                <span>{p === 'All platforms' ? 'All' : p}</span>
              </button>
            );
          })}
        </div>

        {/* Category + sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-gray-400 sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            <span className="sm:sr-only">Filters</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${selectClass} flex-1`}
            aria-label="Filter by task type"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`${selectClass} flex-1`}
            aria-label="Sort tasks"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 px-1">
          {visible.length} {visible.length === 1 ? 'task' : 'tasks'} available
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className={isFeed ? 'space-y-3' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0C1322] rounded-[1.5rem] border border-[#E7ECF3] dark:border-white/10 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[52px] h-[52px] bg-slate-100 dark:bg-white/10 rounded-2xl" />
                <div className="flex-1">
                  <div className="h-3.5 bg-slate-100 dark:bg-white/10 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-100 dark:bg-white/10 rounded w-1/2" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-5/6 mb-4" />
              <div className="h-[52px] bg-slate-100 dark:bg-white/10 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchTasks}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#07182F] text-white text-sm font-bold hover:bg-[#168BFF] transition-colors min-h-[48px]"
          >
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="No tasks right now"
          description="There are no open tasks matching your filters. New tasks from verified businesses appear here as soon as they're published — check back soon."
          icon={isFeed ? Zap : Compass}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : isFeed ? (
        <div className="space-y-3">
          {visible.map((task) => (
            <TaskCard key={task.uuid || task.id} task={task} compact />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((task) => (
            <TaskCard key={task.uuid || task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
