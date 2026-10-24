import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'crypto-payout-off-ramp-costs-freelancers',
  title: 'Paid in Crypto for Gig Work? The Off-Ramp Takes Its Cut',
  excerpt:
    'Stablecoin payouts settle in seconds — but your rent is not payable in USDT. Spreads, thin FX pairs and off-ramp fees eat crypto earnings before they land.',
  category: 'Payments & Withdrawals',
  tags: ['payments', 'crypto', 'stablecoins', 'freelancers', 'cross-border', 'fees'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-24',
  updatedAt: '2026-10-24',
  readingMinutes: 6,
  heroImage: '/images/blog/crypto-payout-off-ramp-costs-freelancers.jpg',
  content: [
    {
      type: 'intro',
      text: 'Getting paid in crypto sounds like the future of cross-border work: no banks, no wire fees, money arriving in seconds. A USDC or USDT transfer really does settle on-chain within seconds. But settlement is not spendability. Your landlord does not take USDT, the school fees desk does not take USDC, and the moment you convert crypto into money you can actually spend, a whole chain of costs appears that the wallet never shows you.',
    },
    { type: 'h2', text: 'Finality is not the same as spendable money' },
    {
      type: 'p',
      text: 'TechCabal put it plainly this week: the blockchain gives you finality, but it does not give you naira, shillings, or cedis. Every cross-border payment does three jobs — messaging, compliance, and settlement into locally spendable money. Stablecoins handle the first job well and make the second no easier. On the third, someone has to buy your dollars and deliver local currency — and that someone charges.',
    },
    {
      type: 'p',
      text: 'The real cost sits in foreign exchange. Converting a dollar stablecoin into a local currency requires a counterparty who holds that currency, wants dollars, and can trade at that moment in that size. Outside a handful of the largest markets, that trading pair is thin. Thin pairs produce slippage: the gap between the price you are quoted and the price you actually get, as a larger order eats through the best offers and fills at progressively worse ones. Across the CFA franc region, at typical transfers of $100,000, spread, slippage, and payout fees together exceeded 8%, per TechCabal\'s reporting — and the haggling often happens over WhatsApp DMs and phone calls between treasury desks, which is negotiation, not a market.',
    },
    { type: 'h2', text: 'Where the costs hide' },
    {
      type: 'list',
      items: [
        'Conversion spreads: the quoted rate versus the rate you actually receive, widest on thin local-currency pairs.',
        'Off-ramp fees: P2P platforms and local brokers take their own cut on top of the spread, and larger amounts draw worse pricing.',
        'Slippage at size: a big payout eats through the available offers, so the average price drifts away from the headline quote.',
        'Compliance friction: vetted liquidity providers demand business verification checks; looser markets carry counterparty and fraud risk.',
        'Double conversion: if your local currency is not directly paired with dollars, the route may hop through a third currency — and each hop takes its cut.',
      ],
    },
    {
      type: 'p',
      text: 'None of this appears in the wallet screen. Your balance says $500 in USDT. The number that lands in your mobile-money account or bank is what matters, and the distance between those two numbers is the true cost of the payout — not the gas fee, which everyone talks about, but the off-ramp, which few people price in.',
    },
    { type: 'h2', text: 'How to price a crypto payout honestly' },
    {
      type: 'p',
      text: 'Before choosing crypto over a conventional payout route, do the arithmetic in full. Take the quoted conversion rate for your exact currency pair and amount — not the headline rate on a global chart. Add the platform or broker fee. Subtract a margin for slippage if your amount is large relative to the local market. Then compare against the alternatives: a wallet-to-wallet route, a bank transfer, or a platform payout like the new cross-border payout rails being built for creators.',
    },
    {
      type: 'p',
      text: 'Crypto payouts can still win — particularly where banks are slow, corridors are thin, or you genuinely want to hold dollar-denominated value for a while. The mistake is treating the on-chain speed as the total cost. The settlement is the easy part. The off-ramp is the business.',
    },
    { type: 'h2', text: 'A worked example of the hidden gap' },
    {
      type: 'p',
      text: 'Imagine a client pays you $500 in USDT for a week of gig work. The wallet shows $500. You convert through a local broker who quotes a rate 3% below the mid-market rate — that is $15 gone. The broker charges a 1.5% service fee — another $7.50. Because your amount is chunky relative to local liquidity, slippage trims a further 1% — $5. You have received $472.50 before any network fee. That is a 5.5% cost on a "free" payout. These figures are illustrative, not fixed; the point is that each layer is small and the total is not.',
    },
    {
      type: 'p',
      text: 'Compare that with the alternative the client might have used: a platform payout with a published 2–3% fee and a mid-market conversion. Sometimes crypto still wins — especially where the local banking corridor is broken or slow. Sometimes it loses badly, particularly in small currencies. The only way to know is to price the landing amount, every time, for your exact pair and amount.',
    },
    { type: 'h2', text: 'The compliance layer nobody warns you about' },
    {
      type: 'p',
      text: 'There is a further wrinkle on the supply side. The deepest liquidity pools only trade with businesses that have passed know-your-business checks — which keeps those pools clean and small. A lone freelancer cannot access them, so you end up in the looser end of the market: P2P platforms like Binance P2P, where more counterparties compete but some are payment processors whose compliance teams may not clear, and where mixing with unknown entities carries real risk. That is the trade-off you accept for instant settlement: professional-grade rates go to professional-grade counterparties, and individuals pay retail — in price, in risk, or in both.',
    },
    {
      type: 'callout',
      title: 'Count the landing amount, not the sent amount',
      text: 'A payout method is only as good as the money that reaches your spendable balance. Always compare routes by the final landing figure in your currency — quoted rate, fees, and conversion costs included — before choosing how to get paid.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Is getting paid in stablecoins cheaper than a bank wire?',
          a: 'Sometimes, but not automatically. The transfer itself may be near-free, but the conversion from a stablecoin into your spendable local currency carries spreads, slippage, and broker fees that can exceed the wire fee you were trying to avoid — especially on thin currency pairs.',
        },
        {
          q: 'What is slippage on an off-ramp?',
          a: 'The difference between the price you are quoted and the price you actually get. When a market is thin, a larger order consumes the best available offers and the rest fills at worse prices, so the average rate drifts against you.',
        },
        {
          q: 'Should I avoid crypto payouts entirely?',
          a: 'No — they are genuinely useful where banks are slow or corridors are limited, and for holding dollar value. Just price the full route: conversion spread, fees, and the final landing amount, not just the transfer speed.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Compare payout routes before you choose one',
      text: 'Clear payout schedules and known fees beat surprise costs every time. See how task earnings and withdrawals work on eBizEarn.',
      buttonText: 'Start earning',
      buttonHref: '/how-it-works',
    },
  ],
};
