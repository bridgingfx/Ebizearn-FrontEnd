import { api, type ApiResponse } from './client';

/** Task History filter tabs (GET /staff/task-history?status=). */
export type TaskHistoryFilter =
  | 'all' | 'in_progress' | 'in_review' | 'action_required' | 'approved' | 'rejected' | 'expired'
  | 'pending_duration' | 'reverification_required' | 'released' | 'refunded';

/** Reward after approval: held for the task duration, then released or refunded to the funder. */
export type RewardStatus = 'pending_duration' | 'reverification_required' | 'released' | 'refunded';

/** One automatic / final / manual verification attempt. */
export interface PostVerificationRecord {
  id: number;
  stage: 'initial' | 'final' | 'manual';
  outcome: 'verified' | 'failed' | 'inconclusive' | 'skipped';
  reason: string | null;
  api_checks_json: { outcome?: string; error?: string | null; account_connected?: boolean; post_found?: boolean; account_match?: boolean; published_after_start?: boolean; caption_score?: number | null; caption_match?: boolean | null } | null;
  ai_json: { available?: boolean; model?: string | null; is_proof?: boolean | null; confidence?: number; matches_api_post?: boolean | null; looks_fake?: boolean; issues?: string[]; summary?: string; error?: string | null } | null;
  api_meta_json: { id?: string; permalink?: string; timestamp?: string; username?: string; media_type?: string; caption?: string } | null;
  checked_at: string;
  actor?: { id: number; name: string; role: string } | null;
}

/** One row: a contributor who took a task, and where it stands. */
export interface TaskHistoryRow {
  id: number;
  /** Submission status when proof was sent, else the assignment status (in_progress, expired…). */
  status: string;
  assignment_status: string;
  started_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  user: { id: number; name: string; email: string; country_code: string | null; avatar_url: string | null } | null;
  task: { id: number; uuid: string; title: string; platform: string | null; reward_cents: number; business: string | null } | null;
  submission_id: number | null;
  reward_status: RewardStatus | null;
  final_check_due_at: string | null;
  auto_verify_status: 'pending' | 'running' | 'done' | null;
  proof: { has_link: boolean; images: number; videos: number; thumb: string | null };
}

export interface TaskHistoryList {
  success: boolean;
  data: TaskHistoryRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    counts: Record<TaskHistoryFilter, number>;
    totals: { pending_cents: number; released_cents: number; refunded_cents: number };
  };
}

export interface ProofFile {
  id: number;
  file_type: string;
  file_url: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface CampaignMediaItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  mime_type: string | null;
  size_bytes: number;
  original_name: string | null;
  created_at: string;
}

