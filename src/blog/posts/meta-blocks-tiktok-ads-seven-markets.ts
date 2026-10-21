import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'meta-blocks-tiktok-ads-seven-markets',
  title: 'Meta Blocks Ads Pointing to TikTok in Seven Markets',
  excerpt:
    'Meta began blocking ads that send users to TikTok in seven countries on 8 October 2026. What is affected, what still works, and what creators should do now.',
  category: 'Facebook',
  tags: ['facebook', 'ads', 'tiktok', 'marketing', 'news'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-21',
  updatedAt: '2026-10-21',
  readingMinutes: 6,
  heroImage: '/images/blog/meta-blocks-tiktok-ads-seven-markets.jpg',
  content: [
    {
      type: 'intro',
      text: 'On 8 October 2026, Meta started refusing ads that point people toward TikTok. The ban covers Meta\u2019s own ad platforms in seven countries \u2014 and it reaches further than ByteDance\u2019s own campaigns. Any paid ad bought on Facebook or Instagram whose destination is TikTok or another ByteDance property in those markets can be blocked, even if the advertiser has nothing to do with ByteDance. For creators and small businesses who run paid campaigns across platforms, this is a rule worth understanding before the next budget goes in.',
    },
    { type: 'h2', text: 'What Meta actually blocked' },
    {
      type: 'p',
      text: 'The story broke via Bloomberg on 8 October and was confirmed the same day by a Meta spokesperson to Reuters. The restriction applies in seven markets: the United States, Canada, Egypt, Indonesia, Japan, Thailand and Vietnam. Europe is not covered for now, and Meta gave no timeline for any wider rollout.',
    },
    {
      type: 'p',
      text: 'The important detail is that the rule polices the destination URL, not the buyer. Ads purchased directly by ByteDance or TikTok are blocked, but so are third-party campaigns \u2014 from brands, agencies, or creators \u2014 that send users in those countries to TikTok or another ByteDance service. Meta began enforcing it immediately.',
    },
    {
      type: 'p',
      text: 'Meta did not hide the reasoning. A spokesperson, Chris Sgro, told Reuters: \u201cWe don\u2019t have to run ads from a competitor whose goal is to pull people off our apps.\u201d He described refusing a competitor\u2019s advertising as normal business practice. TikTok and ByteDance did not respond to comment requests.',
    },
    { type: 'h2', text: 'What is not affected' },
    {
      type: 'p',
      text: 'The ban is about paid advertising, and the line between paid and organic is what decides whether it touches you. An ordinary unpaid post on Facebook or Instagram that mentions TikTok is not blocked. A profile link to another platform\u2019s website is not blocked either, per Reuters. Using TikTok itself is completely unaffected.',
    },
    {
      type: 'p',
      text: 'There is also symmetry worth noting. Reuters pointed out that TikTok itself does not support links that open or sign users into other social apps, though profiles can still link to other platforms\u2019 websites. The two companies have been applying pressure to each other in both directions \u2014 last month, TikTok removed Instagram links from user profiles and rejected ads from Meta that asked TikTok to commit to child-safety concessions.',
    },
    { type: 'h2', text: 'Why creators who run paid campaigns should care' },
    {
      type: 'p',
      text: 'Many creators and small businesses run a cross-platform growth loop: paid campaigns on Meta\u2019s apps driving traffic to where their audience actually watches. If that destination is a TikTok profile, a TikTok video, or a TikTok Shop page \u2014 and the audience is in one of the seven affected markets \u2014 that campaign now falls inside the prohibition.',
    },
    {
      type: 'p',
      text: 'A brand running Instagram ads that end on its own website or shop is fine. The same brand running Instagram ads that end on its TikTok profile in the US, Canada, Egypt, Indonesia, Japan, Thailand or Vietnam is not. The campaigns most at risk are exactly the ones creator marketers buy: boosting a TikTok post through Meta\u2019s ad tools, or driving paid traffic from Instagram into a TikTok Shop launch.',
    },
    {
      type: 'p',
      text: 'For anyone operating across multiple countries, the fix starts with segmentation: separate campaigns targeting the seven affected markets from those targeting everywhere else, and check every destination URL before the budget goes live.',
    },
    {
      type: 'callout',
      title: 'Paid vs organic is the whole story',
      text: 'If no money changes hands for the placement, the rule does not apply. An unpaid post linking to TikTok is fine; a boosted one in the seven markets is not. Audit your ad accounts, not your posts.',
    },
    { type: 'h2', text: 'What to do if you run Meta ads today' },
    {
      type: 'steps',
      items: [
        'List every active Meta campaign and check the destination URL. Anything pointing at TikTok or a ByteDance property in the seven countries is at risk of rejection.',
        'Split your campaigns by geography: keep the seven affected markets in their own ad sets so one blocked destination cannot poison a worldwide campaign.',
        'For TikTok growth in those markets, shift spend to TikTok\u2019s own ad platform or to organic posting \u2014 unpaid content mentioning TikTok is untouched by this rule.',
        'If a campaign is rejected, do not resubmit the same destination hoping for a different reviewer. Change the landing page to your own website or a non-ByteDance destination first.',
        'Watch Meta\u2019s stated enforcement scope. For now Europe and the rest of the world are unaffected, but platform feuds like this tend to move, so re-check before each new campaign.',
      ],
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Which countries does the Meta TikTok ad ban cover?',
          a: 'Seven markets: the United States, Canada, Egypt, Indonesia, Japan, Thailand and Vietnam. The ban took effect on 8 October 2026, and Europe is not included for now.',
        },
        {
          q: 'Does the ban affect unpaid posts linking to TikTok?',
          a: 'No. The restriction covers paid advertising only. Ordinary unpaid posts on Facebook and Instagram that mention or link to TikTok are unaffected.',
        },
        {
          q: 'I am not affiliated with ByteDance. Can my ad still be blocked?',
          a: 'Yes, if the ad\u2019s destination is TikTok or another ByteDance property in one of the seven countries. The rule targets the destination URL, not the advertiser.',
        },
        {
          q: 'Why did Meta do this?',
          a: 'Meta framed it as a competitive decision. Spokesperson Chris Sgro said the company does not have to run ads from a competitor whose goal is to pull people off its apps.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Grow your earnings the transparent way',
      text: 'See how verified social tasks and rewards work on eBizEarn \u2014 no ad budgets, no platform feuds.',
      buttonText: 'How it works',
      buttonHref: '/how-it-works',
    },
  ],
};
