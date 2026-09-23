/**
 * Renders a post's ContentBlock[] — the article body renderer.
 * h2 blocks get anchor ids for the table of contents; faq blocks render
 * as accordions (the same Q&A feed the FAQPage JSON-LD schema).
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Quote, Lightbulb, ArrowRight, CircleCheck } from 'lucide-react';
import type { ContentBlock } from '../types';
import { blockAnchorId } from '../loader';

/**
 * Renders inline markdown links inside paragraph-level text:
 * `[label](/internal-path)` -> react-router Link,
 * `[label](https://external)` -> external anchor.
 * Purely additive: no existing post content uses []() syntax,
 * so this only activates where writers add it.
 */
function renderInlineLinks(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (!m) return <React.Fragment key={i}>{part}</React.Fragment>;
    const [, label, href] = m;
    const cls =
      'font-semibold text-[#168BFF] underline decoration-[#168BFF]/40 underline-offset-2 hover:decoration-[#168BFF]';
    if (href.startsWith('/')) {
      return (
        <Link key={i} to={href} className={cls}>
          {label}
        </Link>
      );
    }
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer nofollow" className={cls}>
        {label}
      </a>
    );
  });
}

function FaqAccordion({ items }: { items: { q: string; a: string }[] }): React.ReactElement {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-white/5 rounded-2xl border border-[#E4EAF2] dark:border-white/10 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-[#168BFF] transition-colors"
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/10">
                {renderInlineLinks(faq.a)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const BlockRenderer: React.FC<{ blocks: ContentBlock[] }> = ({ blocks }) => {
  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'intro':
            return (
              <p
                key={idx}
                className="text-lg sm:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium"
              >
                {renderInlineLinks(block.text)}
              </p>
            );
          case 'h2':
            return (
              <h2
                key={idx}
                id={blockAnchorId(block.text)}
                className="scroll-mt-28 pt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
              >
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="pt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {block.text}
              </h3>
            );
          case 'p':
            return (
              <p key={idx} className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                {renderInlineLinks(block.text)}
              </p>
            );
          case 'list':
            return (
              <ul key={idx} className="space-y-2.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    <CircleCheck className="w-5 h-5 shrink-0 text-[#16B364] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case 'steps':
            return (
              <ol key={idx} className="space-y-3">
                {block.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 bg-white dark:bg-white/5 border border-[#E4EAF2] dark:border-white/10 rounded-2xl p-4 shadow-sm"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-brand text-white text-sm font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote
                key={idx}
                className="relative rounded-2xl border-l-4 border-[#168BFF] bg-blue-50/60 dark:bg-blue-500/10 px-6 py-5"
              >
                <Quote className="w-6 h-6 text-[#168BFF] mb-2" />
                <p className="text-[15px] italic leading-relaxed text-gray-700 dark:text-gray-300">
                  {renderInlineLinks(block.text)}
                </p>
                {block.cite && (
                  <cite className="block mt-2 text-xs font-semibold not-italic text-gray-500 dark:text-gray-400">
                    — {block.cite}
                  </cite>
                )}
              </blockquote>
            );
          case 'callout':
            return (
              <div
                key={idx}
                className="rounded-2xl border border-amber-200/70 dark:border-amber-400/20 bg-amber-50/70 dark:bg-amber-400/10 px-6 py-5 flex gap-4"
              >
                <Lightbulb className="w-6 h-6 shrink-0 text-[#F79009]" />
                <div>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                    {block.title}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {renderInlineLinks(block.text)}
                  </p>
                </div>
              </div>
            );
          case 'faq':
            return <FaqAccordion key={idx} items={block.items} />;
          case 'cta':
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl bg-[#07182F] text-white px-6 py-8 sm:px-8 text-center"
              >
                <div className="relative z-10 space-y-3">
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    {block.heading}
                  </h3>
                  <p className="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
                    {block.text}
                  </p>
                  <div className="pt-1">
                    <Link
                      to={block.buttonHref}
                      className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-xl hover:scale-105 transition-all"
                    >
                      {block.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