/** GET /staff/task-history/{id} — everything about one taken task. */
export interface TaskHistoryDetail {
  status: string;
  /** What staff can do with the reward now. */
  reward_actions: ('verify' | 'release' | 'refund' | 'recheck')[];
  funding: { type: string | null; user: { id: number; name: string; email: string; role: string } | null; wallet_id: number | null; reference: string | null } | null;
  ledger: { id: number; wallet_id: number; type: string; amount_cents: number; description: string | null; created_at: string; wallet_owner: { id: number; name: string; role: string } | null }[];
  instagram: { handle: string; connected_via: string; status: string; scopes: string | null; expires_at: string | null; token_expired: boolean; last_check_at: string | null; note: string | null } | null;
  next_decisions: ('approved' | 'rejected' | 'action_required')[];
  reason_codes: Record<'approved' | 'rejected' | 'action_required', string[]>;
  assignment: {
    id: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    reserved_until: string | null;
    created_at: string;
    content: string | null;
    task: {
      id: number;
      uuid: string;
      title: string;
      platform: string | null;
      instructions: string | null;
      reward_cents: number;
      estimated_minutes: number;
      slots_total: number;
      slots_taken: number;
      status: string;
      proof_required_json: Record<string, unknown> | string[] | null;
      category?: { id: number; name: string } | null;
      campaign?: {
        id: number;
        uuid: string;
        title: string;
        description: string | null;
        target_url: string | null;
        platform: string | null;
        status: string;
        content_image_url: string | null;
        business?: { id: number; uuid: string; company_name: string; owner_id: number } | null;
        media?: CampaignMediaItem[];
      } | null;
    } | null;
    user: {
      id: number;
      uuid: string;
      name: string;
      email: string;
      role: string;
      status: string;
      created_at: string;
      profile?: {
        country_code: string | null;
        avatar_url: string | null;
        contributor_level?: string | null;
        approval_rate?: number | string | null;
        completed_tasks_count?: number | null;
        fraud_score?: number | null;
        kyc_status?: string | null;
      } | null;
      wallet?: { available_balance_cents: number; pending_balance_cents: number; currency: string } | null;
    } | null;
  };
  submission: {
    id: number;
    uuid: string;
    status: string;
    verification_stage: string | null;
    proof_data_json: { url?: string; text_answer?: string; note?: string; device?: string; location?: string } | null;
    review_notes: string | null;
    review_reason_code: string | null;
    reviewed_at: string | null;
    bonus_cents: number | null;
    business_decision: 'approved' | 'rejected' | null;
    reward_status: RewardStatus | null;
    auto_verify_status: string | null;
    final_check_due_at: string | null;
    final_check_attempts: number;
    final_checked_at: string | null;
    platform_media_id: string | null;
    platform_post_url: string | null;
    platform_posted_at: string | null;
    post_verifications?: PostVerificationRecord[];
    business_reason: string | null;
    created_at: string;
    files: ProofFile[];
    reviewer?: { id: number; name: string; role: string } | null;
    business_reviewer?: { id: number; name: string } | null;
    ai_result?: { confidence_score: number | null; risk_score: number | null; suggested_decision: string | null; analysis_summary: string | null } | null;
  } | null;
  timeline: { id: number; action: string; created_at: string; actor?: { id: number; name: string; role: string } | null; after_state_json?: Record<string, unknown> | null }[];
}

export const taskHistoryApi = {
  list: (params: { status?: TaskHistoryFilter; search?: string; platform?: string; from?: string; to?: string; page?: number }) =>
    api
      .get<TaskHistoryList>('/staff/task-history', { params: { ...params, status: params.status === 'all' ? undefined : params.status } })
      .then((r) => r.data),
  show: (id: number | string) => api.get<ApiResponse<TaskHistoryDetail>>(`/staff/task-history/${id}`).then((r) => r.data),
  /** Release / refund / re-check the pending reward, or re-run the automatic proof check. */
  rewardAction: (assignmentId: number | string, action: 'verify' | 'release' | 'refund' | 'recheck', note?: string) =>
    api.post<ApiResponse<null>>(`/staff/task-history/${assignmentId}/reward`, { action, note }).then((r) => r.data),
  /** Same endpoint as the Verification Center — rewards and reversals stay on the ledger. */
  decide: (submissionId: number, payload: { decision: 'approved' | 'rejected' | 'action_required'; reason_code: string; notes: string }) =>
    api.post<ApiResponse<unknown>>(`/admin/submissions/${submissionId}/decision`, payload).then((r) => r.data),
};

/** Staff (edit_campaigns): campaign photos & videos shown on the task page. */
export const campaignMediaApi = {
  list: (campaignId: number | string) =>
    api.get<ApiResponse<CampaignMediaItem[]>>(`/staff/campaigns/${campaignId}/media`).then((r) => r.data),
  upload: (campaignId: number | string, files: File[], onProgress?: (pct: number) => void) => {
    const body = new FormData();
    files.forEach((f) => body.append('files[]', f));
    return api
      .post<ApiResponse<CampaignMediaItem[]>>(`/staff/campaigns/${campaignId}/media`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      })
      .then((r) => r.data);
  },
  remove: (campaignId: number | string, mediaId: number) =>
    api.delete<ApiResponse<CampaignMediaItem[]>>(`/staff/campaigns/${campaignId}/media/${mediaId}`).then((r) => r.data),
};
