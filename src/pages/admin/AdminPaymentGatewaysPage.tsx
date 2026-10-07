import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Plus, Pencil, Trash2, Loader2, X, Power, FlaskConical, Copy, Check } from 'lucide-react';
import { adminApi, getApiError } from '../../api';
import { PageHeader, LoadingBlock, ErrorBlock } from '../../components/common/ui';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from '../../utils/toast';

export interface PaymentGateway {
  id: number;
  name: string;
  driver: 'bank_transfer' | 'paypal' | 'wise' | 'stripe' | 'log';
  display_name: string | null;
  is_active: boolean;
  has_credentials: boolean;
  status: string;
  last_tested_at: string | null;
  last_test_message: string | null;
}

const DRIVERS = [
  { value: 'stripe', label: 'Stripe (automatic card payments)' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'wise', label: 'Wise' },
  { value: 'bank_transfer', label: 'Bank transfer (manual)' },
  { value: 'log', label: 'Log only (no real money)' },
] as const;

/** Credential fields each driver needs. */
const CREDENTIAL_FIELDS: Record<string, { key: string; label: string; placeholder: string; secret?: boolean }[]> = {
  stripe: [
    { key: 'publishable_key', label: 'Publishable key', placeholder: 'pk_live_…' },
    { key: 'secret_key', label: 'Secret key', placeholder: 'sk_live_…', secret: true },
    { key: 'webhook_secret', label: 'Webhook signing secret', placeholder: 'whsec_…', secret: true },
  ],
  paypal: [
    { key: 'client_id', label: 'Client ID', placeholder: '…' },
    { key: 'client_secret', label: 'Client secret', placeholder: '…', secret: true },
  ],
  wise: [
    { key: 'api_token', label: 'API token', placeholder: '…', secret: true },
    { key: 'profile_id', label: 'Profile ID', placeholder: '…' },
  ],
  bank_transfer: [],
  log: [],
};

/**
 * Super Admin → Payment Gateways.
 *
 * Fill in the gateway details once (Stripe keys, PayPal, Wise, bank) and
 * they automatically drive the business "Add funds" section: methods linked
 * to an active Stripe gateway take payment instantly and credit the wallet
 * on webhook confirmation — no manual approval.
 */
export const AdminPaymentGatewaysPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentGateway | null>(null);
  const [deleting, setDeleting] = useState<PaymentGateway | null>(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.paymentGateways();
      if (res.success) setGateways(res.data || []);
      else setError(res.message || 'Could not load payment gateways.');
    } catch (e) {
      setError(getApiError(e, 'Could not load payment gateways.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (g: PaymentGateway) => {
    try {
      const res = await adminApi.setPaymentGatewayActive(g.id, !g.is_active);
      if (res.success) {
        toast.success(res.message || (g.is_active ? 'Gateway disabled.' : 'Gateway is now active.'));
        void load();
      } else {
        toast.error(res.message || 'Could not update the gateway.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not update the gateway.'));
    }
  };

  const test = async (g: PaymentGateway) => {
    setTesting(g.id);
    try {
      const res = await adminApi.testPaymentGateway(g.id);
      if (res.success) toast.success(res.message || 'Gateway tested.');
      else toast.error(res.message || 'Gateway test failed.');
      void load();
    } catch (e) {
      toast.error(getApiError(e, 'Gateway test failed.'));
    } finally {
      setTesting(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await adminApi.deletePaymentGateway(deleting.id);
      if (res.success) {
        toast.success('Gateway deleted.');
        void load();
      } else {
        toast.error(res.message || 'Could not delete the gateway.');
      }
    } catch (e) {
      toast.error(getApiError(e, 'Could not delete the gateway.'));
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateways"
        subtitle="Connect Stripe, PayPal, Wise or bank details once — linked deposit methods then work automatically in the business Billing section."
        actions={
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add gateway
          </button>
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={() => void load()} />
      ) : gateways.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payment gateways yet" description="Add Stripe to accept automatic card payments." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gateways.map((g) => (
            <div
              key={g.id}
              className={`bg-white dark:bg-[#0C1322] rounded-3xl border p-5 space-y-4 ${
                g.is_active ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-[#E7ECF3] dark:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{g.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                      {DRIVERS.find((d) => d.value === g.driver)?.label ?? g.driver}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    g.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {g.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className={`px-2 py-1 rounded-full font-bold ${g.has_credentials ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                  {g.has_credentials ? 'Credentials saved' : 'No credentials'}
                </span>
                {g.driver === 'stripe' && (
                  <span className="px-2 py-1 rounded-full font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    Automatic wallet credit
                  </span>
                )}
                {g.last_tested_at && (
                  <span className="px-2 py-1 rounded-full font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                    Tested {new Date(g.last_tested_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {g.driver === 'stripe' && <WebhookUrlBox />}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void toggleActive(g)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <Power className="w-3.5 h-3.5" /> {g.is_active ? 'Disable' : 'Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => void test(g)}
                  disabled={testing === g.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                >
                  {testing === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(g); setFormOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(g)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <GatewayFormModal
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); void load(); }}
        />
      )}

      <ConfirmModal
        open={!!deleting}
        title={`Delete ${deleting?.name}?`}
        message="Deposit methods linked to this gateway will fall back to manual approval."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

/** Shows the webhook URL to paste into the Stripe dashboard. */
const WebhookUrlBox: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin.replace('admin.', 'api.')}/api/v1/webhooks/stripe`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
        Add this webhook URL in your Stripe dashboard (event: checkout.session.completed):
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all">{url}</code>
        <button
          type="button"
          onClick={() => void copy()}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 shrink-0"
          aria-label="Copy webhook URL"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#168BFF]/30 focus:border-[#168BFF]';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5';

const GatewayFormModal: React.FC<{
  editing: PaymentGateway | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ editing, onClose, onSaved }) => {
  const [name, setName] = useState(editing?.name ?? '');
  const [driver, setDriver] = useState<string>(editing?.driver ?? 'stripe');
  const [displayName, setDisplayName] = useState(editing?.display_name ?? '');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = CREDENTIAL_FIELDS[driver] ?? [];

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        driver,
        display_name: displayName.trim() || null,
      };
      const creds: Record<string, string> = {};
      for (const f of fields) {
        const v = (credentials[f.key] ?? '').trim();
        if (v) creds[f.key] = v;
      }
      // Only send credentials when the user typed something (edit keeps old ones).
      if (Object.keys(creds).length > 0 || !editing) payload.credentials = creds;

      const res = editing
        ? await adminApi.updatePaymentGateway(editing.id, payload)
        : await adminApi.createPaymentGateway(payload);
      if (res.success) {
        toast.success(editing ? 'Gateway updated.' : 'Gateway added. Link it to a deposit method to go live.');
        onSaved();
      } else {
        setError(res.message || 'Could not save the gateway.');
      }
    } catch (e) {
      setError(getApiError(e, 'Could not save the gateway.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editing ? 'Edit gateway' : 'Add gateway'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#141821] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#141821]">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{editing ? 'Edit gateway' : 'Add payment gateway'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="e.g. Stripe Live" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Provider *</label>
            <select value={driver} onChange={(e) => { setDriver(e.target.value); setCredentials({}); }} className={inputCls} disabled={!!editing}>
              {DRIVERS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {editing && <p className="text-xs text-gray-400 mt-1">The provider cannot be changed after creation.</p>}
          </div>
          <div>
            <label className={labelCls}>Display name (optional)</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={255} placeholder="Shown to businesses" className={inputCls} />
          </div>

          {fields.length > 0 && (
            <div className="space-y-3 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Credentials {editing?.has_credentials ? '(leave blank to keep saved ones)' : ''}
              </p>
              {fields.map((f) => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}{!editing ? ' *' : ''}</label>
                  <input
                    type={f.secret ? 'password' : 'text'}
                    value={credentials[f.key] ?? ''}
                    onChange={(e) => setCredentials({ ...credentials, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    autoComplete="off"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              ))}
            </div>
          )}

          {driver === 'stripe' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl px-4 py-3">
              After saving, add the webhook URL (shown on the gateway card) in your Stripe dashboard with the
              <span className="font-mono"> checkout.session.completed </span>
              event — then card payments credit wallets automatically.
            </p>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#141821]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!name.trim() || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#168BFF] hover:bg-[#0f7ae5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save changes' : 'Add gateway'}
          </button>
        </div>
      </div>
    </div>
  );
};
