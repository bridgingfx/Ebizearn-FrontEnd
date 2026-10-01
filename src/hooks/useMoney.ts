import { useCallback } from 'react';
import { formatExactUsd, LEDGER_CURRENCY } from '../utils/currency';

/**
 * Money formatting for dashboards. Every amount on the site is shown in USD
 * (the ledger and payout currency) — there is no currency picker, so page
 * copy and dashboard figures always agree.
 */
export function useMoney() {
  const fmt = useCallback(
    (cents: number | null | undefined): string => formatExactUsd(Number(cents || 0)),
    [],
  );

  return { fmt, converted: false, displayCurrency: LEDGER_CURRENCY, fxReady: true };
}
