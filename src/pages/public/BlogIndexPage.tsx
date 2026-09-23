/**
 * /blog — index: featured post hero, category filter pills, tag filter,
 * search box, post cards grid, graceful empty state when zero posts exist.
 * Blog JSON-LD is injected by RouteSeo via SEO_BY_PATH['/blog'].
 */
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Newspaper, ArrowRight, Clock, Tag } from 'lucide-react';
import {
  blogPosts,
  getFeaturedPost,
  getAllCategories,
  getAllTags,
  formatBlogDate,
} from '../../blog/loader';
import { PostCard } from '../../blog/components/PostCard';
import { categoryStyle } from '../../blog/components/categoryStyles';
import type { BlogPost } from '../../blog/types';

function EmptyState(): React.ReactElement {
  return (
    <div className="max-w-2xl mx-auto text-center py-16 sm:py-24">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
        <Newspaper className="w-8 h-8 text-[#168BFF]" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
        Articles are on the way
      </h2>
      <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
        Our writers are preparing practical guides on social-media tasks, rewards,
        and payouts. Check back soon — or start exploring the platform in the meantime.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/how-it-works"
          className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-xl hover:scale-105 transition-all"
        >
          How it works
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/faq"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-[#168BFF] border border-[#168BFF]/30 hover:bg-[#168BFF]/10 transition-all"
        >
          Read the FAQ
        </Link>
      </div>
    </div>
  );
}

function FeaturedHero({ post }: { post: BlogPost }): React.ReactElement {
  const style = categoryStyle(post.category);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-[#E4EAF2] dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className={`relative bg-gradient-to-br ${style.gradient} px-6 py-12 sm:px-12 sm:py-16`}>
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-black/25 blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
              Featured
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${style.badge}`}
            >
              {post.category}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight group-hover:underline decoration-2 underline-offset-4">
            {post.title}
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/70 pt-1">
            <span className="font-semibold text-white">{post.author}</span>
            <span aria-hidden>·</span>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingMinutes} min read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export const BlogIndexPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const categories = useMemo(() => getAllCategories(), []);
  const tags = useMemo(() => getAllTags(), []);
  const featured = useMemo(() => getFeaturedPost(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts.filter((p) => {
      if (featured && p.slug === featured.slug) return false;
      if (category && p.category !== category) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (q) {
        const hay = `${p.title} ${p.excerpt} ${p.tags.join(' ')} ${p.author}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, category, tag, featured]);

  const hasFilters = query.trim() !== '' || category !== null || tag !== null;

  return (
    <div className="pt-24 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Newspaper className="w-3.5 h-3.5" />
            eBizEarn Blog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Guides, explained honestly
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            How social-media tasks work, how rewards and payouts work, and how to
            stay safe — written plainly, without hype.
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured && <FeaturedHero post={featured} />}

            {/* Search + filters */}
            <div className="mt-10 space-y-4">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/40 focus:border-[#168BFF] transition-all"
                  aria-label="Search articles"
                />
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                  <button
                    type="button"
                    onClick={() => setCategory(null)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      category === null
                        ? 'bg-[#07182F] dark:bg-white text-white dark:text-[#07182F]'
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-[#E4EAF2] dark:border-white/10 hover:border-[#168BFF]/50'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(category === c ? null : c)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        category === c
                          ? 'bg-[#07182F] dark:bg-white text-white dark:text-[#07182F]'
                          : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-[#E4EAF2] dark:border-white/10 hover:border-[#168BFF]/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2" aria-label="Filter by tag">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  {tags.slice(0, 12).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(tag === t ? null : t)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        tag === t
                          ? 'bg-[#168BFF] text-white'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="mt-8 text-center py-16 rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  No articles match your filters
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Try a different search term or clear the filters.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setCategory(null);
                      setTag(null);
                    }}
                    className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-[#168BFF] border border-[#168BFF]/30 hover:bg-[#168BFF]/10 transition-all"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
