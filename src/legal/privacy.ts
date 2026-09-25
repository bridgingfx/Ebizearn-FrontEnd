/**
 * SINGLE SOURCE OF TRUTH for the Privacy Policy.
 *
 * Used by src/pages/public/PrivacyPolicyPage.tsx (renders /privacy).
 * Bump PRIVACY_VERSION every time this text changes.
 */
import {
  COMPANY_ADDRESS,
  COMPANY_LEGAL_NAME,
  COMPANY_REGISTRATION_NUMBER,
  PLATFORM_URL,
  SUPPORT_EMAIL,
  type LegalBlock,
  type LegalSection,
} from './terms';

export type { LegalBlock };

export const PRIVACY_VERSION = '1.0';
export const PRIVACY_UPDATED = 'September 26, 2026';

const p = (text: string): LegalBlock => ({ type: 'p', text });
const list = (...items: string[]): LegalBlock => ({ type: 'list', items });

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    n: '1',
    title: 'Who We Are',
    blocks: [
      p(
        `This Privacy Policy applies to eBizEarn ("we", "our", "us"), a product of ${COMPANY_LEGAL_NAME}, ${COMPANY_ADDRESS}, accessible at ${PLATFORM_URL}. Company registration number: ${COMPANY_REGISTRATION_NUMBER}. We are the data controller for personal data processed through the platform.`
      ),
      p(
        `For any privacy question or request, contact us at ${SUPPORT_EMAIL}.`
      ),
    ],
  },
  {
    n: '2',
    title: 'Information We Collect',
    blocks: [
      p('We collect the following categories of information:'),
      list(
        'Identity data: name and identity-verification results when required for withdrawals or fraud checks.',
        'Contact data: email address and phone number.',
        'Task submissions and proof: screenshots, photos, links, text tokens, and other evidence you submit to complete tasks.',
        'Payment information: payout destination details you provide (for example, a payment email or bank/IBAN details). We never store raw banking credentials or payment card numbers.',
        'Business data: company name, contact details, campaign content, and billing information for business accounts.',
        'Device and technical data: device information, IP address, browser type, pages visited, and timestamps — used for security, fraud prevention, and service reliability.',
        'Communications: messages you send to our support team, and your responses to optional surveys.'
      ),
    ],
  },
  {
    n: '3',
    title: 'How We Use Your Information',
    blocks: [
      p('We use your information to:'),
      list(
        'Operate the platform: create and manage your account and provide its core features.',
        'Verify identity and submissions: confirm who you are and review task proof, including through automated and AI-assisted checks.',
        'Process payouts: execute withdrawals and referral rewards.',
        'Run surveys: invite you to optional surveys and analyze responses to understand user needs.',
        'Research & development and product improvement: study how the platform is used so we can improve reliability, performance, and user experience.',
        'Marketing: send you news, offers, and updates about eBizEarn. You can opt out of marketing messages at any time; opting out does not stop essential account, payout, or security messages.',
        'Detect, prevent, and investigate fraud, abuse, and policy violations.',
        'Comply with our legal obligations and cooperate with lawful requests from authorities.'
      ),
      p(
        'We process personal data where it is necessary to perform our contract with you, to pursue our legitimate interests (such as preventing fraud and keeping the platform secure), to comply with legal obligations, and — where required — with your consent. Where consent is the basis for processing, you may withdraw it at any time by contacting us.'
      ),
    ],
  },
  {
    n: '4',
    title: 'Data Use & Consent',
    blocks: [
      p(
        'When you create an account, you accept our Terms of Service and this Privacy Policy. Your acceptance is recorded with the terms version, timestamp, and IP address as proof of consent — it is the legal basis for the data uses described in Section 3.'
      ),
      p(
        'We aim to handle personal data in line with the principles of the Law of Georgia on Personal Data Protection, including lawfulness, purpose limitation, data minimization, and security. In line with those principles, you may:'
      ),
      list(
        'Request access to the personal data we hold about you.',
        'Request correction of inaccurate or incomplete data.',
        'Request erasure or restriction of processing of your data in certain circumstances.',
        'Object to processing based on legitimate interests in certain circumstances.',
        'Request a portable copy of data you provided to us, where technically feasible.'
      ),
      p(
        'To exercise any of these rights, email support@ebizearn.com with the subject "Privacy Request". We will respond within a reasonable period and may ask you to verify your identity before fulfilling the request. We will retain limited records of fraud or security events even after account deletion where we are required to do so or have a legitimate legal basis.'
      ),
    ],
  },
  {
    n: '5',
    title: 'Cookies and Tracking',
    blocks: [
      p(
        'We use cookies and similar technologies for essential functions (keeping you signed in, securing sessions, remembering your consent choice) and, in limited cases, to understand aggregate platform performance. Details of the cookies we use, and how to manage them, are set out in our Cookie Policy.'
      ),
    ],
  },
  {
    n: '6',
    title: 'Sharing Your Information',
    blocks: [
      p(
        'We never sell, rent, or monetize your personal information to third-party data brokers. We share personal data only where necessary:'
      ),
      list(
        'Service providers: hosting, database, email delivery, and analytics providers that process data on our behalf under contractual safeguards.',
        'Payment processors: to execute withdrawals you request.',
        'Businesses (limited): businesses see only the submission proof and public profile information needed to review tasks — not your private contact or payout details.',
        'Legal and safety disclosures: where required by law, court order, or to protect our rights, users, or the public, including cooperation with Georgian authorities on fraud investigations.'
      ),
    ],
  },
  {
    n: '7',
    title: 'International Data Transfers',
    blocks: [
      p(
        'Our servers and some service providers may be located outside Georgia. Where personal data is transferred internationally, we take steps to ensure it remains protected in line with this policy and applicable Georgian data-protection requirements.'
      ),
    ],
  },
  {
    n: '8',
    title: 'Data Retention',
    blocks: [
      p(
        'We keep your personal data for as long as your account is active and for a reasonable period afterwards to comply with legal obligations, resolve disputes, and enforce our agreements. Task submissions and ledger records may be retained longer where needed for audit, tax, or fraud-prevention purposes. When data is no longer needed, it is deleted or anonymized.'
      ),
    ],
  },
  {
    n: '9',
    title: 'Security',
    blocks: [
      p(
        'We protect your data with measures including encrypted connections (HTTPS), secure password storage, role-based access controls, and monitoring for unauthorized access. While we work hard to protect your information, no internet service can be completely secure — you should also protect your own credentials and notify us of any suspicious activity.'
      ),
    ],
  },
  {
    n: '10',
    title: 'Children',
    blocks: [
      p(
        'eBizEarn is not intended for anyone under 18 years of age. We do not knowingly collect personal data from children. If we learn that we have collected data from a child, we will delete it promptly.'
      ),
    ],
  },
  {
    n: '11',
    title: 'Changes to This Policy',
    blocks: [
      p(
        'We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be communicated through the platform or by email before they take effect. The "Last updated" date at the top shows when the policy was last revised.'
      ),
    ],
  },
  {
    n: '12',
    title: 'Contact Us',
    blocks: [
      p(
        `For privacy questions, requests, or complaints, contact us at ${SUPPORT_EMAIL}. eBizEarn is operated by ${COMPANY_LEGAL_NAME}, ${COMPANY_ADDRESS}. Company registration number: ${COMPANY_REGISTRATION_NUMBER}.`
      ),
    ],
  },
];
