import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'youtube-view-count-change-earnings-2026',
  title: "YouTube Counts Views Differently Now — Here's What Changed",
  excerpt:
    'Since August 2026 YouTube counts a view from the first frame — but earnings still use engaged views. Why your view counter can jump while revenue stays flat.',
  category: 'YouTube',
  tags: ['youtube', 'monetization', 'analytics', 'shorts', 'earnings'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-07',
  updatedAt: '2026-10-07',
  readingMinutes: 6,
  heroImage: '/images/blog/youtube-view-count-change-earnings-2026.jpg',
  content: [
    {
      type: 'intro',
      text: 'If your YouTube view counts have looked unusually generous lately, you are not imagining it. On August 24, 2026, YouTube changed what a "view" means: a view now registers from the first frame on long-form video, Shorts, and live streams. Your public counter went up overnight. Your earnings did not — and that gap is confusing creators who check their analytics before their revenue reports. Here is what actually changed, and what to look at instead of the headline number.',
    },
    { type: 'h2', text: 'Two numbers, one word' },
    {
      type: 'p',
      text: 'YouTube now runs two parallel definitions. The public view counter — the number under your video and in basic analytics — counts a view almost immediately after playback starts. But Partner Programme earnings and eligibility are calculated from a stricter pair of metrics: engaged Shorts views and engaged watch hours. The public counter feeds neither number. So views can jump while revenue stays exactly where it was, and neither figure is "wrong" — they are measuring different things.',
    },
    {
      type: 'p',
      text: 'The same split applies to eligibility. Shorts monetisation now hinges on qualified Shorts views across a rolling 90-day window — not the raw counter you see on your channel page. A channel can look like it is exploding in public analytics while still sitting short of the threshold that actually pays.',
    },
    { type: 'h2', text: 'Why YouTube did this' },
    {
      type: 'p',
      text: 'The generous counter is really about competition. Short-form platforms have long disagreed about what counts as a view, and YouTube\'s first-frame definition puts its numbers in line with how casual browsing actually works: someone pauses, the video starts, that is a glance. The stricter "engaged" definition stays behind the paywall, because advertisers pay for attention, not glances. It is the same logic as a shop counting footfall at the door separately from counting paying customers at the till.',
    },
    { type: 'h2', text: 'What earners should watch instead' },
    {
      type: 'list',
      items: [
        'Engaged views and engaged watch hours in YouTube Studio (Earn section) — these are the numbers tied to your actual payouts.',
        'Watch time per view — if views rise but average watch time falls, your content is being glanced at, not watched. That is the signal to improve hooks, pacing, or titles rather than celebrating the counter.',
        'Audience retention curves on Shorts — with the new counting, the first three seconds look better on every video. The honest metric is how many viewers are still there at the end.',
        'Membership and Shopping tabs — YouTube has been rolling out recommended, exchange-rate-based membership prices, and ignoring them hands the pricing decision to a 60-day automatic timer. Set your own prices or consciously accept the defaults.',
      ],
    },
    { type: 'h2', text: 'The wider honesty lesson' },
    {
      type: 'p',
      text: 'This split between public metrics and money metrics is worth internalising, because it is everywhere in the creator economy. TikTok\'s "qualified views" for Creator Rewards are stricter than its public counters too. Instagram\'s Reels ad-revenue share pays on qualifying plays, not the view number under your Reel. Any time a platform shows you a big number for free and a smaller number for money, believe the smaller one — and build your plans around it.',
    },
    {
      type: 'p',
      text: 'It also explains why screenshots of view counts prove nothing about income. When you see a creator flaunting a view count as evidence of earnings, remember: since August, that number can include viewers who watched a single frame. Real revenue screenshots show the Earn tab, not the public counter — and even those can be faked, so treat every income claim with the same scepticism.',
    },
    {
      type: 'callout',
      title: 'Check the right tab',
      text: 'If you earn on YouTube, add a weekly habit: open Studio → Earn and compare your engaged views against your public view count. The gap between the two tells you more about your channel\'s real health than either number alone.',
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Did the view-count change increase my YouTube earnings?',
          a: 'No. Earnings are calculated from engaged views and engaged watch hours, which were not loosened. The public counter rising does not mean your revenue rises with it.',
        },
        {
          q: 'Should I still try to grow views?',
          a: 'Yes — but grow the right kind. Views that convert into watch time and engagement are what the monetisation engine actually counts. A smaller audience that watches beats a larger one that scrolls past.',
        },
        {
          q: 'What is the 60-day membership pricing timer?',
          a: 'YouTube now suggests exchange-rate-based membership prices per region. If you do nothing for 60 days, the suggested prices are applied automatically. Open Earn → Memberships and set your own prices, or deliberately accept the recommendations.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Learn the metrics that actually pay',
      text: 'Understanding platform analytics is a real, marketable skill. Start with verified YouTube engagement tasks and learn how the platform works from the inside.',
      buttonText: 'See how it works',
      buttonHref: '/how-it-works',
    },
  ],
};
