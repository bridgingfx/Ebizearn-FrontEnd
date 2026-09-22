import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Search, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import type { User } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

/**
 * Wallet directory. There is no dedicated admin wallets endpoint — balances
 * shown here come from the `wallet` relation on GET /admin/users. This is
 * real data, honestly labeled; a dedicated wallets API is pending.
 */
export const AdminWalletsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.users();
      if (res.success) {
        setUsers(res.data || []);
      } else {
        setError(res.message || 'Could not load wallets.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not load wallets.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const wallets = useMemo(
    () =>
      users
        .filter((u) => u.wallet != null)
        .map((u) => ({
          user: u,
          available: u.wallet?.available_balance_cents || 0,
          pending: u.wallet?.pending_balance_cents || 0,
          lifetime: u.wallet?.lifetime_earnings_cents || 0,
          currency: u.wallet?.currency || 'USD',
        })),
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return wallets;
    return wallets.filter(
      (w) => (w.user.name || '').toLowerCase().includes(q) || (w.user.email || '').toLowerCase().includes(q),
    );
  }, [wallets, search]);

  const totals = useMemo(
    () => ({
      available: wallets.reduce((s, w) => s + w.available, 0),
      pending: wallets.reduce((s, w) => s + w.pending, 0),
    }),
    [wallets],
  );

  const fmt = (cents: number) => (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Wallets</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Balances served live from user accounts. A dedicated wallets API is pending — until then this is the
          honest source of truth.
        </p>
      </div>

      {/* Aggregate — derived from real balances only */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total available</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{fmt(totals.available)}</p>
        </div>
        <div className="bg-white dark:bg-[#0C1322] rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total pending</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{fmt(totals.pending)}</p>
        </div>
      </div>

      <div className="relative sm:w-72">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading wallets…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-red-700">Could not load wallets</p>
            <p className="text-red-600 mt-1">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 text-xs font-bold text-red-700 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Wallet}
          title={wallets.length === 0 ? 'No wallets yet' : 'No wallets match your search'}
          description={
            wallets.length === 0
              ? 'Wallets are created automatically with user accounts.'
              : 'Try a different search term.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/10">
                  <th className="py-3 px-4 font-bold">Account</th>
                  <th className="py-3 px-4 font-bold">Available</th>
                  <th className="py-3 px-4 font-bold">Pending</th>
                  <th className="py-3 px-4 font-bold">Lifetime earned</th>
                  <th className="py-3 px-4 font-bold text-right">Withdrawals</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{w.user.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{w.user.email}</p>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-gray-900 dark:text-gray-100">
                      {w.currency} {fmt(w.available)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {w.currency} {fmt(w.pending)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {w.currency} {fmt(w.lifetime)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/users?search=${encodeURIComponent(w.user.email || '')}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168BFF] hover:underline"
                      >
                        View user <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
