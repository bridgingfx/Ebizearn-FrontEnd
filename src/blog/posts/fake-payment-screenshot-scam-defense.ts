import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'fake-payment-screenshot-scam-defense',
  title: 'A Screenshot Is Not Proof of Payment: Scam Defence Guide',
  excerpt:
    'Scammers forge payment screenshots in seconds with photo editors and spoof apps. Tell real payments from fakes — and why only your own balance counts.',
  category: 'Safety',
  tags: ['safety', 'scams', 'payments', 'freelancing'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-05',
  updatedAt: '2026-10-05',
  readingMinutes: 6,
  heroImage: '/images/blog/fake-payment-screenshot-scam-defense.jpg',
  content: [
    {
      type: 'intro',
      text: 'It looks exactly like a successful payment. The right app logo, the right layout, a transaction ID, the correct amount, your name spelled right. And it is worth absolutely nothing — because forging a payment screenshot takes less than a minute with a photo editor or a spoof app, and scammers have turned this trick into a whole economy. If you sell anything, take freelance work, or receive money outside a platform, this is the scam most likely to find you.',
    },
    { type: 'h2', text: 'How scammers fake payment proof' },
    {
      type: 'p',
      text: 'The methods are depressingly simple. Some fraudsters take a genuine receipt and alter the amount or date in a photo editor. Others use spoof payment apps that generate a complete fake "payment successful" screen from scratch — prank-style apps mimicking the interfaces of well-known payment apps can display a phony confirmation that looks completely legitimate. In one reported trend, download links for counterfeit payment apps circulated on messaging platforms for as little as the price of a cup of tea.',
    },
    {
      type: 'p',
      text: 'Fake apps can even scan a QR code and display a fraudulent confirmation, and some generate fake sound alerts to mimic the payment-confirmation chimes merchants rely on. The victim sees and hears payment — the bank balance never changes.',
    },
    { type: 'h2', text: 'Who gets targeted' },
    {
      type: 'p',
      text: 'The usual victims are people under time pressure: street vendors, small shop owners, and individual sellers on marketplace platforms who cannot stop to verify every transaction. But the scam has moved upmarket. Documented cases include freelancers and small businesses accepting fake payment proofs for invoices, and in one notable case in Mumbai, a used-car dealer lost ₹6.5 lakh after a buyer presented an edited bank confirmation slip — a paper printout, not even a screenshot.',
    },
    {
      type: 'p',
      text: 'Online earners face a specific version of this. A "client" found off-platform sends you a screenshot of a transfer before you start work — the deposit looks real, so you begin. It never clears, and you have done the work for nothing. In another variant, a fake employer sends a "salary confirmation" screenshot to make a job offer look legitimate, right before asking you for a deposit or fee.',
    },
    { type: 'h2', text: 'Why screenshots feel convincing' },
    {
      type: 'p',
      text: 'The trick works because it borrows trust from real things. The screenshot shows a genuine app interface — often a screen the scammer actually captured from their own real transaction, with only the recipient name or amount edited. Your brain sees a familiar logo and a completed status and stops asking questions, especially when the other person is rushing you. Scammers pair the image with urgency — "I have to leave now, just confirm" — because a person who checks their own balance ruins the whole act.',
    },
    { type: 'h2', text: 'The one rule: verify the money, not the picture' },
    {
      type: 'steps',
      items: [
        'Never start work or release anything based on a screenshot shown on someone else’s device. A screenshot is never proof of payment — only actual credit in your own account counts.',
        'Check your own balance directly in your bank or payment app. Do not trust forwarded notifications or confirmation sounds.',
        'On any task platform, keep payments inside the platform’s own system — escrow, milestone payments, official withdrawal flows. That is exactly what they exist for.',
        'Treat urgency as a warning sign. "Send the work now, the transfer is done, look at the screenshot" is the standard script.',
        'If a client claims to have paid and the money is not in your account, stop and re-verify before doing another minute of work. Real senders can wait ten minutes.',
      ],
    },
    {
      type: 'callout',
      title: 'Why platforms hold your earnings in-app',
      text: 'This is one reason legitimate earning platforms credit your balance inside the app first, with withdrawals as a separate step. Money you can see in your own balance — after you log in yourself — is money you can trust.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'What if the screenshot has a transaction ID?',
          a: 'Transaction IDs can be copied from real receipts or invented entirely. A transaction ID on an image proves nothing until your own bank or wallet shows the corresponding credit.',
        },
        {
          q: 'Can payment apps detect fakes for me?',
          a: 'No app can verify a picture someone else shows you. Only the app on your own device, showing your own balance, is authoritative.',
        },
        {
          q: 'Should I report fake-payment attempts?',
          a: 'Yes. Report the user on the platform where you found them, and if you lost money, report it to your bank and local cybercrime authorities quickly — the first hours matter most for recovering transfers.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Earn where payments are protected',
      text: 'Verified tasks with in-app balances mean you never have to guess whether you were paid. Start with protected earning.',
      buttonText: 'Browse tasks',
      buttonHref: '/earn',
    },
  ],
};
