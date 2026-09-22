import React from 'react';
import { LegalShell, LegalSection } from '../../components/common/LegalShell';

/**
 * Full Privacy Policy — real route /privacy.
 * UAE-relevant: references the UAE Personal Data Protection Law
 * (Federal Decree-Law No. 45 of 2021) and explains user rights honestly —
 * no claimed certifications or regulatory approvals.
 */
export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalShell
      doc="privacy"
      badge="Privacy Policy"
      title="Privacy Policy"
      tagline="What data we collect, why we collect it, and the rights you have over your personal information."
      updated="September 23, 2026"
    >
      <LegalSection n="1" title="Who We Are">
        <p>
          This Privacy Policy applies to eBizEarn ("we", "our", "us"), a product of eBiz Network based in
          Dubai, United Arab Emirates, accessible at ebizearn.com. We are the data controller for
          personal data processed through the platform.
        </p>
        <p>
          For any privacy question or request, contact us at{' '}
          <a
            href="mailto:support@ebizearn.com"
            className="font-bold text-[#168BFF] hover:underline"
          >
            support@ebizearn.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="2" title="Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Account information:</strong> name,
            display name, email address, phone number, password (stored securely, never in plain text),
            and account type (contributor, business, admin).
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Identity verification data:</strong>{' '}
            government-issued ID details or verification results when required for withdrawals or fraud
            checks.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Social account details:</strong>{' '}
            usernames or handles you connect for task verification purposes.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Task submissions and proof:</strong>{' '}
            screenshots, links, text tokens, and other evidence you submit to complete tasks.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Payment information:</strong> payout
            destination details you provide (for example, a payment email or bank/IBAN details). We never
            store raw banking credentials or payment card numbers.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Business data:</strong> company name,
            contact details, campaign content, and billing information for business accounts.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Technical and usage data:</strong>{' '}
            device information, IP address, browser type, pages visited, and timestamps — used for
            security, fraud prevention, and service reliability.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Communications:</strong> messages you
            send to our support team.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="3" title="How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Create and manage your account and provide the platform's core features.</li>
          <li>Verify task submissions and calculate your earnings ledger.</li>
          <li>Process withdrawals and referral rewards.</li>
          <li>Detect, prevent, and investigate fraud, abuse, and policy violations.</li>
          <li>
            Communicate with you about your account, tasks, payouts, and important platform updates.
          </li>
          <li>Improve the platform's reliability, performance, and user experience.</li>
          <li>Comply with our legal obligations.</li>
        </ul>
        <p>
          We process personal data where it is necessary to perform our contract with you, to pursue our
          legitimate interests (such as preventing fraud and keeping the platform secure), to comply
          with legal obligations, and — where required — with your consent. Where consent is the basis
          for processing, you may withdraw it at any time by contacting us.
        </p>
      </LegalSection>

      <LegalSection n="4" title="UAE Personal Data Protection Law">
        <p>
          We aim to handle personal data in line with the principles of the UAE Federal Decree-Law No.
          45 of 2021 on the Protection of Personal Data (the "UAE PDPL"), including lawfulness,
          purpose limitation, data minimization, and security. In line with the PDPL's principles for
          data subjects, you may:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Request access to the personal data we hold about you.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request erasure or restriction of processing of your data in certain circumstances.</li>
          <li>Object to processing based on legitimate interests in certain circumstances.</li>
          <li>Request a portable copy of data you provided to us, where technically feasible.</li>
        </ul>
        <p>
          To exercise any of these rights, email support@ebizearn.com with the subject "Privacy
          Request". We will respond within a reasonable period and may ask you to verify your identity
          before fulfilling the request. We will retain limited records of fraud or security events even
          after account deletion where we are required to do so or have a legitimate legal basis.
        </p>
      </LegalSection>

      <LegalSection n="5" title="Cookies and Tracking">
        <p>
          We use cookies and similar technologies for essential functions (keeping you signed in,
          securing sessions, remembering your consent choice) and, in limited cases, to understand
          aggregate platform performance. Details of the cookies we use, and how to manage them, are set
          out in our{' '}
          <a href="/cookies" className="font-bold text-[#168BFF] hover:underline">
            Cookie Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="6" title="Sharing Your Information">
        <p>
          <strong className="text-gray-900 dark:text-gray-100">
            We never sell, rent, or monetize your personal information to third-party data brokers.
          </strong>{' '}
          We share personal data only where necessary:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Service providers:</strong> hosting,
            database, email delivery, and analytics providers that process data on our behalf under
            contractual safeguards.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Payment processors:</strong> to
            execute withdrawals you request.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Businesses (limited):</strong>{' '}
            businesses see only the submission proof and public profile information needed to review
            tasks — not your private contact or payout details.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">Legal and safety disclosures:</strong>{' '}
            where required by law, court order, or to protect our rights, users, or the public,
            including cooperation with UAE authorities on fraud investigations.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="7" title="International Data Transfers">
        <p>
          Our servers and some service providers may be located outside the United Arab Emirates. Where
          personal data is transferred internationally, we take steps to ensure it remains protected in
          line with this policy and applicable UAE data protection requirements.
        </p>
      </LegalSection>

      <LegalSection n="8" title="Data Retention">
        <p>
          We keep your personal data for as long as your account is active and for a reasonable period
          afterwards to comply with legal obligations, resolve disputes, and enforce our agreements.
          Task submissions and ledger records may be retained longer where needed for audit, tax, or
          fraud-prevention purposes. When data is no longer needed, it is deleted or anonymized.
        </p>
      </LegalSection>

      <LegalSection n="9" title="Security">
        <p>
          We protect your data with measures including encrypted connections (HTTPS), secure password
          storage, role-based access controls, and monitoring for unauthorized access. While we work
          hard to protect your information, no internet service can be completely secure — you should
          also protect your own credentials and notify us of any suspicious activity.
        </p>
      </LegalSection>

      <LegalSection n="10" title="Children">
        <p>
          eBizEarn is not intended for anyone under 18 years of age. We do not knowingly collect
          personal data from children. If we learn that we have collected data from a child, we will
          delete it promptly.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy to reflect changes in our practices or legal requirements.
          Material changes will be communicated through the platform or by email before they take
          effect. The "Last updated" date at the top shows when the policy was last revised.
        </p>
      </LegalSection>

      <LegalSection n="12" title="Contact Us">
        <p>
          For privacy questions, requests, or complaints, contact us at{' '}
          <a
            href="mailto:support@ebizearn.com"
            className="font-bold text-[#168BFF] hover:underline"
          >
            support@ebizearn.com
          </a>
          . eBizEarn is operated by eBiz Network, based in Dubai, United Arab Emirates.
        </p>
      </LegalSection>
    </LegalShell>
  );
};
