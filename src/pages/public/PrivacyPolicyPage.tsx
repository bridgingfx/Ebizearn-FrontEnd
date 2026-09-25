import React from 'react';
import { LegalShell, LegalSection } from '../../components/common/LegalShell';
import { PRIVACY_SECTIONS, PRIVACY_UPDATED, PRIVACY_VERSION, type LegalBlock } from '../../legal/privacy';

/**
 * Full Privacy Policy — real route /privacy.
 * Renders from src/legal/privacy.ts (single source of truth).
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

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalShell
      doc="privacy"
      badge="Privacy Policy"
      title="Privacy Policy"
      tagline="What data we collect, why we collect it, and the rights you have over your personal information."
      updated={`${PRIVACY_UPDATED} · v${PRIVACY_VERSION}`}
    >
      {PRIVACY_SECTIONS.map((section) => (
        <LegalSection key={section.n} n={section.n} title={section.title}>
          {section.blocks.map(renderBlock)}
        </LegalSection>
      ))}
    </LegalShell>
  );
};
