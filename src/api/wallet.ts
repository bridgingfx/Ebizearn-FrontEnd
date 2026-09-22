import { api } from './client';

export interface WithdrawPayload {
  amount_cents: number;
  payout_method: string;
  currency: string;
  payout_details: unknown;
}

export const walletApi = {
  transactions: () => api.get('/wallet/transactions').then((r) => r.data),
  withdraw: (payload: WithdrawPayload) => api.post('/wallet/withdraw', payload).then((r) => r.data),
};
