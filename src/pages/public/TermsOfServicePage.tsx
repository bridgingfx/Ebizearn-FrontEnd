import React from 'react';
import { Download } from 'lucide-react';
import { LegalShell, LegalSection } from '../../components/common/LegalShell';
import {
  TERMS_SECTIONS,
  TERMS_UPDATED,
  TERMS_VERSION,
  type LegalBlock,
} from '../../legal/terms';

/**
 * Full Terms of Service — real route /terms.
 * Renders from src/legal/terms.ts (single source of truth), which is also
 * what scripts/generate-terms-pdf.ts turns into the downloadable PDF —
 * the page and the PDF can never drift apart.
 */
const renderBlock = (block: LegalBlock, i: number) => {
  if (block.type === 'list') {
    return (
      <ul key={i} className="list-disc pl-5 space-y-1.5">
        {(block.items ?? []).map((item, j) => (
          <li key={j}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p key={i}>{block.text}</p>;
};

export const TermsOfServicePage: React.FC = () => {
  return (
    <LegalShell
      doc="terms"
      badge="Terms of Service"
      title="Terms of Service"
      tagline="The rules that govern your use of eBizEarn — for contributors, businesses, and visitors."
      updated={`${TERMS_UPDATED} · v${TERMS_VERSION}`}
    >
      {/* Download the exact same text as a PDF */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#07182F]/[0.03] dark:bg-white/5 border border-[#E4EAF2] dark:border-white/10">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
          Prefer to keep a copy? Download the full Terms of Service as a PDF — identical text,
          version <span className="font-bold">v{TERMS_VERSION}</span>.
        </p>
        <a
          href="/legal/terms-and-conditions.pdf"
          download="eBizEarn-Terms-of-Service.pdf"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[#07182F] hover:bg-[#0D2342] dark:bg-white dark:text-[#07182F] dark:hover:bg-gray-200 text-white text-sm font-bold transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {TERMS_SECTIONS.map((section) => (
        <LegalSection key={section.n} n={section.n} title={section.title}>
          {section.blocks.map(renderBlock)}
        </LegalSection>
      ))}
    </LegalShell>
  );
};
