/**
 * SINGLE SOURCE OF TRUTH for the Terms of Service.
 *
 * Used by:
 *  - src/pages/public/TermsOfServicePage.tsx (renders /terms)
 *  - src/components/auth/TermsConsent.tsx (short plain-language summary in the signup consent modal)
 *  - scripts/generate-terms-pdf.ts (builds public/legal/terms-and-conditions.pdf)
 *
 * RULE: bump TERMS_VERSION every time this text changes. The version is sent
 * with every signup (register + social payloads) and recorded as proof of consent.
 */

export const TERMS_VERSION = '1.0';
export const TERMS_UPDATED = 'September 26, 2026';

export const COMPANY_LEGAL_NAME = 'eBiz Network';
export const COMPANY_ADDRESS =
  'Office 102 - Global link Business centre, 37 Platon Ioseliani St, Tbilisi, Georgia';
export const COMPANY_REGISTRATION_NUMBER = '[COMPANY REGISTRATION NUMBER]';
export const GOVERNING_LAW_SHORT = 'Georgia';
export const SUPPORT_EMAIL = 'support@ebizearn.com';
export const PLATFORM_URL = 'ebizearn.com';

/** Plain-text block: a paragraph or a bullet list. Renderers map it to HTML or PDF. */
export interface LegalBlock {
  type: 'p' | 'list';
  text?: string;
  items?: string[];
}

export interface LegalSection {
  n: string;
  title: string;
  blocks: LegalBlock[];
}

const p = (text: string): LegalBlock => ({ type: 'p', text });
const list = (...items: string[]): LegalBlock => ({ type: 'list', items });

