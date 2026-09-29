import { useCallback, useEffect, useState } from 'react';
import { useRegion } from '../context/RegionContext';
import {
  ensureFxRates,
  formatDisplayMoney,
  loadCachedFx,
  LEDGER_CURRENCY,
  type FxRates,
} from '../utils/currency';

/**
 * Currency-aware money formatting for dashboards (display layer only).
 *
 * - Reads the selected currency from RegionContext (the homepage region pick).
 * - Loads real daily USD→currency rates (cached 12h in localStorage, refreshed
 *   in the background from open.er-api.com).
 * - `fmt(cents)` returns the exact USD figure when the selected currency is
 *   USD, otherwise an `≈`-prefixed converted estimate; falls back to exact
 *   USD when rates are unavailable. Never fabricates a rate.
 */
export function useMoney() {
  const { region } = useRegion();
  const displayCurrency = region.currency;
  const [fx, setFx] = useState<FxRates | null>(() => loadCachedFx());

  useEffect(() => {
    let alive = true;
    ensureFxRates().then((r) => {
      if (alive && r) setFx(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const fmt = useCallback(
    (cents: number | null | undefined): string =>
      formatDisplayMoney(cents, displayCurrency, fx).text,
    [displayCurrency, fx],
  );

  const converted = displayCurrency !== LEDGER_CURRENCY && fx !== null;

  return { fmt, converted, displayCurrency, fxReady: fx !== null };
}
