import type { Campaign, Task, TaskSubmission } from '../types';

export const money = (cents = 0, currency = 'AED') => `${currency} ${(Number(cents || 0) / 100).toFixed(2)}`;

const detectPlatform = (value = '') => {
  const text = value.toLowerCase();
  if (text.includes('tiktok')) return 'TikTok';
  if (text.includes('youtube')) return 'YouTube';
  if (text.includes('facebook')) return 'Facebook';
  if (text.includes('whatsapp')) return 'WhatsApp';
  if (text.includes('trustpilot')) return 'Trustpilot';
  if (text.includes('review') || text.includes('google')) return 'Google Reviews';
  if (text.includes('linkedin')) return 'LinkedIn';
  return 'Instagram';
};

const formatDate = (value?: string) => {
  if (!value) return 'recently';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const mapTaskForUi = (task: Task) => {
  const categoryName = task.category?.name || task.category?.icon || task.campaign?.category?.name || 'Social Media';
  const platform = detectPlatform(`${task.title} ${categoryName} ${task.campaign?.title || ''}`);
  const campaign = task.campaign;

  return {
    ...task,
    platform,
    category: task.category?.slug || 'social',
    categoryName,
    description: campaign?.description || campaign?.objective || task.title,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    country: campaign?.target_countries_json?.join(', ') || 'Global',
    region: campaign?.target_countries_json?.join(', ') || 'Worldwide',
    emirateState: campaign?.target_countries_json?.[0] || 'Worldwide',
    cityArea: undefined,
    retentionHours: campaign?.retention_hours || 24,
    targetChannelType: undefined,
    targetChannelName: `${platform} verified post`,
    flyerUrl: '/assets/demo/task-creative.jpg',
    postCopy: campaign?.instructions_markdown || campaign?.description || task.title,
    hashtags: '#VerifiedBrandSponsor #EbizEarn',
    targetUrl: campaign?.business?.website || 'https://ebizearn.com',
    brandName: campaign?.business?.company_name || 'Ebiz Sponsor Client',
  };
};

export const mapCampaignForUi = (campaign: Campaign) => {
  const firstTask = campaign.tasks?.[0];
  const platform = detectPlatform(`${campaign.title} ${campaign.category?.name || ''} ${firstTask?.title || ''}`);
  const spentCents = Math.max(0, campaign.total_budget_cents - campaign.remaining_budget_cents);
  const statusMap: Record<string, string> = {
    active: 'Live',
    paused: 'Paused',
    completed: 'Completed',
    draft: 'Draft',
    cancelled: 'Cancelled',
  };

  return {
    ...campaign,
    id: String(campaign.id),
    rawId: campaign.id,
    title: campaign.title,
    brand: campaign.business?.company_name || 'Business Campaign',
    platform,
    status: statusMap[campaign.status] || campaign.status,
    totalBudget: money(campaign.total_budget_cents),
    spent: money(spentCents),
    reward: money(campaign.reward_per_task_cents),
    slotsTaken: campaign.completed_contributors_count || firstTask?.slots_taken || 0,
    slotsTotal: campaign.target_contributors_count || firstTask?.slots_total || 0,
    created: formatDate((campaign as any).created_at),
  };
};

export const mapSubmissionForUi = (submission: TaskSubmission) => {
  const task = submission.task;
  const campaign = task?.campaign;
  const contributorName = submission.user?.name || 'Contributor';
  const screenshot = submission.files?.find((file) => file.file_type === 'screenshot');

  return {
    id: submission.id,
    taskTitle: task?.title || `Task #${submission.task_id}`,
    campaignName: campaign?.title || 'Campaign',
    contributorName,
    contributorHandle: `@${contributorName.toLowerCase().replace(/\s+/g, '_')}`,
    contributorAvatar: submission.user?.profile?.avatar_url || '/assets/demo/avatar-1.jpg',
    submittedAt: formatDate(submission.created_at),
    status: submission.status,
    reward: money(task?.reward_cents || 0),
    screenshotUrl: screenshot?.file_url,
    postUrl: submission.proof_data_json?.url,
    note: submission.proof_data_json?.note,
    ai: {
      confidence: Math.round(submission.aiResult?.confidence_score || 0),
      suggestedDecision: submission.aiResult?.suggested_decision || 'flag',
      summary: submission.aiResult?.analysis_summary || 'Awaiting automated verification result.',
    },
  };
};
