import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  ShieldCheck,
  X,
  Wallet,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const BusinessBillingPage: React.FC = () => {
  const { user } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const wallet = user?.wallet;
  const balance =
    wallet && typeof wallet.available_balance_cents === 'number'
      ? `${wallet.currency || 'USD'} ${(wallet.available_balance_cents / 100).toFixed(2)}`
      : null;

  return (
    <div className="space-y-6 text-left font-sans max-w-6xl mx-auto">
      
      {/* =========================================================================
          1. HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-gray-100">
            Billing & Payments
          </h1>
          <p className="text-xs sm:text-sm text-[#475467] mt-0.5">
            Your campaign wallet. Payment methods and auto-reload are not connected yet — funding is handled manually.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDepositModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1277dc] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Funds to Wallet</span>
        </button>
      </div>

      {/* =========================================================================
          2. WALLET BALANCE & PAYMENT METHOD CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className="p-6 rounded-3xl bg-[#07182F] text-white border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#168BFF]/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Available Campaign Balance</span>
            <span className="w-2 h-2 rounded-full bg-gray-500" />
          </div>

          <div>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
              {balance || '—'}
            </span>
            <span className="text-xs text-gray-300 block mt-1">
              {balance
                ? 'Live balance from your account wallet.'
                : 'No wallet balance yet. Fund your account to launch campaigns.'}
            </span>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-400 dark:text-gray-500">Auto-reload not configured</span>
            <button
              type="button"
              onClick={() => setShowDepositModal(true)}
              className="text-[#20C4E8] font-bold hover:underline"
            >
              + Deposit
            </button>
          </div>
        </div>

        {/* Payment Method on File */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Primary Payment Method</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 text-[10px] font-bold">
              None
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black text-gray-900 dark:text-gray-100 block">No payment method on file</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Add a method to fund campaigns.</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowDepositModal(true)}
              className="text-[#168BFF] font-bold hover:underline"
            >
              Add Method
            </button>
            <span className="text-gray-400 dark:text-gray-500 text-[11px]">Self-service top-ups not connected</span>
          </div>
        </div>

        {/* Auto-Reload Setting */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0C1322] border border-[#E7ECF3] dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign Continuity</span>
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">Auto-Replenish</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Auto-reload becomes available once you add a payment method and fund your wallet.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-white/10 text-[11px] text-gray-400 dark:text-gray-500 font-bold">
            Not enabled
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. INVOICES & RECEIPTS HISTORY
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Tax Invoices & Receipts</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Official VAT / Tax receipts for corporate accounting and tax deductions</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
            <Receipt className="w-4 h-4" />
            0 Total Records
          </span>
        </div>
        <div className="p-6">
          <EmptyState
            icon={Wallet}
            title="No invoices yet"
            description="You haven't funded your account yet. Invoices and receipts will appear here automatically once real payments are processed."
          />
        </div>
      </div>

      {/* =========================================================================
          MODAL: DEPOSIT FUNDS
         ========================================================================= */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0C1322] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100">Add Campaign Funds</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong className="block mb-1">Online top-ups are not connected yet</strong>
              <p>
                Self-service wallet funding is not available right now. To fund your campaign
                account, please contact <strong>support@ebizearn.com</strong> and our team will
                assist you with a manual deposit.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDepositModal(false)}
              className="w-full py-3 rounded-xl bg-[#07182F] hover:bg-[#168BFF] text-white font-bold text-xs transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
