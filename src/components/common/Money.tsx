import React from 'react';
import { useMoney } from '../../hooks/useMoney';

/**
 * Currency-aware money display (display layer only — ledger stays in USD).
 *
 * Renders the exact USD figure when the user's selected currency is USD,
 * otherwise an `≈`-prefixed estimate converted at today's rate. Amounts are
 * marked `notranslate` so machine translation never garbles figures.
 */
export const Money: React.FC<{ cents: number | null | undefined; className?: string }> = ({
  cents,
  className,
}) => {
  const { fmt, converted } = useMoney();
  return (
    <span
      className={`notranslate tabular-nums ${className ?? ''}`}
      translate="no"
      title={
        converted
          ? 'Approximate — converted from USD at today\u2019s rate. Payouts settle in USD.'
          : 'US dollars'
      }
    >
      {fmt(cents)}
    </span>
  );
};

/**
 * Honest one-line note shown near wallet totals when the display currency
 * is not USD. Renders nothing when amounts are exact USD.
 */
export const FxNote: React.FC<{ className?: string }> = ({ className }) => {
  const { converted } = useMoney();
  if (!converted) return null;
  return (
    <p className={`text-[11px] text-slate-400 dark:text-gray-500 ${className ?? ''}`}>
      Converted from USD at today&rsquo;s rate — actual payouts settle in USD.
    </p>
  );
};
