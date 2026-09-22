import React, { useEffect, useMemo, useState } from 'react';
import { Search, Compass, Zap, AlertCircle } from 'lucide-react';
import { tasksApi, getApiError } from '../../api';
import { mapTaskForUi } from '../../utils/apiMappers';
import type { UiTask } from '../../types';
import { TaskCard } from '../../components/task/TaskCard';
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

const PLATFORMS = ['All platforms', 'Instagram', 'TikTok', 'Facebook', 'YouTube', 'Google Reviews', 'Trustpilot', 'WhatsApp', 'LinkedIn'];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'reward_desc', label: 'Highest reward' },
  { value: 'reward_asc', label: 'Lowest reward' },
  { value: 'time_asc', label: 'Quickest' },
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

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 ${isFeed ? 'bg-[#7357FF]' : 'bg-[#168BFF]'}`}>
          {isFeed ? <Zap className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#101828]">
            {isFeed ? 'Task Feed' : 'Available Tasks'}
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {isFeed
              ? 'A live stream of open tasks across platforms.'
              : 'Open tasks from verified businesses. Complete the real action, then submit proof.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E7ECF3] p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
            placeholder="Search tasks or companies…"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#168BFF]"
            aria-label="Filter by task type"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#168BFF]"
            aria-label="Filter by platform"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#168BFF]"
            aria-label="Sort tasks"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className={isFeed ? 'space-y-2.5' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E7ECF3] p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchTasks}
            className="mt-3 px-5 py-2 rounded-xl bg-[#07182F] text-white text-xs font-bold hover:bg-[#168BFF] transition-colors"
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
          onAction={() => {
            setSearch('');
            setCategory('');
            setPlatform('All platforms');
            fetchTasks();
          }}
        />
      ) : isFeed ? (
        <div className="space-y-2.5">
          {visible.map((task) => (
            <TaskCard key={task.uuid || task.id} task={task} compact />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((task) => (
            <TaskCard key={task.uuid || task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
