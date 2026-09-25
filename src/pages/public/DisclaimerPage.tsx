import React from 'react';
import { LegalShell, LegalSection } from '../../components/common/LegalShell';

/**
 * Full Disclaimer — real route /disclaimer.
 * Honest by design: states explicitly what eBizEarn is NOT (not licensed,
 * regulated, insured, and not an employer), and that earnings are not
 * guaranteed. No certifications, licenses, or approvals are claimed.
 */
export const DisclaimerPage: React.FC = () => {
  return (
    <LegalShell
      doc="disclaimer"
      badge="Disclaimer"
      title="Disclaimer"
      tagline="Important information about what eBizEarn is — and what it is not."
      updated="September 23, 2026"
    >
      <LegalSection n="1" title="General Information">
        <p>
          The content on eBizEarn (ebizearn.com) is provided for general information and platform
          operation purposes only. It does not constitute legal, financial, tax, or investment advice.
          You should consult a qualified professional before making decisions based on information on
          this platform.
        </p>
      </LegalSection>

      <LegalSection n="2" title="Earnings Are Not Guaranteed">
        <p>
          Completing tasks on eBizEarn may result in rewards, but{' '}
          <strong className="text-gray-900 dark:text-gray-100">
            earnings are never guaranteed and vary from person to person
          </strong>
          . How much you earn depends on factors outside our control, including the number and type of
          tasks businesses publish, the rewards they set, task availability in your region, your effort,
          and whether your submissions pass verification.
        </p>
        <p>
          Any figures, examples, or ranges shown on the platform are illustrative only and must not be
          interpreted as promises of income. eBizEarn is not a get-rich-quick scheme, an investment
          product, or an employment opportunity. Completing tasks does not create an employment,
          agency, or partnership relationship between you and eBizEarn or any business.
        </p>
      </LegalSection>

      <LegalSection n="3" title="No Licenses, Certifications, or Regulatory Approvals Claimed">
        <p>
          To be fully transparent:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            eBizEarn does not claim to be a licensed bank, financial institution, payment service
            provider, or money transmitter.
          </li>
          <li>
            eBizEarn does not claim any government license, regulatory approval, certification,
            accreditation, or insurance coverage that it does not hold.
          </li>
          <li>
            Rewards credited to your wallet are platform credits reflecting verified task completions;
            they are not bank deposits and do not earn interest.
          </li>
          <li>
            Nothing on this platform is an offer to sell securities or a solicitation of investment.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="4" title="Task and Verification Outcomes">
        <p>
          Task approval decisions are made through automated checks and human moderator review. We do
          not guarantee that any submission will be approved, and we do not guarantee review timelines.
          Verification outcomes are final unless an appeal is expressly provided for in the task or
          platform rules.
        </p>
        <p>
          Businesses create and fund their own campaigns. eBizEarn screens campaigns for policy
          compliance, but we do not endorse, warrant, or guarantee the accuracy of any business's
          claims, products, or services. Any transaction or interaction you have with a business through
          its campaign is at your own discretion.
        </p>
      </LegalSection>

      <LegalSection n="5" title="Withdrawals and Payouts">
        <p>
          Withdrawal requests are processed manually and are subject to identity verification and fraud
          review. Processing times vary, and payouts may be delayed, held, or declined where fraud or
          policy violations are suspected. eBizEarn is not responsible for delays or fees imposed by
          third-party payment providers, banks, or mobile money services once a withdrawal has been
          dispatched.
        </p>
      </LegalSection>

      <LegalSection n="6" title="Third-Party Platforms and Links">
        <p>
          Tasks are typically completed on third-party social-media platforms. Those platforms have
          their own terms of service and community rules, which you are responsible for following. We
          are not affiliated with those platforms and are not responsible for actions they take against
          your accounts (such as restrictions or suspensions) as a result of tasks you complete.
        </p>
        <p>
          eBizEarn may contain links to third-party websites or services. We do not control and are not
          responsible for their content, policies, or practices.
        </p>
      </LegalSection>

      <LegalSection n="7" title="Service Availability">
        <p>
          The platform is provided "as is" and "as available". We aim for high reliability but do not
          guarantee uninterrupted, error-free, or fully secure operation. Maintenance, technical issues,
          or events beyond our control may temporarily affect availability.
        </p>
      </LegalSection>

      <LegalSection n="8" title="Jurisdictional Availability">
        <p>
          eBizEarn is operated from Tbilisi, Georgia, and is intended for users in
          Georgia and other regions where our services are available. It is your responsibility to ensure
          that using the platform complies with the laws of your jurisdiction.
        </p>
      </LegalSection>

      <LegalSection n="9" title="Contact">
        <p>
          If you have questions about this Disclaimer, contact us at{' '}
          <a
            href="mailto:support@ebizearn.com"
            className="font-bold text-[#168BFF] hover:underline"
          >
            support@ebizearn.com
          </a>
          . eBizEarn is operated by eBiz Network, registered in Tbilisi, Georgia.
        </p>
      </LegalSection>
    </LegalShell>
  );
};
