import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'ai-fake-payment-receipts-police-warning',
  title: 'Police Warn: AI-Generated Fake Payment Receipts on the Rise',
  excerpt:
    "Sri Lanka Police warned on 11 October 2026 about AI-generated fake payment receipts on WhatsApp. How the trick works — and the one habit that defeats it.",
  category: 'Safety',
  tags: ['safety', 'scams', 'payments', 'payouts', 'guide'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-17',
  updatedAt: '2026-10-17',
  readingMinutes: 6,
  heroImage: '/images/blog/ai-fake-payment-receipts-police-warning.jpg',
  content: [
    {
      type: 'intro',
      text: 'On 11 October 2026, Sri Lanka Police issued a public warning about a scam that should concern every online earner: fraudsters are using AI tools to generate convincing fake payment receipts, sending them to sellers over WhatsApp or Messenger, and pressuring them to hand over goods before anyone checks whether the money actually arrived. The receipt looks perfect — right account number, right time, right amount. It is completely fabricated.',
    },
    { type: 'h2', text: 'How the fake-receipt trick works' },
    {
      type: 'p',
      text: 'The setup is disarmingly ordinary. The scammer agrees to buy your product or service and chats like a normal customer. Then, instead of paying, they send a payment receipt through WhatsApp or Messenger claiming the money has been deposited. According to the police notice, these fraudulent receipts can contain seemingly accurate details — the account number, the transaction time, your name, the exact payment amount. Everything checks out at a glance, which is precisely the point.',
    },
    {
      type: 'p',
      text: 'Then comes the pressure. The scammer urges you to release the goods or deliver the service now — the "transfer is done", the screenshot proves it, why are you waiting? The urgency is the whole mechanism. If you hand over what you were selling before the money is actually in your account, there is nothing to recover: the receipt was never real.',
    },
    { type: 'h2', text: 'Why 2026 receipts are harder to catch' },
    {
      type: 'p',
      text: 'Five years ago, a fake receipt had tell-tale signs: wrong fonts, misaligned rows, a bank logo that looked slightly off. AI generation changed that. The tools now reproduce the layout, typography, and detail fields of real bank and wallet receipts with unnerving accuracy. Eyeballing a screenshot is no longer a verification method — it is a vulnerability. The police advice in this month\'s warning was blunt: confirm the payment has actually been credited to your own account before releasing anything.',
    },
    { type: 'h2', text: 'The same trick, aimed at online earners' },
    {
      type: 'p',
      text: 'Fake payment proof is not limited to shopkeepers. In the online-earning world, the mirror image of this scam is the fake "payout proof" screenshot: a platform — often one you have never heard of — shows you dazzling earnings screenshots to get you to deposit your own money first, or asks you to pay a "release fee" to withdraw your supposed earnings. Screenshots of profits supplied by the promoter were specifically flagged as a warning sign in this month\'s coverage of Meta\'s fraud takedown.',
    },
    {
      type: 'p',
      text: 'The pattern connects. Investigative reporting this month (Binance Square, 15 October 2026) noted that one of the largest victims of the recent Ledger wallet thefts was itself a "task scam" operator — people were paid to fake sales and reviews of real products, then shown negative balances and told to deposit their own money to receive payment. Fake earnings on a screen, real money out of your pocket: it is the same mechanism whether the screenshot shows a bank transfer or a task dashboard.',
    },
    { type: 'h2', text: 'The one habit that defeats it' },
    {
      type: 'steps',
      items: [
        'Open your own bank, wallet, or platform dashboard — the app you logged into yourself, not a link anyone sent you.',
        'Look at your actual balance and transaction list. A real credit appears there; a screenshot does not change this.',
        'Match the sender, the amount, and the reference against what you were told. All three must line up, not just the total.',
        'Wait for settlement. Some transfers show as pending first; treat pending money as money you do not have yet.',
        'Release the goods — or trust the payout — only after the credit is confirmed in your own account.',
      ],
    },
    { type: 'h2', text: 'The pressure script, and why "let\'s move to WhatsApp" matters' },
    {
      type: 'p',
      text: 'The pressure tactics described in the police warning follow a script. The scammer stays friendly right up until the receipt arrives, then flips to urgency: the driver is waiting, the transfer will reverse if you do not confirm, the goods are needed tonight. If you hesitate, they may send a second receipt, or a photo of a "bank officer" confirming it. Notice the pattern: every new piece of evidence arrives as an image. None of it ever arrives as money in your account. That asymmetry is the tell.',
    },
    {
      type: 'p',
      text: 'This is also why being moved off-platform is dangerous. On a marketplace with escrow or tracked payments, the fake receipt has nowhere to land. The scammer knows this — which is why "let\'s continue on WhatsApp" is almost always part of the script. Stay inside the platform\'s payment flow and the trick collapses before it starts.',
    },
    {
      type: 'list',
      items: [
        'Urgency is a red flag: anyone rushing you to act "before the payment reverses" wants you to skip verification.',
        'Receipts sent only as images, with no corresponding entry in your account, are worthless as proof.',
        'No legitimate buyer, platform, or employer ever needs your password, OTP, or a "release fee" to pay you.',
        'A buyer who refuses a video call and insists on text-only when large money is involved is hiding.',
        'If the deal moved off the platform to WhatsApp or Telegram, you have left every protection the platform offered.',
      ],
    },
    {
      type: 'callout',
      title: 'For eBizEarn contributors',
      text: 'Your eBizEarn rewards live in your own account dashboard and wallet — that is the only place that counts. A screenshot from anyone else, however official it looks, is not a payment. Earnings are never guaranteed, and no genuine payout ever asks you to pay first.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'The receipt shows my correct account number and name. Can it still be fake?',
          a: 'Yes. The police warning specifically notes that fake receipts can carry seemingly accurate details. Only a credit in your own account — checked in the app you opened yourself — counts as payment.',
        },
        {
          q: 'What should I do if I already released goods against a fake receipt?',
          a: 'Stop all contact with the buyer, preserve every message and the fake receipt, and file a report with your local police or cybercrime unit immediately. Then alert the platform where you met the buyer.',
        },
        {
          q: 'Does this apply to crypto payouts too?',
          a: 'Absolutely. A screenshot of a transaction is not a transaction. Check the receiving address on a block explorer or in your own wallet before treating anything as paid.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Earn where payouts are verifiable',
      text: 'eBizEarn rewards are tracked in your own dashboard and paid to your wallet — no screenshots, no release fees, no surprises.',
      buttonText: 'See how it works',
      buttonHref: '/how-it-works',
    },
  ],
};
