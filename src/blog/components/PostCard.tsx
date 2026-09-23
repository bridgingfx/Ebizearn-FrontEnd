/**
 * Premium post card: gradient/glass hero when no heroImage, real image otherwise.
 * Never renders a broken image — heroImage is only used when present.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '../types';
import { formatBlogDate } from '../loader';
import { categoryStyle } from './categoryStyles';

interface Props {
  post: BlogPost;
  large?: boolean;
}

export const PostCard: React.FC<Props> = ({ post, large = false }) => {
  const style = categoryStyle(post.category);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        large ? 'sm:col-span-2 sm:flex-row' : ''
      }`}
    >
      {/* Hero visual */}
      <div
        className={`relative overflow-hidden ${large ? 'h-52 sm:h-auto sm:w-1/2 sm:min-h-[260px]' : 'h-44'}`}
      >
        {post.heroImage ? (
          <img
            src={post.heroImage}
            alt={post.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}>
            {/* glass panel accents — flat, no dot/grid patterns */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-black/20 blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 max-w-xs text-center">
                <p className="text-white/90 text-sm font-bold leading-snug line-clamp-3">
                  {post.title}
                </p>
              </div>
            </div>
          </div>
        )}
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${style.badge}`}
        >
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col p-6 ${large ? 'sm:w-1/2' : ''}`}>
        <h3
          className={`font-extrabold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-[#168BFF] transition-colors ${
            large ? 'text-xl sm:text-2xl' : 'text-base'
          }`}
        >
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{post.author}</span>
            <span aria-hidden>·</span>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingMinutes} min
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#168BFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
