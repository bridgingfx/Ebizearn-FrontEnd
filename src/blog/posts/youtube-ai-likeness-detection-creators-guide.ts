import type { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'youtube-ai-likeness-detection-creators-guide',
  title: "YouTube's AI Likeness Detection: What Creators Must Do",
  excerpt:
    'YouTube is expanding likeness detection to voice and mobile. How creators can enrol, spot AI copies of their face and voice, and report misuse.',
  category: 'YouTube',
  tags: ['youtube', 'ai', 'deepfakes', 'likeness', 'creators'],
  author: 'eBizEarn Team',
  publishedAt: '2026-10-09',
  updatedAt: '2026-10-09',
  readingMinutes: 6,
  heroImage: '/images/blog/youtube-ai-likeness-detection-creators-guide.jpg',
  content: [
    {
      type: 'intro',
      text: 'Someone is using your face to sell crypto. You never filmed the video, never signed the deal, never said the words — but your audience sees you saying them. This is the deepfake economy in 2026, and it is no longer a problem reserved for celebrities. At its Made on YouTube event this month, YouTube announced it is fighting back by expanding its Likeness Detection tool: speaking-voice detection is coming later this year, and the whole system is heading to the mobile app. Here is what the tool actually does, who can use it, and the practical steps creators should take.',
    },
    { type: 'h2', text: 'What Likeness Detection does right now' },
    {
      type: 'p',
      text: 'The tool is simple in concept. You enrol with your face, and YouTube scans newly uploaded videos across the platform for AI-generated copies of your likeness — deepfakes, face swaps, and AI-altered footage that shows you doing or saying things you never did. When it finds a match, you get an alert and can review it in YouTube Studio. If the content is unauthorised, you decide what to do next, including requesting removal through YouTube\u2019s usual privacy complaint process.',
    },
    {
      type: 'p',
      text: 'The rollout has moved fast. The tool launched in late 2025 for Partner Programme members, was extended to politicians, officials, and journalists in March 2026, and is now open to all creators aged 18 and over. That widening matters: the first targets of cheap AI face-swaps are rarely the biggest channels. They are mid-sized creators whose audiences are loyal enough to trust a fake endorsement, but who cannot afford lawyers to chase every clone.',
    },
    { type: 'h2', text: 'What is new: voice and mobile' },
    {
      type: 'p',
      text: 'Two upgrades were announced this month. First, speaking-voice detection will be combined with facial detection later this year. YouTube says this will improve overall match accuracy and lay the groundwork for broader voice protections over time. Right now the tool scans for faces; a cloned voice alone must still be reported manually through the privacy complaint process. Voice closes the gap that clone farms have been exploiting: face-swap the likeness, keep the narration AI-generated, and dodge the current detector.',
    },
    {
      type: 'p',
      text: 'Second, Likeness Detection is coming to the YouTube mobile app. Creators will be able to enrol, receive match alerts, and act on them from their phones. Identity theft does not wait for you to sit at a desk, so neither should the response.',
    },
    { type: 'h2', text: 'How to enrol — and what you are handing over' },
    {
      type: 'p',
      text: 'Enrolment is deliberately strict. YouTube requires a government-issued ID and a selfie video to set up the face template. YouTube stores the selfie video, your legal name, and the likeness template for up to three years from your last sign-in. There is also an optional checkbox allowing YouTube to use your face and voice templates to develop and improve its detection models. Enrolling already constitutes consent for voice processing — YouTube notes it may later ask you to submit a voice reference to enable audio matching.',
    },
    {
      type: 'callout',
      title: 'Read the consent box twice',
      text: 'The ID-and-selfie requirement is what makes the tool hard to game, but it also means handing biometric data to a platform. Decide consciously: for creators whose face is their brand, the trade-off usually favours enrolling. For occasional uploaders, the privacy complaint route — which needs no enrolment — still works for realistic AI depictions of you, voice included.',
    },
    { type: 'h2', text: 'The enforcement climate around AI content is tightening' },
    {
      type: 'p',
      text: 'Likeness Detection did not arrive in a vacuum. In July, YouTube clarified its inauthentic content policy with three categories that lose monetisation: generic, templated content (including AI-generated video that adds no original perspective), emotionally manipulative or shock content, and AI personas posing as human experts on health, legal, financial, or political subjects. YouTube has named AI "doctors" and AI "lawyers" as examples. The platform is simultaneously inviting AI as a production tool — Gemini-assisted editing in Shorts and YouTube Create, AI comment moderation — and building guardrails against its misuse.',
    },
    {
      type: 'p',
      text: 'For anyone earning on YouTube, the message is clear: AI used transparently and with original input is welcome; AI used to fake identity or expertise is where the enforcement is heading. That distinction will shape what stays monetised in 2027.',
    },
    { type: 'h2', text: 'What to do this week' },
    {
      type: 'steps',
      items: [
        'Check whether you are eligible: open YouTube Studio and look for the likeness detection option. If you are 18 or older, you should be able to enrol.',
        'Prepare your documents: have a government-issued ID ready and record the selfie video exactly as instructed. Keep a note of when you enrolled — the data is kept up to three years from your last sign-in.',
        'Turn on match alerts and decide in advance how you will handle them. Not every match deserves a takedown — parody and commentary have their place — but scam endorsements and crypto pitches using your face do.',
        'Even without enrolling, know the reporting path: YouTube\u2019s privacy complaint form handles realistic AI depictions of you, including cloned voice. Bookmark it before you need it.',
        'Audit your own AI disclosures. Undisclosed photorealistic AI content in your uploads can be labelled automatically; disclosing at upload keeps you on the right side of the rules.',
      ],
    },
    {
      type: 'faq',
      items: [
        {
          q: 'Does Likeness Detection catch cloned voices today?',
          a: 'Not automatically. The tool currently scans newly uploaded videos for the faces of enrolled creators. A cloned voice without your face must be reported manually through the privacy complaint process. Combined voice and face detection is planned for later this year.',
        },
        {
          q: 'Do I need to enrol to report a deepfake of me?',
          a: 'No. YouTube\u2019s privacy complaint process covers realistic AI depictions of you — face and voice — without enrolment. Enrolment adds proactive scanning and alerts.',
        },
        {
          q: 'What happens to my ID and selfie video?',
          a: 'According to YouTube\u2019s help page, your selfie video, legal name, and likeness template are stored for up to three years from your last sign-in. You can optionally consent to their use in improving detection models.',
        },
        {
          q: 'Will this affect my own AI-assisted content?',
          a: 'Only if it is undisclosed or fakes identity. AI production tools like assisted editing are openly supported; the enforcement targets inauthentic content — templated AI video with no original perspective, shock content, and AI personas posing as experts.',
        },
      ],
    },
    {
      type: 'cta',
      heading: 'Protect the face that earns for you',
      text: 'Your identity is the asset behind everything you earn online. Learn how verified platforms work and how real earning mechanics operate.',
      buttonText: 'See how it works',
      buttonHref: '/how-it-works',
    },
  ],
};
