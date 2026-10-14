import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'ftc-cleo-refunds-paypal-how-to-verify',
  title: 'FTC Sending $15.8M Refunds via PayPal: How to Verify Yours',
  excerpt:
    'The FTC is refunding $15.8M to over 2.1M Cleo users via PayPal. Here is the timeline, how payments arrive, and how to spot fake refund scams that will follow.',
  category: 'Payments & Withdrawals',
  tags: ['refunds', 'paypal', 'ftc', 'payments'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-14',
  updatedAt: '2026-10-14',
  readingMinutes: 6,
  heroImage: '/images/blog/ftc-cleo-refunds-paypal-how-to-verify.jpg',
  content: [
    {
      type: 'intro',
      text: 'If you ever used the Cleo AI app for an instant cash advance, check your inbox — and your PayPal. On 8 October, the US Federal Trade Commission announced it is sending more than $15.8 million in refunds to 2,124,796 former customers, with PayPal payments starting 27 October. Here is how the money reaches you, and — just as important — how to tell the real thing from the wave of phishing that always follows news like this.',
    },
    { type: 'h2', text: 'What happened' },
    {
      type: 'p',
      text: 'The refunds come from a $17 million settlement that Cleo agreed to in March 2025. The FTC’s complaint said the app’s ads promised access to “hundreds of dollars” in instant cash — the National Law Review’s write-up put the advertised pitch at “up to $250” — but that almost no one received amounts close to what was advertised. Speed was the other problem: getting the money same-day cost an extra express fee, reported at $3.99 and sometimes tucked away in a footnote, and the FTC said the money could still land the next day anyway. Cancelling the subscription, the FTC alleged, was deliberately difficult. Cleo settled the charges without admitting wrongdoing, and the October announcement is the payout.',
    },
    { type: 'h2', text: 'The timeline that matters' },
    {
      type: 'steps',
      items: [
        'By 26 October: if you are eligible, an email from refunds@ftc.gov should reach your inbox. That address is the only one the FTC named — memorise it.',
        'From 27 October: PayPal payments start going out. You have 30 days to accept yours, or you lose it. Check your PayPal account directly, not through email links.',
        'The amount: the FTC has not published a per-person figure. Do the rough division — $15.8 million across 2.1 million people — and it works out to a few dollars each on average. Small, but real, and it is yours.',
      ],
    },
    { type: 'h2', text: 'How to verify it is real — and dodge the fakes' },
    {
      type: 'p',
      text: 'Real government refund programmes have a consistent shape, and the scams that copy them do too. The real one: you did nothing to sign up for a refund — eligibility was worked out from Cleo’s records. The email comes from refunds@ftc.gov. You never pay a fee to receive a refund. The FTC will never ask for your bank password, your PayPal login, or a payment to “release” funds. The fake one will ask for exactly those things, usually with urgency — “claim within 24 hours” — and a link to a lookalike page. If an email about this refund asks you to pay anything or to log in through its own link, close it and go to the FTC’s own website or your PayPal account directly instead.',
    },
    {
      type: 'callout',
      title: 'Never pay to get paid',
      text: 'Legitimate refunds and payouts never require an upfront fee, a “release charge”, or your login credentials. If a message asks for any of those, it is a scam — no matter how official it looks.',
    },
    {
      type: 'list',
      items: [
        'Urgency: “act now or lose it” pressure is the scammer’s favourite tool. The real deadline here is 30 days, stated calmly, not 24 hours.',
        'Fees: any request for payment — processing, release, tax, verification — marks the message as fake.',
        'Credentials: real refund programmes never ask for your password or a login through an email link.',
        'The sender: check the actual email address, not the display name. Anything other than refunds@ftc.gov for this refund is not the FTC.',
        'The link: hover before you click. A URL that does not belong to ftc.gov or paypal.com is a red flag.',
      ],
    },
    { type: 'h2', text: 'The lesson for anyone earning online' },
    {
      type: 'p',
      text: 'There is a reason this story matters beyond the refund itself. The patterns that triggered this case — a few dollars here for “express” delivery, a subscription that is easy to start and hard to stop, payout promises that shrink in the fine print — are the same patterns that show up around online earning. Withdrawal fees that eat small balances. “Premium” tiers that are painful to cancel. Bonus promises that turn out to have conditions buried three screens deep. Before you commit money or time to any earning platform, read the withdrawal terms, check how cancellation works, and search for other people’s experiences with it. A platform that makes its fees hard to find is telling you something — listen.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Do I need to apply for the Cleo refund?',
          a: 'No. The FTC is working from Cleo’s customer records, so eligible customers will be contacted. If you get the email from refunds@ftc.gov by 26 October, you are in.',
        },
        {
          q: 'What if I no longer have a PayPal account?',
          a: 'The FTC’s announcement says payments go through PayPal. Check the FTC’s case page for this matter for the options available if you cannot receive one.',
        },
        {
          q: 'Is this related to eBizEarn payouts?',
          a: 'No. This is a US consumer refund case involving one app’s settlement with the FTC. It is entirely separate from any earning platform’s payout system.',
        },
        {
          q: 'Why is the refund so small?',
          a: 'The settlement is split across more than 2.1 million eligible customers, so the per-person amount is modest. Refunds like this are about returning what was taken, not about making anyone whole beyond that.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Know exactly how your payouts work',
      text: 'On eBizEarn, withdrawal terms are published before you start — thresholds, methods, timelines. No fine print, no express-fee surprises.',
      buttonText: 'Start earning',
      buttonHref: '/how-it-works',
    },
  ],
};
