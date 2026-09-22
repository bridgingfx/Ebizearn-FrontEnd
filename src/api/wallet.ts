import { api } from './client';

export interface WithdrawPayload {
  amount_cents: number;
  payout_method: string;
  currency: string;
  payout_details: unknown;
}

export const walletApi = {
  /** GET /wallet — real wallet balances + min_withdrawal_cents from backend config. */
  index: () =>
    api.get('/wallet').then((r) => r.data as {
      success: boolean;
      data: { wallet: Record<string, unknown>; min_withdrawal_cents: number };
    }),
  transactions: () => api.get('/wallet/transactions').then((r) => r.data),
  withdraw: (payload: WithdrawPayload) => api.post('/wallet/withdraw', payload).then((r) => r.data),
};
