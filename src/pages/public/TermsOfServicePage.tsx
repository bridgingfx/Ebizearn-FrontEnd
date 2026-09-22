import React from 'react';
import { LegalShell, LegalSection } from '../../components/common/LegalShell';

/**
 * Full Terms of Service — real route /terms.
 * Honest copy: no claimed licenses, certifications, approvals, insurance or
 * earnings guarantees. Earnings language is realistic: earnings vary and are
 * never guaranteed.
 */
export const TermsOfServicePage: React.FC = () => {
  return (
    <LegalShell
      doc="terms"
      badge="Terms of Service"
      title="Terms of Service"
      tagline="The rules that govern your use of eBizEarn — for contributors, businesses, and visitors."
      updated="September 23, 2026"
    >
      <LegalSection n="1" title="Acceptance of These Terms">
        <p>
          Welcome to eBizEarn ("eBizEarn", "we", "our", "us"), a product of eBiz Network accessible at
          ebizearn.com. eBizEarn is a task marketplace that connects contributors — people who complete
          social-media tasks — with businesses that run promotional campaigns.
        </p>
        <p>
          By creating an account, accessing, or using the platform, you agree to be bound by these Terms
          of Service and by our Privacy Policy, Cookie Policy, and Disclaimer. If you do not agree with
          any part of these terms, you must not use the platform.
        </p>
        <p>
          We may update these terms from time to time. When we make material changes, we will notify you
          through the platform or by email. Your continued use of eBizEarn after changes take effect
          constitutes acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection n="2" title="Eligibility and Accounts">
        <p>
          You must be at least 18 years old, or the age of majority in your jurisdiction (whichever is
          higher), to create an account. By registering, you confirm that you meet this requirement.
        </p>
        <p>
          Each person may maintain one contributor account. Registering or operating multiple accounts,
          or creating accounts on behalf of others without their consent, is prohibited and may result in
          suspension of all related accounts and forfeiture of earnings.
        </p>
        <p>
          You must provide accurate, current registration information (including email and phone) and keep
          it updated. You are responsible for safeguarding your login credentials and for all activity
          under your account. Notify us immediately at support@ebizearn.com if you suspect unauthorized
          access.
        </p>
      </LegalSection>

      <LegalSection n="3" title="Free Access for Contributors">
        <p>
          Creating and using a contributor account is 100% free. We will never charge registration fees,
          membership upgrades, deposits, or pay-to-work fees for contributors to access tasks and earn
          rewards. Any message or person asking you to pay eBizEarn to "unlock" earnings is a scam —
          please report it to support@ebizearn.com immediately.
        </p>
      </LegalSection>

      <LegalSection n="4" title="Tasks and Submissions">
        <p>
          Businesses post tasks (such as following a page, sharing a post, or engaging with content) with
          specific instructions and reward amounts. Contributors choose which tasks to complete voluntarily.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Complete tasks exactly as instructed and submit genuine, original proof of completion.</li>
          <li>
            Keep required posts, follows, or engagement visible for the duration stated in the task (at
            minimum 24 hours unless the task states otherwise). Deleting posts or unfollowing prematurely
            may result in reward clawback.
          </li>
          <li>
            Submissions are reviewed through automated checks and human moderator review. Reviews may take
            time; we do not guarantee approval or a fixed review timeline.
          </li>
          <li>
            If a submission is rejected, you will be shown the reviewer note and, where applicable, may
            submit corrected proof or request escalation.
          </li>
          <li>
            Businesses do not purchase fake engagement: we prohibit campaigns requesting fake reviews,
            deceptive testimonials, misleading claims, spam, or illegal content. Report any task that asks
            for such behavior to support@ebizearn.com.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="5" title="Earnings">
        <p>
          When a submission is approved, the reward is credited to your eBizEarn wallet. A complete
          double-entry ledger of everything you earned, have pending, or withdrew is available in your
          account.
        </p>
        <p>
          Earnings are <strong className="text-gray-900 dark:text-gray-100">not guaranteed</strong>.
          How much you earn depends on task availability in your region, the rewards businesses set, your
          effort, and successful verification of your submissions. We make no promises about the volume
          of tasks or the income you can expect. Rewards are denominated in USD and credited to your
          wallet balance only upon successful verification.
        </p>
        <p>
          eBizEarn is not an employer: completing tasks does not create an employment, agency, or
          partnership relationship between you and eBizEarn or any business.
        </p>
      </LegalSection>

      <LegalSection n="6" title="Withdrawals">
        <p>
          You may request a withdrawal once your available wallet balance reaches the minimum threshold,
          currently <strong className="text-gray-900 dark:text-gray-100">$50.00 USD</strong>. The
          threshold may be adjusted by the platform; we will notify you of any change.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Withdrawal requests are queued for manual processing — payouts are not instant.</li>
          <li>
            We may require identity verification (such as government ID or phone verification) before
            processing withdrawals, in line with our anti-fraud obligations.
          </li>
          <li>
            Withdrawals may be held, delayed, or reversed while a submission or account is under fraud or
            compliance review.
          </li>
          <li>
            Any fees charged by third-party payment providers are your responsibility and will be shown to
            you before you confirm a withdrawal.
          </li>
          <li>
            You are solely responsible for any taxes on earnings in your jurisdiction. eBizEarn does not
            provide tax advice.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="7" title="Referrals">
        <p>
          Contributors may earn referral rewards by inviting genuine new users through their personal
          referral link. Referral rewards are credited only when the referred account is verified and
          active in accordance with the referral program rules shown on the referral page.
        </p>
        <p>
          Self-referral, creating fake accounts to harvest referral rewards, or otherwise manipulating
          the referral program is fraud and will result in forfeiture of referral earnings and account
          suspension. We may change or discontinue the referral program at any time with notice; pending
          legitimate referral rewards will be honored under the rules in force when they were earned.
        </p>
      </LegalSection>

      <LegalSection n="8" title="Fees">
        <p>
          Contributors pay no platform fees to sign up, browse tasks, or receive rewards in their wallet.
          Businesses pay campaign and service fees as described on our business pricing pages and in
          their billing agreements. If we introduce new fees or change existing ones, we will give
          advance notice, and continued use of the affected service constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection n="9" title="Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Use bots, scripts, emulators, VPN farms, or any automation to complete or submit tasks.</li>
          <li>
            Submit fake, reused, edited, or stolen proof (screenshots, links, or tokens) or misrepresent
            your identity, location, or social-media accounts.
          </li>
          <li>Operate multiple accounts or assist others in doing so.</li>
          <li>
            Post or engage in hate speech, harassment, spam, illegal content, financial scams, or
            deceptive reviews/ratings.
          </li>
          <li>
            Attempt to circumvent verification, access other users' accounts, scrape the platform, or
            interfere with its security or operation.
          </li>
          <li>
            Use the platform in any way that violates the laws of the UAE or of your own jurisdiction.
          </li>
        </ul>
        <p>
          Violations may lead to rejection of submissions, clawback of rewards, suspension, or permanent
          termination of your account, and referral of serious fraud to the relevant authorities.
        </p>
      </LegalSection>

      <LegalSection n="10" title="Business Campaign Terms">
        <p>
          Businesses must fund campaigns from their own budgets in accordance with the billing terms
          shown at campaign creation. Campaign funds are earmarked for contributor payouts and platform
          fees as described at checkout.
        </p>
        <p>
          All campaigns undergo compliance screening before going live. We reserve the right to reject or
          pause any campaign that violates our policies or applicable law, including campaigns requesting
          fake reviews, deceptive endorsements, spam, or misleading claims. Refunds for unused,
          unallocated campaign funds are governed by the refund policy presented at billing; funds
          already allocated to verified contributor rewards are non-refundable.
        </p>
      </LegalSection>

      <LegalSection n="11" title="Intellectual Property">
        <p>
          The eBizEarn platform — including its software, design, text, graphics, logos, and brand assets
          — is owned by eBiz Network or its licensors and protected by intellectual property laws. You
          may not copy, modify, redistribute, or reverse-engineer the platform without our written
          permission.
        </p>
        <p>
          By submitting task proof, content, or feedback to the platform, you grant eBizEarn a
          non-exclusive, worldwide, royalty-free license to use, display, and store that content for the
          purposes of operating the platform (including verification and dispute review). You retain
          ownership of your own content and represent that you have the rights to share it.
        </p>
      </LegalSection>

      <LegalSection n="12" title="Termination">
        <p>
          You may close your account at any time from your account settings or by contacting
          support@ebizearn.com. We may suspend or terminate your account, with or without prior notice,
          if we reasonably believe you have violated these terms or engaged in fraud.
        </p>
        <p>
          Upon termination, your access to tasks and the platform ends. Earnings obtained through fraud
          or policy violations are forfeited. Any legitimate pending withdrawals at the time of account
          closure remain subject to verification and fraud review before processing.
        </p>
      </LegalSection>

      <LegalSection n="13" title="Disclaimers and Limitation of Liability">
        <p>
          eBizEarn is provided "as is" and "as available". To the maximum extent permitted by law, we
          disclaim all warranties, express or implied, including merchantability, fitness for a
          particular purpose, and non-infringement. We do not warrant that the platform will be
          uninterrupted, error-free, or completely secure.
        </p>
        <p>
          To the maximum extent permitted by law, eBizEarn and eBiz Network will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or for any loss of profits,
          revenue, or data, arising from your use of the platform. Our total liability for any claim
          arising out of or relating to these terms or the platform is limited to the greater of (a) USD
          100, or (b) the total amounts actually paid to you (or paid by you to us) in the twelve (12)
          months preceding the claim.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited under applicable UAE law, and
          nothing here claims certifications, licenses, regulatory approvals, or insurance coverage that
          we do not hold (see our Disclaimer for details).
        </p>
      </LegalSection>

      <LegalSection n="14" title="Dispute Resolution and Governing Law">
        <p>
          These Terms of Service are governed by the laws of the United Arab Emirates. If a dispute
          arises, we ask that you first contact support@ebizearn.com so we can try to resolve it
          informally and in good faith within 30 days.
        </p>
        <p>
          If informal resolution fails, disputes shall be subject to the jurisdiction of the competent
          courts of the United Arab Emirates, without prejudice to any right to refer the matter to
          arbitration seated in Dubai, UAE, as may be mutually agreed in writing at the time.
        </p>
      </LegalSection>

      <LegalSection n="15" title="General Provisions">
        <p>
          These terms, together with the documents they reference, constitute the entire agreement
          between you and eBizEarn regarding the platform. If any provision is found unenforceable, the
          remaining provisions continue in effect. Our failure to enforce any right is not a waiver of
          that right. You may not assign your rights under these terms without our written consent.
        </p>
      </LegalSection>

      <LegalSection n="16" title="Contact">
        <p>
          For questions about these Terms of Service, contact us at{' '}
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
