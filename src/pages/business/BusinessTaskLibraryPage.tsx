import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Clock,
  Video,
  MessageSquare,
  Share2,
  Smartphone,
  MessagesSquare,
  AtSign,
  Tag,
  Megaphone,
  ClipboardCheck,
} from 'lucide-react';

/**
 * Task recipes — content templates only. No performance claims: pass rates,
 * budgets and "top trending" labels require real campaign data and are not
 * shown here. Every template opens the real campaign wizard pre-filled.
 */
interface TaskTemplate {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  duration: string;
  suggestedReward: string;
  templateKey: string;
}

const templates: TaskTemplate[] = [
  {
    name: 'Instagram Story Share',
    icon: Share2,
    description: 'Ask contributors to share your story, post, or reel to their followers.',
    duration: '2–5 min',
    suggestedReward: '$0.10 – $0.30',
    templateKey: 'share',
  },
  {
    name: 'TikTok Video / Duet',
    icon: Video,
    description: 'Contributors create or duet a short video featuring your brand.',
    duration: '10–20 min',
    suggestedReward: 'Custom (UGC pricing)',
    templateKey: 'tiktok',
  },
  {
    name: 'YouTube Comment',
    icon: MessageSquare,
    description: 'Leave a genuine comment on a video to drive engagement.',
    duration: '2–3 min',
    suggestedReward: '$0.20 platform minimum',
    templateKey: 'comment',
  },
  {
    name: 'App Testing',
    icon: Smartphone,
    description: 'Install an app, complete a short flow, and report any issues.',
    duration: '10–15 min',
    suggestedReward: 'Custom',
    templateKey: 'app',
  },
  {
    name: 'WhatsApp Status Share',
    icon: MessagesSquare,
    description: 'Share a brand visual to a personal WhatsApp status.',
    duration: '2–4 min',
    suggestedReward: '$0.10 – $0.30',
    templateKey: 'whatsapp',
  },
  {
    name: 'X Repost & Reply',
    icon: AtSign,
    description: 'Repost brand content and reply with a genuine comment.',
    duration: '3–5 min',
    suggestedReward: '$0.10 – $0.30',
    templateKey: 'share',
  },
  {
    name: 'Google Business Review',
    icon: Tag,
    description: 'Leave an honest review on your Google Business profile.',
    duration: '3–5 min',
    suggestedReward: '$0.20 – $2.00',
    templateKey: 'review',
  },
  {
    name: 'Survey / Feedback Form',
    icon: ClipboardCheck,
    description: 'Fill out a short survey or feedback questionnaire.',
    duration: '5–10 min',
    suggestedReward: '$0.20 – $2.00',
    templateKey: 'survey',
  },
];

export const BusinessTaskLibraryPage: React.FC = () => {
  const navigate = useNavigate();

  const applyTemplate = (t: TaskTemplate) => {
    navigate(`/business/campaigns/create?template=${encodeURIComponent(t.templateKey)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Task Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Proven task recipes to jump-start your campaign. Every template opens the real wizard — nothing is
            pre-published, and reward ranges are guides, not guarantees.
          </p>
        </div>
        <Link
          to="/business/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#168BFF] hover:bg-[#1275DD] text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <Megaphone className="w-4 h-4" />
          <span>Start from scratch</span>
        </Link>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <div
            key={t.name}
            className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs p-5 flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#168BFF]/10 text-[#168BFF]">
                <t.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{t.name}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{t.description}</p>
            <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 mb-4">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {t.duration}
              </span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{t.suggestedReward}</span>
            </div>
            <button
              type="button"
              onClick={() => applyTemplate(t)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#07182F] hover:bg-[#168BFF] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Use This Template <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-[#168BFF] mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <p className="font-bold mb-1">How templates work</p>
          <p>
            A template pre-selects the closest matching task type in the campaign wizard. You still write your
            own instructions, set the reward (minimum $0.20 per task), and launch with a real budget hold.
            Reward guides above come from the platform pricing policy; actual earnings depend on your settings.
          </p>
        </div>
      </div>
    </div>
  );
};
