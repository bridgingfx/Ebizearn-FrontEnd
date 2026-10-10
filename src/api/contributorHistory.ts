import { api, type ApiResponse } from './client';

export type ContributorHistoryFilter = 'all' | 'in_progress' | 'in_review' | 'pending_reward' | 'completed' | 'rejected' | 'expired';

/** One task the signed-in contributor took (GET /contributor/task-history). */
export interface ContributorHistoryRow {
  id: number;
  status: string;
  reward_status: string | null;
  started_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  final_check_due_at: string | null;
  task: { id: number; uuid: string; title: string; category: string | null; platform: string | null; reward_cents: number; brand: string | null } | null;
  proof: { has_link: boolean; files: number; thumb: string | null };
}

export interface ContributorHistoryEvent {
  at: string;
  kind: 'started' | 'submitted' | 'evidence' | 'verification' | 'business' | 'decision' | 'payment' | 'scheduled' | 'refund' | 'expired' | 'final';
  title: string;
  detail: string | null;
  tone: 'info' | 'success' | 'warning' | 'danger' | 'muted';
}

/** GET /contributor/task-history/{id} — own task only. */
export interface ContributorHistoryDetail {
  id: number;
  status: string;
  reward_status: string | null;
  task: {
    id: number; uuid: string; title: string; category: string | null; platform: string | null; reward_cents: number;
    duration_days: number; instructions: string | null; description: string | null; target_url: string | null;
    proof_required: Record<string, unknown> | string[] | null; brand: string | null; still_available: boolean;
  } | null;
  submission: {
    id: number; status: string; submitted_at: string; reviewed_at: string | null; review_notes: string | null;
    proof: { url?: string; text_answer?: string; note?: string };
    files: { id: number; url: string; mime_type: string | null; uploaded_at: string | null }[];
    reward_status: string | null; final_check_due_at: string | null; post_url: string | null;
  } | null;
  ledger: { type: string; amount_cents: number; description: string | null; created_at: string }[];
  timeline: ContributorHistoryEvent[];
}

export const contributorHistoryApi = {
  list: (params: { status?: ContributorHistoryFilter; search?: string; page?: number }) =>
    api
      .get<{ success: boolean; data: ContributorHistoryRow[]; meta: { current_page: number; last_page: number; total: number; counts: Record<ContributorHistoryFilter, number> } }>(
        '/contributor/task-history',
        { params: { ...params, status: params.status === 'all' ? undefined : params.status } },
      )
      .then((r) => r.data),
  show: (id: number | string) => api.get<ApiResponse<ContributorHistoryDetail>>(`/contributor/task-history/${id}`).then((r) => r.data),
};
