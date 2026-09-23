/**
 * /blog/:slug — post page: hero, table of contents (h2 blocks), article body,
 * FAQ accordion (faq blocks), author box, related posts, share buttons,
 * prev/next nav. Article + FAQPage JSON-LD injected by RouteSeo.
 * Unknown slugs render a graceful "article not found" state.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, ListTree, User, FileSearch } from 'lucide-react';
import {
  getPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  formatBlogDate,
  blockAnchorId,
} from '../../blog/loader';
import { BlockRenderer } from '../../blog/components/BlockRenderer';
import { PostCard } from '../../blog/components/PostCard';
import { ShareButtons } from '../../blog/components/ShareButtons';
import { categoryStyle } from '../../blog/components/categoryStyles';
import type { BlogPost } from '../../blog/types';

function NotFound(): React.ReactElement {
  return (
    <div className="max-w-2xl mx-auto text-center py-20 sm:py-28">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
        <FileSearch className="w-8 h-8 text-[#168BFF]" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
        Article not found
      </h1>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        This article doesn&apos;t exist or may have been moved. Browse the blog
        for other guides.
      </p>
      <Link
        to="/blog"
        className="mt-8 inline-flex items-center gap-2 px-7 py-3 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-xl hover:scale-105 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to the blog
      </Link>
    </div>
  );
}

function ReadingProgress(): React.ReactElement {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = (): void => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(1, el.scrollTop / total) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent" aria-hidden>
      <div
        className="h-full bg-gradient-brand transition-[width] duration-100"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

function TableOfContents({ post }: { post: BlogPost }): React.ReactElement | null {
  const headings = useMemo(
    () =>
      post.content
        .filter((b) => b.type === 'h2')
        .map((b) => ({ text: b.type === 'h2' ? b.text : '', id: blockAnchorId(b.type === 'h2' ? b.text : '') })),
    [post]
  );
  if (headings.length < 2) return null;
  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 p-6 shadow-sm"
    >
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-4">
        <ListTree className="w-4 h-4 text-[#168BFF]" />
        In this article
      </p>
      <ol className="space-y-2.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#168BFF] transition-colors leading-snug"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NotFound />
        </div>
      </div>
    );
  }

  const style = categoryStyle(post.category);
  const related = getRelatedPosts(post);
  const { prev, next } = getAdjacentPosts(post);
  const updated = post.updatedAt !== post.publishedAt;

  return (
    <div className="pt-24 pb-16 sm:pb-20">
      <ReadingProgress />
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + breadcrumb */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#168BFF] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All articles
        </Link>

        {/* Hero */}
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${style.badge}`}>
              {post.category}
            </span>
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[11px] font-bold text-gray-500 dark:text-gray-400"
              >
                #{t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100">
            {post.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-brand text-white flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{post.author}</span>
            </span>
            <span aria-hidden>·</span>
            <span>Published {formatBlogDate(post.publishedAt)}</span>
            {updated && (
              <>
                <span aria-hidden>·</span>
                <span>Updated {formatBlogDate(post.updatedAt)}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingMinutes} min read
            </span>
          </div>
        </header>

        {/* Hero image or premium gradient hero */}
        <div className="mt-8 rounded-3xl overflow-hidden border border-[#E4EAF2] dark:border-white/10 shadow-lg">
          {post.heroImage ? (
            <img src={post.heroImage} alt={post.title} className="w-full max-h-[420px] object-cover" />
          ) : (
            <div className={`relative bg-gradient-to-br ${style.gradient} px-8 py-14 sm:py-20`}>
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-black/25 blur-3xl" />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="inline-block rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-8 py-6">
                  <p className="text-white/95 text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                    {post.title}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body + TOC */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div className="max-w-3xl">
            <BlockRenderer blocks={post.content} />

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-[#E4EAF2] dark:border-white/10">
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-4">
                Share this article
              </p>
              <ShareButtons title={post.title} path={`/blog/${post.slug}`} />
            </div>

            {/* Author box */}
            <div className="mt-8 rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 p-6 flex items-start gap-4 shadow-sm">
              <span className="w-12 h-12 shrink-0 rounded-full bg-gradient-brand text-white flex items-center justify-center">
                <User className="w-6 h-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  {post.author}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Writing for the eBizEarn blog — practical guides on social-media
                  tasks, rewards, and staying safe online.
                </p>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <TableOfContents post={post} />
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16" aria-label="Related articles">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
              Related articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* Prev / next */}
        {(prev || next) && (
          <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Article navigation">
            {prev ? (
              <Link
                to={`/blog/${prev.slug}`}
                className="group rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 p-5 hover:shadow-lg transition-all"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Newer article
                </span>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#168BFF] transition-colors line-clamp-2">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={`/blog/${next.slug}`}
                className="group rounded-2xl bg-white dark:bg-[#0C1322] border border-[#E4EAF2] dark:border-white/10 p-5 text-right hover:shadow-lg transition-all"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Older article
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#168BFF] transition-colors line-clamp-2">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </article>
    </div>
  );
};
