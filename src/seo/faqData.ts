/**
 * Shared FAQ content — single source of truth for BOTH the visible accordion
 * UI and the FAQPage JSON-LD schema. Keep answers factual: no hype, no
 * invented statistics, no guaranteed earnings.
 */
export interface FaqItem {
  q: string;
  a: string;
}

/** Factual GEO Q&A shared across the homepage, /earn, and FAQ SEO. */
export const earnFaqs: FaqItem[] = [
  {
    q: 'What is eBizEarn?',
    a: 'eBizEarn is a social-media task marketplace at ebizearn.com. Businesses list verified promotional tasks, and contributors complete them on their phones — sharing a post, recording a short clip, or answering a survey — then submit screenshot or link proof to earn cash rewards.',
  },
  {
    q: 'Is eBizEarn free to join?',
    a: 'Yes. Joining eBizEarn as a contributor is 100% free. There are no registration fees, no deposits, and no paid plans required to access tasks or earn rewards.',
  },
  {
    q: 'How do I earn money on eBizEarn?',
    a: 'Browse the open task marketplace, pick a task, complete the action on your own social account, and submit proof. Once the proof is verified by AI and moderator review, the reward is credited to your wallet balance.',
  },
  {
    q: 'What is the minimum withdrawal amount?',
    a: 'You can withdraw once your wallet balance reaches $50.00 USD. Payouts go to PayPal, Wise, direct bank transfer, Revolut, USDT/USDC, or mobile money, depending on your region.',
  },
  {
    q: 'How much can I earn per task?',
    a: 'Earnings depend on task type and complexity — simple social tasks pay less than surveys, app tests, or UGC video clips. Each task shows its exact reward before you accept it, and earnings are never guaranteed.',
  },
];

/** Homepage FAQ — concise GEO-friendly definitions. */
export const homeFaqs: FaqItem[] = [
  {
    q: 'How do I earn money using my social media accounts?',
    a: 'Brands list verified social media tasks on eBizEarn (such as sharing a story with a brand sticker, doing a 15-second TikTok duet, or posting in a niche Facebook group). You choose any open task, complete it on your phone, upload a screenshot or live link as proof, and our automated AI verifies your submission in seconds to credit your wallet balance.',
  },
  {
    q: 'Do I need a large follower count or influencer status?',
    a: 'No. You do not need thousands of followers. Most tasks are designed for everyday social media users — brands want authentic word-of-mouth engagement and peer recommendations from genuine people, not just sponsored influencer posts.',
  },
  {
    q: 'Is eBizEarn 100% free? Are there any hidden fees?',
    a: 'eBizEarn is 100% free to join and will always remain free. We will never ask you for an upfront registration fee, membership fee, deposit, or account unlock charge. You complete tasks and earn real cash.',
  },
  {
    q: 'How fast can I cash out and what is the minimum payout?',
    a: 'The minimum withdrawal threshold is $50.00. You can cash out anytime directly to your PayPal, Wise transfer, direct bank account, Revolut, or digital currency (USDT/USDC). Payouts are processed reliably with double-entry ledger security.',
  },
  {
    q: 'How does AI proof verification work?',
    a: 'When you submit a screenshot, our proprietary computer vision algorithm checks the post timestamp, image dimensions, text content, and account handle in seconds. Once verified, funds transfer immediately into your available balance.',
  },
];

/** Full help-center FAQ (mirrors the /faq accordion content). */
export const faqPageFaqs: FaqItem[] = [
  {
    q: 'Is eBizEarn free?',
    a: 'Yes, 100% free for contributors. There are strictly NO registration fees, NO deposit requirements, NO $50 or $200 earning upgrade plans, and NO pay-to-work schemes. You sign up, complete tasks, and get paid.',
  },
  {
    q: 'How do I receive tasks?',
    a: 'Once you create an account and complete your basic onboarding preferences (country, language, and interests), available tasks from verified businesses will automatically populate in your dashboard.',
  },
  {
    q: 'How much can I earn?',
    a: 'Earnings depend on task complexity and your contributor tier. Simple social tasks range from $0.30 to $0.50, surveys $1.00 to $2.00, app testing $2.50 to $4.00, and UGC video clips $5.00 to $15.00+.',
  },
  {
    q: 'When do I get paid?',
    a: 'As soon as your task proof is verified by AI and moderator review, funds are instantly credited to your available wallet balance. You can withdraw anytime once your balance reaches $50.00 USD. Withdrawals are queued for manual processing.',
  },
  {
    q: 'Why did my task get rejected?',
    a: 'Tasks may be rejected if proof is missing, screenshots are cropped, timestamps do not match the campaign window, or if duplicate proofs are submitted. Moderators always provide an explicit audit reason.',
  },
  {
    q: 'Which countries are supported?',
    a: 'eBizEarn supports contributors in the UAE and worldwide. Campaign availability varies by region — check the open task marketplace for tasks available in your country.',
  },
  {
    q: 'How does verification work?',
    a: 'We use an automated AI vision pre-check that assesses screenshot resolution, timestamp authenticity, text relevance, and duplicate image hashing. Once pre-screened, our operations team conducts rapid final verification.',
  },
  {
    q: 'How do businesses create campaigns?',
    a: 'Businesses can create a business profile and use our 6-step self-serve campaign wizard to define objectives, select target geographies, set contributor requirements, fund the escrow budget, and launch in minutes.',
  },
  {
    q: 'How does eBizEarn prevent fraud?',
    a: 'We maintain multi-signal fraud scoring including duplicate screenshot hash matching, duplicate URL tracking, rapid-completion speed limits, IP/VPN anomaly detection, and account reliability ratings.',
  },
];
