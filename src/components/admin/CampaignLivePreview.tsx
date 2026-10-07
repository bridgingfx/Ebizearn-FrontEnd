import React from 'react';
import { Building2, Users, Wallet, Eye } from 'lucide-react';
import { PlatformBrandIcon, platformKey } from '../common/PlatformBrandIcon';
import { fmtMoney } from '../common/ui';

/**
 * Live preview of the campaign being composed in CreateCampaignModal.
 * Updates instantly as the admin types — this is what a contributor will
 * see. The targeted social platform always shows its ORIGINAL brand icon
 * (Dawood 2026-10-07), never a generic icon.
 */
export interface CampaignPreviewData {
  title: string;
  objective: string;
  description: string;
  businessName: string;
  categoryName: string;
  taskTypeName: string;
  platform: string;
  platformLogoUrl?: string | null;
  platformBrandColor?: string | null;
  rewardCents: number;
  contributors: number;
  minLevel: string;
  totalCents: number;
}

export const CampaignLivePreview: React.FC<{ data: CampaignPreviewData }> = ({ data }) => {
  const key = platformKey(data.platform);
  const hasTitle = data.title.trim().length > 0;

  return (
    <div className="lg:sticky lg:top-0">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-[#168BFF]" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Live preview — what contributors see
        </h3>
      </div>

      <div className="rounded-2xl border border-[#E7ECF3] dark:border-white/10 bg-gray-50 dark:bg-white/5 overflow-hidden">
        {/* Platform banner with the ORIGINAL brand icon */}
        <div className="px-5 py-4 bg-white dark:bg-[#0C1322] border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
          {key || data.platformLogoUrl ? (
            <span className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0">
              <PlatformBrandIcon platform={data.platform} logoUrl={data.platformLogoUrl} brandColor={data.platformBrandColor} className="w-6 h-6" />
            </span>
          ) : (
            <span className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-gray-400 text-lg font-black">
              ?
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {key ? PLATFORM_LABEL[key] ?? data.platform : 'No platform selected'}
            </p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 truncate">
              {hasTitle ? data.title : 'Your campaign title appears here'}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {data.objective.trim() && (
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">“{data.objective}”</p>
          )}

          <div className="flex flex-wrap gap-2">
            {data.categoryName && (
              <span className="px-2.5 py-1 rounded-full bg-[#168BFF]/10 text-[#168BFF] text-[11px] font-bold">
                {data.categoryName}
              </span>
            )}
            {data.taskTypeName && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                {data.taskTypeName}
              </span>
            )}
            {data.minLevel && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold capitalize">
                {data.minLevel}+ level
              </span>
            )}
          </div>

          {data.description.trim() && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {data.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl bg-white dark:bg-[#0C1322] border border-gray-100 dark:border-white/10 px-3 py-2.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Reward</p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {data.rewardCents > 0 ? fmtMoney(data.rewardCents) : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0C1322] border border-gray-100 dark:border-white/10 px-3 py-2.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Spots</p>
              <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> {data.contributors > 0 ? data.contributors : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-white dark:bg-[#0C1322] border border-gray-100 dark:border-white/10 px-3 py-2.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Budget</p>
              <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                {data.totalCents > 0 ? fmtMoney(data.totalCents) : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              by <span className="font-bold text-gray-700 dark:text-gray-300">{data.businessName || '— select a business —'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span>Funded from the business wallet, held in escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
};