export const TERMS_SECTIONS: LegalSection[] = [
  {
    n: '1',
    title: 'Acceptance of These Terms',
    blocks: [
      p(
        `Welcome to eBizEarn ("eBizEarn", "we", "our", "us"), a product of ${COMPANY_LEGAL_NAME} accessible at ${PLATFORM_URL}. eBizEarn is a task marketplace that connects contributors — people who complete social-media tasks — with businesses that run promotional campaigns.`
      ),
      p(
        'By creating an account you accept these Terms; your acceptance (version, timestamp, IP) is recorded as proof of consent. By accessing or using the platform you agree to be bound by these Terms of Service and by our Privacy Policy, Cookie Policy, and Disclaimer. If you do not agree with any part of these terms, you must not use the platform.'
      ),
      p(
        'We may update these terms from time to time. When we make material changes, we will notify you through the platform or by email, and the version number of these Terms will increase. Your continued use of eBizEarn after changes take effect constitutes acceptance of the updated terms.'
      ),
    ],
  },
  {
    n: '2',
    title: 'Who We Are',
    blocks: [
      p(
        `eBizEarn is operated by ${COMPANY_LEGAL_NAME}, ${COMPANY_ADDRESS}. Company registration number: ${COMPANY_REGISTRATION_NUMBER}.`
      ),
      p(
        `For any question about these Terms, contact us at ${SUPPORT_EMAIL}.`
      ),
    ],
  },
  {
    n: '3',
    title: 'Eligibility and Accounts',
    blocks: [
      p(
        'You must be at least 18 years old, or the age of majority in your jurisdiction (whichever is higher), to create an account. By registering, you confirm that you meet this requirement.'
      ),
      p(
        'Each person may maintain one contributor account. Registering or operating multiple accounts, or creating accounts on behalf of others without their consent, is prohibited and may result in suspension of all related accounts and forfeiture of earnings.'
      ),
      p(
        `You must provide accurate, current registration information (including email and phone) and keep it updated. You are responsible for safeguarding your login credentials and for all activity under your account. Notify us immediately at ${SUPPORT_EMAIL} if you suspect unauthorized access.`
      ),
    ],
  },
  {
    n: '4',
    title: 'Free Access for Contributors',
    blocks: [
      p(
        `Creating and using a contributor account is 100% free. We will never charge registration fees, membership upgrades, deposits, or pay-to-work fees for contributors to access tasks and earn rewards. Any message or person asking you to pay eBizEarn to "unlock" earnings is a scam — please report it to ${SUPPORT_EMAIL} immediately.`
      ),
    ],
  },
  {
    n: '5',
    title: 'Tasks and Submissions',
    blocks: [
      p(
        'Businesses post tasks (such as following a page, sharing a post, or engaging with content) with specific instructions and reward amounts. Contributors choose which tasks to complete voluntarily.'
      ),
      list(
        'Complete tasks exactly as instructed and submit genuine, original proof of completion.',
        'Keep required posts, follows, or engagement visible for the duration stated in the task (at minimum 24 hours unless the task states otherwise). Deleting posts or unfollowing prematurely may result in reward clawback.',
        'Submissions are reviewed through automated checks and human moderator review. Reviews may take time; we do not guarantee approval or a fixed review timeline.',
        'If a submission is rejected, you will be shown the reviewer note and, where applicable, may submit corrected proof or request escalation.',
        `Businesses do not purchase fake engagement: we prohibit campaigns requesting fake reviews, deceptive testimonials, misleading claims, spam, or illegal content. Report any task that asks for such behavior to ${SUPPORT_EMAIL}.`
      ),
    ],
  },
  {
    n: '6',
    title: 'Earnings',
    blocks: [
      p(
        'When a submission is approved, the reward is credited to your eBizEarn wallet. A complete double-entry ledger of everything you earned, have pending, or withdrew is available in your account.'
      ),
      p(
        'Earnings are not guaranteed. How much you earn depends on task availability in your region, the rewards businesses set, your effort, and successful verification of your submissions. We make no promises about the volume of tasks or the income you can expect. Rewards are denominated in USD and credited to your wallet balance only upon successful verification.'
      ),
      p(
        'eBizEarn is not an employer: completing tasks does not create an employment, agency, or partnership relationship between you and eBizEarn or any business.'
      ),
    ],
  },
  {
    n: '7',
    title: 'Withdrawals',
    blocks: [
      p(
        'You may request a withdrawal once your available wallet balance reaches the minimum threshold, currently $50.00 USD. The threshold may be adjusted by the platform; we will notify you of any change.'
      ),
      list(
        'Withdrawal requests are queued for manual processing — payouts are not instant.',
        'We may require identity verification (such as government-issued ID or phone verification) before processing withdrawals, in line with our anti-fraud obligations.',
        'Withdrawals may be held, delayed, or reversed while a submission or account is under fraud or compliance review.',
        'Any fees charged by third-party payment providers are your responsibility and will be shown to you before you confirm a withdrawal.',
        'You are solely responsible for any taxes on earnings in your jurisdiction. eBizEarn does not provide tax advice.'
      ),
    ],
  },
  {
    n: '8',
    title: 'Referrals',
    blocks: [
      p(
        'Contributors may earn referral rewards by inviting genuine new users through their personal referral link. Referral rewards are credited only when the referred account is verified and active in accordance with the referral program rules shown on the referral page.'
      ),
      p(
        'Self-referral, creating fake accounts to harvest referral rewards, or otherwise manipulating the referral program is fraud and will result in forfeiture of referral earnings and account suspension. We may change or discontinue the referral program at any time with notice; pending legitimate referral rewards will be honored under the rules in force when they were earned.'
      ),
    ],
  },
  {
    n: '9',
    title: 'Fees',
    blocks: [
      p(
        'Contributors pay no platform fees to sign up, browse tasks, or receive rewards in their wallet. Businesses pay campaign and service fees as described on our business pricing pages and in their billing agreements. If we introduce new fees or change existing ones, we will give advance notice, and continued use of the affected service constitutes acceptance.'
      ),
    ],
  },
  {
    n: '10',
    title: 'Data Use & Consent',
    blocks: [
      p(
        'To operate eBizEarn we collect and process personal data. The categories we collect are:'
      ),
      list(
        'Identity data: name, date of birth where required, and identity-verification results.',
        'Contact data: email address and phone number.',
        'Task-submission data: the proof you submit for tasks, including screenshots, photos, links, and text.',
        'Device and technical data: device information, IP address, browser type, and usage timestamps.'
      ),
      p('We use this data for the following purposes:'),
      list(
        'Operating the platform: creating and managing your account and providing core features.',
        'Verification: confirming your identity and reviewing task submissions, including through automated and AI-assisted checks.',
        'Payouts: processing withdrawals, referral rewards, and related financial operations.',
        'Surveys: inviting you to, and analyzing, optional surveys about the platform.',
        'Research and development and product improvement: understanding how the platform is used so we can make it better, safer, and more reliable.',
        'Marketing: sending you news, offers, and updates about eBizEarn. You can opt out of marketing messages at any time.',
        'Legal compliance: meeting our obligations under applicable law and cooperating with lawful requests from authorities.'
      ),
      p(
        'We keep personal data only for as long as needed for these purposes — while your account is active and for a reasonable period afterwards to comply with legal obligations, resolve disputes, and enforce our agreements. Task submissions and ledger records may be retained longer where needed for audit, tax, or fraud-prevention purposes. When data is no longer needed, it is deleted or anonymized.'
      ),
      p(
        'You have the right to request access to the personal data we hold about you, to request correction of inaccurate data, and to request deletion of your data in accordance with applicable law. To exercise these rights, contact support@ebizearn.com with the subject "Privacy Request". We may ask you to verify your identity before fulfilling the request.'
      ),
      p(
        'By creating an account you accept these Terms; your acceptance (version, timestamp, IP) is recorded as proof of consent. You may not later claim you were unaware of this data use: the summary presented at signup describes it in plain language, and the full detail is in this section and our Privacy Policy.'
      ),
    ],
  },
  {
    n: '11',
    title: 'Prohibited Conduct',
    blocks: [
      p('You agree not to:'),
      list(
        'Use bots, scripts, emulators, VPN farms, or any automation to complete or submit tasks.',
        'Submit fake, reused, edited, or stolen proof (screenshots, links, or tokens) or misrepresent your identity, location, or social-media accounts.',
        'Operate multiple accounts or assist others in doing so.',
        'Post or engage in hate speech, harassment, spam, illegal content, financial scams, or deceptive reviews/ratings.',
        'Attempt to circumvent verification, access other users\u2019 accounts, scrape the platform, or interfere with its security or operation.',
        'Use the platform in any way that violates the laws of Georgia or of your own jurisdiction.'
      ),
      p(
        'Violations may lead to rejection of submissions, clawback of rewards, suspension, or permanent termination of your account, and referral of serious fraud to the relevant authorities.'
      ),
    ],
  },
  {
    n: '12',
    title: 'Business Campaign Terms',
    blocks: [
      p(
        'Businesses must fund campaigns from their own budgets in accordance with the billing terms shown at campaign creation. Campaign funds are earmarked for contributor payouts and platform fees as described at checkout.'
      ),
      p(
        'All campaigns undergo compliance screening before going live. We reserve the right to reject or pause any campaign that violates our policies or applicable law, including campaigns requesting fake reviews, deceptive endorsements, spam, or misleading claims. Refunds for unused, unallocated campaign funds are governed by the refund policy presented at billing; funds already allocated to verified contributor rewards are non-refundable.'
      ),
    ],
  },
  {
    n: '13',
    title: 'Intellectual Property',
    blocks: [
      p(
        `The eBizEarn platform — including its software, design, text, graphics, logos, and brand assets — is owned by ${COMPANY_LEGAL_NAME} or its licensors and protected by intellectual property laws. You may not copy, modify, redistribute, or reverse-engineer the platform without our written permission.`
      ),
      p(
        'By submitting task proof, content, or feedback to the platform, you grant eBizEarn a non-exclusive, worldwide, royalty-free license to use, display, and store that content for the purposes of operating the platform (including verification and dispute review). You retain ownership of your own content and represent that you have the rights to share it.'
      ),
    ],
  },
  {
    n: '14',
    title: 'Termination',
    blocks: [
      p(
        `You may close your account at any time from your account settings or by contacting ${SUPPORT_EMAIL}. We may suspend or terminate your account, with or without prior notice, if we reasonably believe you have violated these terms or engaged in fraud.`
      ),
      p(
        'Upon termination, your access to tasks and the platform ends. Earnings obtained through fraud or policy violations are forfeited. Any legitimate pending withdrawals at the time of account closure remain subject to verification and fraud review before processing.'
      ),
    ],
  },
  {
    n: '15',
    title: 'Disclaimers and Limitation of Liability',
    blocks: [
      p(
        'eBizEarn is provided "as is" and "as available". To the maximum extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the platform will be uninterrupted, error-free, or completely secure.'
      ),
      p(
        `To the maximum extent permitted by law, eBizEarn and ${COMPANY_LEGAL_NAME} will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, or data, arising from your use of the platform. Our total liability for any claim arising out of or relating to these terms or the platform is limited to the greater of (a) USD 100, or (b) the total amounts actually paid to you (or paid by you to us) in the twelve (12) months preceding the claim.`
      ),
      p(
        'Nothing in these terms limits liability that cannot be limited under applicable Georgian law, and nothing here claims certifications, licenses, regulatory approvals, or insurance coverage that we do not hold (see our Disclaimer for details).'
      ),
    ],
  },
  {
    n: '16',
    title: 'Dispute Resolution and Governing Law',
    blocks: [
      p(
        `These Terms of Service are governed by the laws of Georgia. If a dispute arises, we ask that you first contact ${SUPPORT_EMAIL} so we can try to resolve it informally and in good faith within 30 days.`
      ),
      p(
        'If informal resolution fails, disputes shall be subject to the exclusive jurisdiction of the competent courts of Tbilisi, Georgia.'
      ),
    ],
  },
  {
    n: '17',
    title: 'General Provisions',
    blocks: [
      p(
        'These terms, together with the documents they reference, constitute the entire agreement between you and eBizEarn regarding the platform. If any provision is found unenforceable, the remaining provisions continue in effect. Our failure to enforce any right is not a waiver of that right. You may not assign your rights under these terms without our written consent.'
      ),
    ],
  },
  {
    n: '18',
    title: 'Contact',
    blocks: [
      p(
        `For questions about these Terms of Service, contact us at ${SUPPORT_EMAIL}. eBizEarn is operated by ${COMPANY_LEGAL_NAME}, ${COMPANY_ADDRESS}. Company registration number: ${COMPANY_REGISTRATION_NUMBER}.`
      ),
    ],
  },
];

/**
 * Short plain-language summary shown in the signup consent modal.
 * Covers everything the user agrees to; the full detail lives in the
 * sections above and in the Privacy Policy.
 */
export const CONSENT_SUMMARY: string[] = [
  'We collect your identity, contact, and phone details, the task submissions you send us (including photos and proof), and technical device data.',
  'We use it to run the platform, verify your identity (including automated and AI-assisted checks), and review your task submissions.',
  'We use it to process payouts and referral rewards, run optional surveys, and do research & development to improve the product.',
  'We may send you marketing about eBizEarn — you can opt out at any time.',
  'We process data to comply with the law and cooperate with lawful authority requests.',
  'Your acceptance is recorded with the terms version, timestamp, and IP as proof of consent — you cannot later claim you did not know.',
];
