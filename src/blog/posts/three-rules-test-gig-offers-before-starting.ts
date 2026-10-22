import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'three-rules-test-gig-offers-before-starting',
  title: 'Three Questions That Sort Any Gig Offer Before You Start',
  excerpt:
    'No fee, screenshot, stopwatch: a three-rule test from experts that separates real gig offers from scams and bad deals before you commit any hours.',
  category: 'Getting Started',
  tags: ['gig-work', 'beginners', 'task-scams', 'bad-deals', 'checkr'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-22',
  updatedAt: '2026-10-22',
  readingMinutes: 6,
  heroImage: '/images/blog/three-rules-test-gig-offers-before-starting.jpg',
  content: [
    {
      type: 'intro',
      text: 'Most online earners waste their biggest resource — time — on two kinds of offers: scams that steal it and bad deals that drain it. In October 2026, background-check specialists Checkr published a short guide for sorting a gig offer before you sink hours into it. The whole framework is three rules: no fee, screenshot, stopwatch. It takes a few minutes, and it catches both scams and bad deals.',
    },
    { type: 'h2', text: 'Scams and bad deals are different problems' },
    {
      type: 'p',
      text: 'This is the insight the guide starts with. A scam wants your money or your logins — close the tab. A bad deal wants your unpaid time — get the terms in writing and count every hour before you start. Confusing the two is how people end up either robbed or working a full week for what amounts to pocket change.',
    },
    { type: 'h2', text: 'Rule one: no fee' },
    {
      type: 'p',
      text: 'If they want your money, gift cards, crypto or bank login, it is a scam. Close the tab. The same goes if they ask for your Social Security number or ID in a chat or email, or if the entire recruitment happens over a chat app like Telegram or WhatsApp with no verifiable company behind it.',
    },
    {
      type: 'p',
      text: 'This single rule catches most outright scams. Legitimate work pays you; it does not charge you for the privilege of being paid. Any \u201cunlock fee\u201d, deposit to start tasks, or payment to \u201cclear your balance\u201d is a request to fund a scammer, not a job.',
    },
    { type: 'h2', text: 'Rule two: screenshot' },
    {
      type: 'p',
      text: 'Before you start, save the pay rate, the approval rules and the payout schedule. If you cannot find those three things anywhere, walk away. You cannot price what you cannot see.',
    },
    {
      type: 'p',
      text: 'This is the rule that catches bad deals — offers that are technically real but structured to waste your time. Vague approval criteria (\u201cyour work will be reviewed\u201d) mean rejections you cannot appeal. No stated payout schedule means your money can sit wherever the platform wants it. If the offer survives this test, you at least have the terms in writing when something goes wrong.',
    },
    { type: 'h2', text: 'Rule three: stopwatch' },
    {
      type: 'p',
      text: 'Cap your unpaid time and count every hour: the qualification test, the onboarding, the revisions, the back-and-forth messages. Then ask whether the real hourly rate — total pay divided by total time — falls below your minimum. If it does, decline, or ask whether the terms can change.',
    },
    {
      type: 'p',
      text: 'Advertised rates almost always ignore unpaid time, which is why so many earners discover too late that a \u201cgood-paying\u201d task pays half the minimum wage in practice. The stopwatch rule forces you to price the whole job, not just the parts that appear on the invoice.',
    },
    { type: 'h2', text: 'Running an offer through the three rules' },
    {
      type: 'p',
      text: 'Ask these in order, before you start any work, and stop at the first \u201cyes\u201d:',
    },
    {
      type: 'steps',
      items: [
        'Do they ask you to pay, send gift cards or crypto, hand over your bank login or ID in a chat or email — or recruit you only over a chat app? If yes: scam. Close the tab, do not send anything, and report the listing.',
        'Is any of the pay rate, the approval rules or the payout schedule missing from what you can save or screenshot? If yes: bad deal. Walk away — you cannot price what you cannot see.',
        'With every unpaid hour counted, would the real hourly rate fall below your minimum? If yes: bad deal. Decline, or ask whether the terms can change.',
        'If the offer passed all three: worth a try. Start small, and check your real rate again after the first week.',
      ],
    },
    {
      type: 'callout',
      title: 'Earnings are never guaranteed',
      text: 'Even an honest offer is not a promise of income — demand, competition and your own output all vary. The three rules protect your time and money; they cannot promise either will multiply.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Is it normal for a gig platform to ask for a deposit?',
          a: 'No. Legitimate platforms pay you; they do not require deposits, unlock fees or funded wallets. Any such demand is a scam signal, whatever the excuse.',
        },
        {
          q: 'What should I screenshot before starting?',
          a: 'The pay rate, the approval or review rules, and the payout schedule — thresholds, methods and timing. If any of these are missing, you cannot evaluate the offer.',
        },
        {
          q: 'How do I calculate my real hourly rate?',
          a: 'Add up every unpaid hour — tests, onboarding, revisions, messaging — and divide your total pay by that total time. Compare the result with your minimum, not with the advertised rate.',
        },
        {
          q: 'I am already doing a gig that failed the test. What now?',
          a: 'Run your real numbers with the stopwatch rule. If the hourly rate is below your minimum, either renegotiate the terms or leave. Staying in a bad deal just because you started it is how weeks disappear.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Start with terms you can see',
      text: 'On eBizEarn, tasks, proof rules and payout terms are visible before you begin. See how it works.',
      buttonText: 'How it works',
      buttonHref: '/how-it-works',
    },
  ],
};
