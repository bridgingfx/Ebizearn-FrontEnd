import React, { useState } from 'react';
import { ArrowLeft, Bitcoin, Check, Copy, CreditCard, ExternalLink, Landmark, Loader2, Mail, Paperclip, X } from 'lucide-react';
import { depositsApi, formatUsd, getApiFieldErrors } from '../../api';
import type { DepositMethod, DepositMethodKey } from '../../api';

export const METHOD_ICONS: Record<DepositMethodKey, React.ElementType> = {
  card: CreditCard,
  crypto: Bitcoin,
  bank: Landmark,
  email: Mail,
};

const DETAIL_LABELS: Record<string, string> = {
  payment_link: 'Payment link',
  provider: 'Provider',
  currency: 'Currency',
  network: 'Network',
  wallet_address: 'Wallet address',
  bank_name: 'Bank',
  account_name: 'Account name',
  account_number: 'Account number',
  iban: 'IBAN',
  swift: 'SWIFT / BIC',
  branch: 'Branch',
  country: 'Country',
  contact_email: 'Finance email',
};

const inputClass =
  'w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

const CopyRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the value is visible anyway */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 dark:text-gray-400">{label}</p>
        <p className={`text-sm font-semibold text-slate-900 dark:text-gray-100 break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button type="button" onClick={copy} title={`Copy ${label}`} className="shrink-0 h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-[#168BFF] hover:bg-slate-100 dark:hover:bg-white/10">
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

/** Business → Billing → Add funds: choose an active method, pay, then tell us. */
export const DepositModal: React.FC<{ methods: DepositMethod[]; onClose: () => void; onSubmitted: () => void }> = ({ methods, onClose, onSubmitted }) => {
  const [method, setMethod] = useState<DepositMethod | null>(methods.length === 1 ? methods[0] : null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return;
    setSubmitting(true);
    setErrors({});
    try {
      await depositsApi.create({ method: method.key, amount, reference: reference.trim(), note: note.trim(), proof });
      onSubmitted();
      onClose();
    } catch (err) {
      setErrors(getApiFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  const details = Object.entries(method?.details ?? {}).filter(([k, v]) => v && k !== 'payment_link');
  const needsReference = method?.key === 'crypto' || method?.key === 'card';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0C1322] border border-slate-100 dark:border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 bg-white/95 dark:bg-[#0C1322]/95 backdrop-blur border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            {method && methods.length > 1 && (
              <button type="button" onClick={() => setMethod(null)} className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-gray-100" title="Choose another method">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-base font-extrabold text-slate-900 dark:text-gray-100">{method ? method.title : 'Add funds to your wallet'}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!method ? (
          <div className="p-6 space-y-3">
            <p className="text-sm text-slate-500 dark:text-gray-400">Choose how you want to pay.</p>
            {methods.map((m) => {
              const Icon = METHOD_ICONS[m.key];
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-[#168BFF] hover:bg-blue-50/40 dark:hover:bg-white/5 text-left transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] text-white flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900 dark:text-gray-100">{m.title}</span>
                    <span className="block text-xs text-slate-500 dark:text-gray-400 line-clamp-1">{m.instructions}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">from {formatUsd(m.min_amount_cents)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-5">
            {/* Step 1: how to pay */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">1 · Make the payment</p>
              {method.instructions && <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-3">{method.instructions}</p>}
              {method.key === 'card' && method.details?.payment_link && (
                <a
                  href={method.details.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 w-full h-11 rounded-xl bg-[#07182F] hover:bg-[#0D2342] text-white text-sm font-bold inline-flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Pay by card{method.details.provider ? ` with ${method.details.provider}` : ''} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {details.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/10 bg-slate-50/60 dark:bg-white/[0.03]">
                  {details.map(([k, v]) => (
                    <CopyRow key={k} label={DETAIL_LABELS[k] ?? k} value={v} mono={['wallet_address', 'iban', 'account_number', 'swift'].includes(k)} />
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: tell us */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">2 · {method.key === 'email' ? 'Send your request' : 'Tell us about your payment'}</p>
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Amount (USD)</span>
                <input required type="number" inputMode="decimal" min={method.min_amount_cents / 100} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" className={inputClass} />
                <span className={`block text-[11px] mt-1 ${errors.amount ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                  {errors.amount ?? `Minimum ${formatUsd(method.min_amount_cents)}${method.max_amount_cents ? ` · maximum ${formatUsd(method.max_amount_cents)}` : ''}`}
                </span>
              </label>
              {method.key !== 'email' && (
                <label className="block">
                  <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    {method.key === 'crypto' ? 'Transaction hash' : method.key === 'card' ? 'Payment reference / receipt no.' : 'Bank transfer reference'}
                    {!needsReference && <span className="font-normal text-slate-400"> (optional)</span>}
                  </span>
                  <input required={needsReference} value={reference} onChange={(e) => setReference(e.target.value)} placeholder={method.key === 'crypto' ? '0x… or TX…' : 'e.g. INV-20931'} className={`${inputClass} font-mono`} />
                  {errors.reference && <span className="block text-[11px] mt-1 text-red-600 dark:text-red-400">{errors.reference}</span>}
                </label>
              )}
              {method.key !== 'email' && (
                <label className="flex items-center gap-3 px-3.5 h-11 rounded-xl border border-dashed border-slate-300 dark:border-white/15 cursor-pointer hover:border-[#168BFF] text-sm text-slate-600 dark:text-gray-300">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="truncate flex-1">{proof ? proof.name : 'Attach payment proof (image or PDF, optional)'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
                </label>
              )}
              {errors.proof && <span className="block text-[11px] text-red-600 dark:text-red-400">{errors.proof}</span>}
              <label className="block">
                <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Note <span className="font-normal text-slate-400">(optional)</span></span>
                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={method.key === 'email' ? 'Company name for the invoice, VAT number…' : 'Anything our finance team should know'} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF] resize-none" />
              </label>
            </div>

            <button type="submit" disabled={submitting || !amount} className="w-full h-12 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 shadow-lg shadow-blue-500/20 disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {method.key === 'email' ? 'Send request' : 'Submit deposit'}
            </button>
            <p className="text-[11px] text-center text-slate-400">Your wallet is credited as soon as our finance team confirms the payment — usually within one business day.</p>
          </form>
        )}
      </div>
    </div>
  );
};
