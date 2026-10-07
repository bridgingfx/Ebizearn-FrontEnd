/**
 * Campaign draft storage (2026-10-07).
 *
 * Drafts live in localStorage so an admin can start a campaign, close the
 * modal, and resume exactly where they left off. The modal auto-saves while
 * typing, and the campaigns page lists all drafts with resume/delete.
 */

export interface CampaignDraftData {
  businessId: string;
  title: string;
  objective: string;
  description: string;
  instructions: string;
  categoryId: string;
  taskTypeKey: string;
  platform: string;
  targetUrl: string;
  rewardUsd: string;
  contributors: string;
  minLevel: string;
}

export interface CampaignDraft {
  id: string;
  updatedAt: number;
  data: CampaignDraftData;
}

const KEY = 'ebizearn:campaign-drafts';
const MAX_DRAFTS = 20;

export const emptyDraftData = (): CampaignDraftData => ({
  businessId: '',
  title: '',
  objective: '',
  description: '',
  instructions: '',
  categoryId: '',
  taskTypeKey: '',
  platform: '',
  targetUrl: '',
  rewardUsd: '1.00',
  contributors: '10',
  minLevel: 'starter',
});

export function isDraftEmpty(d: CampaignDraftData): boolean {
  return (
    !d.title.trim() &&
    !d.objective.trim() &&
    !d.description.trim() &&
    !d.instructions.trim() &&
    !d.targetUrl.trim() &&
    !d.businessId &&
    !d.categoryId &&
    !d.taskTypeKey &&
    !d.platform
  );
}

function readAll(): CampaignDraft[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(drafts: CampaignDraft[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
  } catch {
    // Storage full or unavailable — drafts are a convenience, not critical.
  }
}

export function listDrafts(): CampaignDraft[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveDraft(data: CampaignDraftData, id?: string): CampaignDraft {
  const drafts = readAll();
  const now = Date.now();
  if (id) {
    const idx = drafts.findIndex((d) => d.id === id);
    if (idx >= 0) {
      drafts[idx] = { ...drafts[idx], updatedAt: now, data };
      writeAll(drafts);
      return drafts[idx];
    }
  }
  const draft: CampaignDraft = {
    id: id ?? `draft-${now}-${Math.random().toString(36).slice(2, 8)}`,
    updatedAt: now,
    data,
  };
  drafts.unshift(draft);
  writeAll(drafts);
  return draft;
}

export function deleteDraft(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id));
}

export function draftTitle(d: CampaignDraft): string {
  return d.data.title.trim() || 'Untitled campaign';
}
