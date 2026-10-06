import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sim-swap-attacks-targeting-online-earners',
  title: 'SIM Swap Scams: How Criminals Hijack Your Number for Cash',
  excerpt:
    'A SIM swap lets a thief take over your phone number without touching your phone. A fresh court case shows how the attack works \u2014 and how to stop it.',
  category: 'Safety',
  tags: ['safety', 'sim-swap', 'scams', '2fa', 'crypto', 'creators'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-04',
  updatedAt: '2026-10-04',
  readingMinutes: 6,
  heroImage: '/images/blog/sim-swap-attacks-targeting-online-earners.jpg',
  content: [
    {
      type: 'intro',
      text: 'Your phone number is the master key to your digital life \u2014 your email recovery, your social accounts, your payment apps, your exchange logins. And a criminal does not need to steal your phone to take it. In a SIM swap, the attacker convinces your mobile carrier to move your number onto their SIM card. From that moment, every SMS code meant for you lands in their hands: password resets, login confirmations, withdrawal approvals. This week, a New Zealand court sentenced a man who ran exactly this play, and the details show how exposed anyone earning online really is.',
    },
    { type: 'h2', text: 'A sentencing this week shows exactly how it works' },
    {
      type: 'p',
      text: 'In Auckland, 44-year-old Kiel MacGregor was sentenced for his role in an identity-theft ring that hijacked the phone numbers of customers of telecom provider Spark. The method was almost embarrassingly low-tech. MacGregor walked into Spark retail stores carrying an altered ID \u2014 a legitimate customer\u2019s details, but his own photo \u2014 and asked staff to transfer the victim\u2019s number to a new device he controlled. The staff, as the court heard, unwittingly helped him take over victims\u2019 phones.',
    },
    {
      type: 'p',
      text: 'The court documents lay out what happened next in plain language: \u201cAfter the victim\u2019s phone number is swapped to the offender\u2019s SIM, they receive authentication messages from the bank, allowing the transfer of large sums of money.\u201d From one victim alone, MacGregor moved $33,082 from a personal account and $11,241 from a company account \u2014 more than $44,000 \u2014 and then impersonated the man again, using selfies with the forged licence, to buy $31,300 in Bitcoin through a local cryptocurrency exchange. The offending began in October 2022, and the judge noted MacGregor was not even the mastermind: \u201cOther people had a far greater financial stake in what was going on.\u201d',
    },
    {
      type: 'p',
      text: 'He is far from the only example. In September 2026, cybersecurity firm Cyble flagged SIM swapping as one of the year\u2019s most damaging telecom attack patterns, noting that a single fraudulent number transfer bypasses almost every downstream security control at once. Cyble pointed to the case of Eric Council Jr., a 26-year-old from Alabama sentenced to 14 months in federal prison for his role in a SIM-swap scheme that took over an employee account tied to the SEC\u2019s official X account, where the attackers posted a fake Bitcoin ETF approval that briefly moved markets. And in April 2026, a New Zealand man lost signal at 1:30pm, received a text saying his number had been swapped to a new SIM, and watched criminals reset his internet banking password via SMS and nearly drain $20,000 \u2014 all inside a 15-minute window.',
    },
    { type: 'h2', text: 'The attack in four moves' },
    {
      type: 'steps',
      items: [
        'The harvest: the attacker collects your name, date of birth, phone number and ID details from data breaches, social media, or phishing. Creators and freelancers who publish a phone number for client work hand this over for free.',
        'The store call: posing as you, the attacker contacts your carrier \u2014 in person with a doctored ID, or by phone \u2014 and asks for a SIM replacement or number transfer. One distracted or careless agent is all it takes.',
        'The takeover: your phone silently loses service. You assume it is a network glitch. Meanwhile, every SMS verification code for your email, bank, exchange and social accounts arrives on the attacker\u2019s phone.',
        'The drain: password resets are requested and confirmed, withdrawal OTPs are intercepted, and funds \u2014 especially crypto, which cannot be charged back \u2014 are moved out before you realise anything happened.',
      ],
    },
    { type: 'h2', text: 'Why online earners are prime targets' },
    {
      type: 'p',
      text: 'Most people are bad targets because stealing their number yields a bank login and not much else. Online earners are different. Your phone number is often the recovery method for your email, which is the recovery method for everything else \u2014 a chain that ends at your earnings. If you get paid in USDT or other crypto, the payoff is instant and irreversible: there is no fraud department to reverse a blockchain transfer. A hijacked creator account is worth double \u2014 the attacker gets the wallet and then uses your trusted face to pitch fake giveaways to your followers, just as compromised brand accounts have been used to promote scam tokens. Only days ago, on 3 October, Microsoft confirmed that unknown attackers had seized its official X account to promote a fake \u201c$Clippy\u201d crypto token before the company regained control. If that can happen to a 13-million-follower corporate account, a solo earner\u2019s SMS-only security is a soft target.',
    },
    {
      type: 'list',
      items: [
        'Your number is public: clients, brands and collaborators often need your phone number \u2014 exactly the detail a SIM swapper needs.',
        'Your money is digital and instant: bank balances, mobile wallets and crypto payouts all unlock through the same SMS codes the attacker intercepts.',
        'Crypto payouts do not reverse: unlike a card chargeback, a drained wallet transfer is gone for good.',
        'Your audience is leverage: a hijacked account with followers becomes a launchpad for the next round of scams.',
      ],
    },
    { type: 'h2', text: 'How to lock your number down' },
    {
      type: 'steps',
      items: [
        'Put a PIN or lock on your carrier account: call your network provider and ask for a SIM-swap lock, port-out protection, or an account PIN that must be given before any SIM change. This is the single most effective defence against the in-store attack.',
        'Move your 2FA off SMS: wherever you are offered a choice between text-message codes and an authenticator app, always choose the app. Security guidance published in September 2026 put it bluntly: authenticator-app 2FA is your best protection against SIM swap attacks.',
        'Remove your phone number as a recovery option where you can: on your email and exchange accounts, replace SMS recovery with an authenticator app or hardware key, so a swapped number no longer equals a password reset.',
        'Keep a separate number for public contact: use one number on your profiles, invoices and client chats, and a private number \u2014 known only to your bank and carrier \u2014 for account security.',
        'Watch for the warning sign: a sudden, unexplained loss of mobile service is the signature symptom of a SIM swap in progress. Treat it as an emergency, not a network outage.',
      ],
    },
    {
      type: 'callout',
      title: 'If your phone suddenly loses signal',
      text: 'Contact your carrier immediately from another device and ask whether a SIM change was requested \u2014 if so, demand it be reversed now. Then, from a secure device, change the passwords on your email and exchange accounts, move 2FA to an authenticator app, and check for unrecognised logins, password-change emails, or withdrawals you did not make. Speed matters: in the reported cases, the money moved within minutes.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Does 2FA not protect me from this?',
          a: 'Only if it is not SMS-based. SMS two-factor authentication is exactly what a SIM swap defeats, because the codes arrive on the attacker\u2019s SIM. Authenticator apps and hardware keys generate codes locally on your device, so they keep working even if your number is stolen.',
        },
        {
          q: 'Can this happen on an eSIM too?',
          a: 'Yes. The attack targets your carrier account, not the physical SIM. Whether your number lives on plastic or an eSIM, anyone who convinces the carrier they are you can have the number reissued to a device they control.',
        },
        {
          q: 'My carrier asks for ID before a SIM swap. Am I safe?',
          a: 'Safer, but not safe. In the Auckland case the attacker walked into stores with an altered ID and staff still completed the swaps. Add your own carrier PIN or lock \u2014 do not rely on the agent\u2019s judgement alone.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Keep your earnings where they belong',
      text: 'Scams evolve, but verified work does not. eBizEarn microtasks spell out exactly what to do and how rewards work \u2014 with payouts you can secure properly.',
      buttonText: 'Start earning',
      buttonHref: '/earn',
    },
  ],
};
