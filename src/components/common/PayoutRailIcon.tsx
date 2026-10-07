import React from 'react';
import { Landmark } from 'lucide-react';

/**
 * Professional payout-rail brand marks (no emojis — Dawood's design rule).
 * Clean, recognizable glyphs in each rail's brand color.
 */
export type PayoutRailId = 'paypal' | 'wise' | 'bank' | 'usdt';

export const PAYOUT_RAILS: { id: PayoutRailId; label: string; fee: string }[] = [
  { id: 'paypal', label: 'PayPal', fee: '0% Fee' },
  { id: 'wise', label: 'Wise Transfer', fee: '0% Fee' },
  { id: 'bank', label: 'Direct Bank Transfer', fee: '0% Fee' },
  { id: 'usdt', label: 'USDT (TRC-20 / ERC-20)', fee: '0% Fee' },
];

export const PayoutRailIcon: React.FC<{ id: PayoutRailId; className?: string }> = ({ id, className = 'w-8 h-8' }) => {
  if (id === 'paypal') {
    return (
      <span
        className={`${className} rounded-xl bg-[#003087] text-white flex items-center justify-center font-black italic select-none`}
        style={{ fontSize: '1.1em' }}
        aria-label="PayPal"
        role="img"
      >
        P
      </span>
    );
  }
  if (id === 'wise') {
    return (
      <span
        className={`${className} rounded-xl bg-[#163300] text-[#9FE870] flex items-center justify-center font-black select-none`}
        style={{ fontSize: '1.1em' }}
        aria-label="Wise"
        role="img"
      >
        W
      </span>
    );
  }
  if (id === 'bank') {
    return (
      <span className={`${className} rounded-xl bg-slate-700 text-white flex items-center justify-center`} aria-label="Bank transfer" role="img">
        <Landmark className="w-3/5 h-3/5" />
      </span>
    );
  }
  // usdt
  return (
    <span
      className={`${className} rounded-xl bg-[#26A17B] text-white flex items-center justify-center font-black select-none`}
      style={{ fontSize: '1.1em' }}
      aria-label="USDT"
      role="img"
    >
      ₮
    </span>
  );
};
