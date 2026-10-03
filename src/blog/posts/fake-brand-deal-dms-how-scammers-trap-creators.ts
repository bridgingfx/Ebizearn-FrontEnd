import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fake-brand-deal-dms-how-scammers-trap-creators',
  title: 'Fake Brand-Deal DMs: How Scammers Are Trapping Creators',
  excerpt:
    'Scammers are posing as brands in creators\u2019 DMs, offering paid campaigns \u2014 then sending phishing links and QR codes. Here is the playbook and how to spot it.',
  category: 'Safety',
  tags: ['safety', 'scams', 'phishing', 'brand-deals', 'creators'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-03',
  updatedAt: '2026-10-03',
  readingMinutes: 6,
  heroImage: '/images/blog/fake-brand-deal-dms-how-scammers-trap-creators.jpg',
  content: [
    {
      type: 'intro',
      text: 'The message looks like the break every small creator waits for: a brand loves your content, wants you for a campaign, and the pay is generous. There is only one problem \u2014 the brand does not exist, and the \u201conboarding process\u201d is a trap. Security researchers documented this exact campaign against TikTok and Instagram creators in September 2026, and it is one of the most polished social-engineering operations seen this year.',
    },
    { type: 'h2', text: 'How the playbook works' },
    {
      type: 'p',
      text: 'It starts with research. The attackers study a creator\u2019s content, then reach out \u2014 by email if they can find one, or straight into Instagram and TikTok DMs if they cannot. The pitch is detailed on purpose: a full campaign package with deliverables spelled out (a photoshoot session, edited promo photos, short-form videos, feed posts, stories), high rates, and the promise that transportation, hotel and food are fully covered. Detail is the weapon here \u2014 a vague scam is easy to ignore, but a campaign brief feels like a real business.',
    },
    {
      type: 'p',
      text: 'Then comes the hook. Victims contacted by email are told to click a link to choose the apparel designs they want for the shoot. Victims contacted by DM get a QR code to scan to \u201cprocess the PR package\u201d and sign the collaboration agreement. Both routes lead the same place: a malicious page designed to harvest the creator\u2019s login credentials \u2014 and in some cases the attack escalates toward extortion using material pulled from the compromised account.',
    },
    { type: 'h2', text: 'Why QR codes are the new danger' },
    {
      type: 'p',
      text: 'QR codes deserve a special warning. A link can at least be inspected \u2014 you can hover, read the domain, spot the misspelling. A QR code hides its destination completely until you scan it, which is exactly why scammers love them. A QR code arriving in a DM from someone you have never met should be treated the way you would treat a stranger handing you a locked box: you do not open it.',
    },
    {
      type: 'p',
      text: 'This is part of a wider surge. In Singapore alone, police reported on 2 October 2026 that at least 246 people had fallen for phishing scams delivered through fraudulent social media ads since July, losing at least S$1.4 million \u2014 victims clicked ads for cheap goods, landed on phishing pages, and handed over card details and one-time passwords.',
    },
    { type: 'h2', text: 'Five tells of a fake brand deal' },
    {
      type: 'list',
      items: [
        'The deal arrives before any relationship: real brands rarely offer paid campaigns to creators they have never interacted with, in the very first message.',
        'The pay is vague but generous: high rates are promised with no specifics about usage rights, deliverables in writing, or a contract.',
        'The process moves off-platform fast: a link, a QR code, an \u201conboarding portal\u201d \u2014 anything that takes you away from the platform\u2019s messaging and onto their turf.',
        'Urgency and flattery together: \u201cwe need your answer today\u201d paired with praise for your content is a classic pressure cocktail.',
        'They ask for credentials or payments: no legitimate brand needs your password, your OTP, or a \u201crefundable deposit\u201d to send you free products.',
      ],
    },
    { type: 'h2', text: 'How to verify a brand before you engage' },
    {
      type: 'steps',
      items: [
        'Find the brand\u2019s official website yourself \u2014 type the domain, do not click their link \u2014 and use the contact details listed there to confirm the outreach is real.',
        'Check the sender\u2019s account age, follower quality, and posting history. Brand-new accounts with stock-photo aesthetics are a red flag.',
        'Never enter your social login on a page you reached through someone else\u2019s link. Real collaborations do not require you to log in to anything.',
        'Never scan QR codes from strangers, in DMs or email. If the \u201cagreement\u201d cannot be sent as a plain document, it is not an agreement.',
        'Turn on two-factor authentication with an authenticator app, and never share OTPs \u2014 any code sent \u201cby mistake\u201d is a takeover attempt.',
      ],
    },
    {
      type: 'callout',
      title: 'If you already clicked',
      text: 'Change your password immediately from the platform\u2019s official app or site, log out all other sessions, enable 2FA, scan your device for malware, and warn your followers \u2014 hijacked creator accounts are routinely used to scam the creator\u2019s audience next.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Can a real brand contact me through DMs?',
          a: 'Yes \u2014 small brands do scout in DMs. The difference is what happens next: a real brand will identify themselves, accept verification through their official channels, and never ask for your password, OTP, or a payment.',
        },
        {
          q: 'Are QR codes always dangerous?',
          a: 'No, but unsolicited ones are. A QR code on a restaurant table or a brand\u2019s official site is one thing; a QR code in a DM from a stranger offering you money is a delivery mechanism for a link you cannot inspect.',
        },
        {
          q: 'What if the brand has a professional-looking website?',
          a: 'Scammers build convincing sites, clone real brands\u2019 pages, and even run ads. Verify independently: contact the company through a channel you found yourself, and check domain registration dates when something feels off.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Earn without the DM roulette',
      text: 'Real brand work should never start with a suspicious link. Verified microtasks on eBizEarn list exactly what to do and how rewards work \u2014 no mystery DMs involved.',
      buttonText: 'Start earning',
      buttonHref: '/earn',
    },
  ],
};
