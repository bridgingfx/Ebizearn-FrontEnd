import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, FileText, Loader2, RefreshCw, Save, Search, XCircle } from 'lucide-react';
import { staffDepositsApi, formatUsd, getApiError } from '../../api';
import type { DepositMethod, DepositMethodKey, DepositRequest, DepositStatus } from '../../api';
import { PageHeader } from '../../components/common/ui';
import { METHOD_ICONS } from '../../components/business/DepositModal';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';

type Filter = DepositStatus | 'all';

const STATUS_STYLES: Record<DepositStatus, string> = {
  pending: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300',
};

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

/* ------------------------------------------------------------------ */
/* Requests                                                            */
/* ------------------------------------------------------------------ */

const DepositRequests: React.FC = () => {
  const [rows, setRows] = useState<DepositRequest[]>([]);
  const [meta, setMeta] = useState<{ pending: number; pending_amount_cents: number } | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<{ id: number; mode: 'approve' | 'reject' } | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffDepositsApi.list({ status: filter, search: debounced || undefined });
      setRows(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load deposits.'));
    } finally {
      setLoading(false);
    }
  }, [filter, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (d: DepositRequest, mode: 'approve' | 'reject') => {
    setActive({ id: d.id, mode });
    setAmount((d.amount_cents / 100).toFixed(2));
    setNote('');
  };

  const decide = async (d: DepositRequest) => {
    if (!active) return;
    setBusy(true);
    try {
      await staffDepositsApi.decide(d.id, active.mode, active.mode === 'approve' ? { amount, note: note || undefined } : { note });
      setActive(null);
      await load();
    } catch {
      // Toasted by the API client.
    } finally {
      setBusy(false);
    }
  };

  const viewProof = async (d: DepositRequest) => {
    try {
      const blob = await staffDepositsApi.proof(d.id);
      window.open(URL.createObjectURL(blob), '_blank', 'noopener');
    } catch (err) {
      toast.error(getApiError(err, 'Could not open the proof.'));
    }
  };

  return (
    <div className="space-y-4">
      {meta && meta.pending > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <b>{meta.pending}</b> deposit{meta.pending === 1 ? '' : 's'} ({formatUsd(meta.pending_amount_cents)}) waiting for confirmation. Check the money arrived before approving.
        </div>
      )}

      <div className="bg-white dark:bg-[#0C1322] rounded-3xl border border-[#E7ECF3] dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${filter === f ? 'bg-[#07182F] dark:bg-[#168BFF] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'}`}>
                {f}
                {f === 'pending' && meta && <span className="ml-1.5 opacity-70">{meta.pending}</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search business, email or reference" className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]" />
            </div>
            <button type="button" onClick={() => void load()} title="Refresh" className="h-9 w-9 shrink-0 rounded-xl border border-gray-200 dark:border-white/10 inline-flex items-center justify-center text-gray-500 hover:text-[#168BFF]">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline-block" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">{filter === 'pending' ? 'No deposits are waiting for review.' : 'No deposits found.'}</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {rows.map((d) => {
              const Icon = METHOD_ICONS[d.method];
              const isOpen = active?.id === d.id;
              return (
                <li key={d.id} className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#168BFF] flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-gray-900 dark:text-gray-100 tabular-nums">{formatUsd(d.amount_cents, d.currency)}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[d.status]}`}>{d.status}</span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{d.method === 'email' ? 'email request' : d.method}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          <b>{d.user?.business?.company_name ?? d.user?.name}</b> · {d.user?.email} · {new Date(d.created_at).toLocaleString()}
                        </p>
                        {d.reference && <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 break-all">Ref: {d.reference}</p>}
                        {d.note && <p className="text-[11px] text-gray-500 dark:text-gray-400">Note: {d.note}</p>}
                        {d.status !== 'pending' && (
                          <p className="text-[11px] text-gray-400">
                            {d.status === 'approved' ? 'Approved' : 'Rejected'} by {d.reviewer?.name ?? 'staff'}{d.review_note ? ` — ${d.review_note}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                      {d.has_proof && (
                        <button type="button" onClick={() => viewProof(d)} className="h-9 px-3 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Proof
                        </button>
                      )}
                      {d.status === 'pending' && !isOpen && (
                        <>
                          <button type="button" onClick={() => open(d, 'approve')} className="h-9 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button type="button" onClick={() => open(d, 'reject')} className="h-9 px-3.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 inline-flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 flex flex-col sm:flex-row gap-2">
                      {active.mode === 'approve' && (
                        <label className="sm:w-44">
                          <span className="block text-[11px] font-bold text-gray-500 mb-1">Amount received (USD)</span>
                          <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
                        </label>
                      )}
                      <label className="flex-1">
                        <span className="block text-[11px] font-bold text-gray-500 mb-1">{active.mode === 'approve' ? 'Note (optional)' : 'Reason (shown to the business)'}</span>
                        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={active.mode === 'approve' ? 'e.g. Received via bank transfer' : 'e.g. Payment not received'} className={inputClass} />
                      </label>
                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={() => decide(d)}
                          disabled={busy || (active.mode === 'reject' && !note.trim())}
                          className={`h-10 px-4 rounded-xl text-xs font-bold text-white disabled:opacity-50 inline-flex items-center gap-1.5 ${active.mode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {active.mode === 'approve' ? `Credit ${amount ? formatUsd(Math.round(parseFloat(amount) * 100) || 0) : ''}` : 'Confirm rejection'}
                        </button>
                        <button type="button" onClick={() => setActive(null)} className="h-10 px-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">Cancel</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Methods (Super Admin)                                               */
/* ------------------------------------------------------------------ */

const FIELDS: Record<DepositMethodKey, { key: string; label: string; placeholder: string }[]> = {
  card: [
    { key: 'payment_link', label: 'Card payment link', placeholder: 'https://buy.stripe.com/…' },
    { key: 'provider', label: 'Provider name', placeholder: 'Stripe, PayTabs, Checkout.com…' },
  ],
  crypto: [
    { key: 'currency', label: 'Currency', placeholder: 'USDT' },
    { key: 'network', label: 'Network', placeholder: 'TRC20 / ERC20 / BEP20' },
    { key: 'wallet_address', label: 'Wallet address', placeholder: 'T… or 0x…' },
  ],
  bank: [
    { key: 'bank_name', label: 'Bank name', placeholder: 'Bank of Georgia' },
    { key: 'account_name', label: 'Account name', placeholder: 'eBiz Network FZ LLC' },
    { key: 'iban', label: 'IBAN', placeholder: 'AE07 0331 2345 6789 0123 456' },
    { key: 'account_number', label: 'Account number', placeholder: 'Optional if IBAN given' },
    { key: 'swift', label: 'SWIFT / BIC', placeholder: 'EBILAEAD' },
    { key: 'country', label: 'Country', placeholder: 'Georgia' },
  ],
  email: [{ key: 'contact_email', label: 'Finance email', placeholder: 'finance@ebizearn.com' }],
};

const MethodCard: React.FC<{ method: DepositMethod; onSaved: (m: DepositMethod) => void }> = ({ method, onSaved }) => {
  const [form, setForm] = useState({
    is_active: !!method.is_active,
    title: method.title,
    instructions: method.instructions ?? '',
    details: { ...(method.details ?? {}) } as Record<string, string>,
    min_amount: (method.min_amount_cents / 100).toString(),
    max_amount: method.max_amount_cents ? (method.max_amount_cents / 100).toString() : '',
  });
  const [saving, setSaving] = useState(false);
  const Icon = METHOD_ICONS[method.key];

  const save = async (next = form) => {
    setSaving(true);
    try {
      const res = await staffDepositsApi.updateMethod(method.key, next);
      onSaved(res.data);
    } catch {
      // Toasted by the API client.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${form.is_active ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/[0.04]' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1322]'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] text-white flex items-center justify-center"><Icon className="w-5 h-5" /></span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{method.title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{method.is_active ? 'Shown on Business → Billing' : 'Hidden from businesses'}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.is_active}
          aria-label={`${method.title} on or off`}
          onClick={() => {
            const next = { ...form, is_active: !form.is_active };
            setForm(next);
            void save(next);
          }}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block sm:col-span-2">
          <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Name shown to businesses</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </label>
        {FIELDS[method.key].map((f) => (
          <label key={f.key} className={`block ${f.key === 'wallet_address' || f.key === 'payment_link' ? 'sm:col-span-2' : ''}`}>
            <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{f.label}</span>
            <input
              value={form.details[f.key] ?? ''}
              onChange={(e) => setForm({ ...form, details: { ...form.details, [f.key]: e.target.value } })}
              placeholder={f.placeholder}
              className={`${inputClass} ${['wallet_address', 'iban', 'swift', 'payment_link'].includes(f.key) ? 'font-mono' : ''}`}
            />
          </label>
        ))}
        <label className="block">
          <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Minimum (USD)</span>
          <input type="number" min="1" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Maximum (USD, optional)</span>
          <input type="number" min="1" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: e.target.value })} placeholder="No limit" className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Instructions for businesses</span>
          <textarea rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF] resize-none" />
        </label>
      </div>

      <button type="button" onClick={() => void save()} disabled={saving} className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-[#07182F] dark:bg-[#168BFF] hover:bg-[#168BFF] disabled:opacity-50 inline-flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save {method.title}
      </button>
    </div>
  );
};

const DepositMethodsSettings: React.FC = () => {
  const [methods, setMethods] = useState<DepositMethod[] | null>(null);

  useEffect(() => {
    staffDepositsApi
      .methods()
      .then((res) => setMethods(res.data))
      .catch((err) => toast.error(getApiError(err, 'Could not load deposit methods.')));
  }, []);

  if (!methods) return <div className="p-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline-block" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
        Turn on the ways businesses can add funds. Only active methods appear on Business → Billing. Every deposit is checked and approved on the Requests tab before the wallet is credited.
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {methods.map((m) => (
          <MethodCard key={m.key} method={m} onSaved={(saved) => setMethods((list) => list?.map((x) => (x.key === saved.key ? saved : x)) ?? null)} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const AdminDepositsPage: React.FC = () => {
  const { user } = useAuth();
  const isSuper = user?.role === 'superadmin';
  const [tab, setTab] = useState<'requests' | 'methods'>('requests');

  return (
    <div className="space-y-6">
      <PageHeader title="Deposits" subtitle="Business wallet top-ups by card, crypto, bank transfer and email request. Confirm the money arrived, then approve to credit the wallet." />
      {isSuper && (
        <div className="inline-flex gap-1 p-1 rounded-2xl bg-white dark:bg-[#0C1322] border border-gray-200 dark:border-white/10">
          {([['requests', 'Requests'], ['methods', 'Deposit methods']] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`h-9 px-4 rounded-xl text-[13px] font-semibold ${tab === id ? 'bg-[#07182F] dark:bg-[#168BFF] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
      )}
      {tab === 'requests' || !isSuper ? <DepositRequests /> : <DepositMethodsSettings />}
    </div>
  );
};
