/**
 * "Latest from the blog" strip for the homepage.
 * Renders nothing while there are zero posts — clean no-op until writers
 * publish their first articles.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { blogPosts } from '../loader';
import { PostCard } from './PostCard';

export const BlogStrip: React.FC = () => {
  const latest = blogPosts.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-white dark:bg-[#0C1322] border-t border-[#E4EAF2] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5" />
              eBizEarn Blog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Latest from the blog
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Practical guides on how social-media tasks, rewards, and payouts work — no hype, just how it is.
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#168BFF] border border-[#168BFF]/30 hover:bg-[#168BFF]/10 transition-all"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-brand shadow-lg"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
