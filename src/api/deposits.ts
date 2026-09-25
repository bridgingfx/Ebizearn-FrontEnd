import { api, type ApiResponse } from './client';

export type DepositMethodKey = 'card' | 'crypto' | 'bank' | 'email';
export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositMethod {
  id?: number;
  key: DepositMethodKey;
  title: string;
  is_active?: boolean;
  instructions: string | null;
  details: Record<string, string> | null;
  min_amount_cents: number;
  max_amount_cents: number | null;
}

export interface DepositRequest {
  id: number;
  uuid: string;
  user_id: number;
  method: DepositMethodKey;
  amount_cents: number;
  currency: string;
  reference: string | null;
  note: string | null;
  status: DepositStatus;
  has_proof: boolean;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string; business?: { company_name: string } | null };
  reviewer?: { id: number; name: string } | null;
}

export interface WalletTxn {
  id: number;
  type: string;
  amount_cents: number;
  balance_after_cents: number;
  currency: string;
  description: string;
  created_at: string;
}

export interface BusinessDepositsOverview {
  wallet: { id: number; currency: string; available_balance_cents: number; pending_balance_cents: number };
  deposits: DepositRequest[];
  transactions: WalletTxn[];
}

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>) => p.then((r) => r.data);

/** Business → Billing. */
export const depositsApi = {
  methods: () => unwrap(api.get<ApiResponse<DepositMethod[]>>('/business/deposit-methods')),
  overview: () => unwrap(api.get<ApiResponse<BusinessDepositsOverview>>('/business/deposits')),
  create: (input: { method: DepositMethodKey; amount: string; reference?: string; note?: string; proof?: File | null }) => {
    const form = new FormData();
    form.append('method', input.method);
    form.append('amount', input.amount);
    if (input.reference) form.append('reference', input.reference);
    if (input.note) form.append('note', input.note);
    if (input.proof) form.append('proof', input.proof);
    return unwrap(api.post<ApiResponse<DepositRequest>>('/business/deposits', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
};

/** Staff review + Super Admin method settings. */
export const staffDepositsApi = {
  list: (params: { status?: DepositStatus | 'all'; search?: string; page?: number }) =>
    api
      .get<ApiResponse<DepositRequest[]> & { meta: { total: number; last_page: number; pending: number; pending_amount_cents: number } }>('/admin/deposits', { params })
      .then((r) => r.data),
  proof: (id: number) => api.get<Blob>(`/admin/deposits/${id}/proof`, { responseType: 'blob' }).then((r) => r.data),
  decide: (id: number, decision: 'approve' | 'reject', extra: { note?: string; amount?: string } = {}) =>
    unwrap(api.post<ApiResponse<DepositRequest>>(`/admin/deposits/${id}/decision`, { decision, ...extra })),
  methods: () => unwrap(api.get<ApiResponse<DepositMethod[]>>('/admin/deposit-methods')),
  updateMethod: (
    key: DepositMethodKey,
    input: { is_active: boolean; title: string; instructions: string; details: Record<string, string>; min_amount: string; max_amount: string },
  ) => unwrap(api.put<ApiResponse<DepositMethod>>(`/admin/deposit-methods/${key}`, { ...input, max_amount: input.max_amount || null })),
};

export const formatUsd = (cents: number, currency = 'USD') =>
  `${currency} ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
