import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  Circle,
  ExternalLink,

  Loader2,
  Receipt,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
  XCircle,
} from 'lucide-react';
import { taskHistoryApi, getApiError } from '../../api';
import type { PostVerificationRecord, TaskHistoryDetail } from '../../api';
import { fmtMoney } from '../common/ui';
import { InstagramLogo } from '../common/PlatformIcons';
import { RewardStatusBadge } from '../task/RewardStatusBadge';

type Action = TaskHistoryDetail['reward_actions'][number];

const ACTIONS: Record<Action, { label: string; icon: React.ElementType; cls: string; needsNote: boolean; help: string }> = {
  verify: { label: 'Run automatic check', icon: Sparkles, cls: 'bg-violet-600 hover:bg-violet-700 text-white', needsNote: false, help: 'Re-runs the AI screenshot review and the Instagram API check now.' },
  recheck: { label: 'Re-check post now', icon: RefreshCw, cls: 'bg-[#168BFF] hover:bg-[#2F80FF] text-white', needsNote: false, help: 'Runs the final Instagram check now: live → release, deleted → refund.' },
  release: { label: 'Release reward', icon: CheckCircle2, cls: 'bg-emerald-600 hover:bg-emerald-700 text-white', needsNote: true, help: 'Moves the pending reward to the contributor\'s available balance.' },
  refund: { label: 'Refund to funder', icon: RotateCcw, cls: 'bg-red-600 hover:bg-red-700 text-white', needsNote: true, help: 'Cancels the pending reward and returns it to the business that funded it.' },
};

const OUTCOME: Record<string, string> = {
  verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  inconclusive: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  skipped: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
};

const dt = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString() : '—');

const Check: React.FC<{ ok: boolean | null | undefined; label: string }> = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${ok === true ? 'text-emerald-600 dark:text-emerald-400' : ok === false ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
    {ok === true ? <CheckCircle2 className="w-3.5 h-3.5" /> : ok === false ? <XCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />} {label}
  </span>
);

const VerificationRow: React.FC<{ v: PostVerificationRecord }> = ({ v }) => {
  const c = v.api_checks_json;
  const ai = v.ai_json;
  return (
    <li className="rounded-xl border border-gray-100 dark:border-white/10 p-3.5 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
          {v.stage === 'initial' ? 'Initial check' : v.stage === 'final' ? 'Final check' : 'Manual'}
        </span>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${OUTCOME[v.outcome] ?? OUTCOME.skipped}`}>{v.outcome}</span>
        <span className="ml-auto text-[11px] text-gray-400">
          {dt(v.checked_at)}
          {v.actor ? ` · ${v.actor.name}` : ' · automatic'}
        </span>
      </div>
      {v.reason && <p className="text-sm text-gray-700 dark:text-gray-200">{v.reason}</p>}
      {c && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Check ok={c.account_connected} label="Instagram connected" />
          {c.account_connected && <Check ok={c.post_found} label="Post found" />}
          {c.post_found && <Check ok={c.account_match} label="Correct account" />}
          {c.post_found && c.published_after_start !== undefined && <Check ok={c.published_after_start} label="Posted after task start" />}
          {c.post_found && c.caption_match !== undefined && (
            <Check ok={c.caption_match} label={`Caption${c.caption_score != null ? ` ${c.caption_score}%` : ''}`} />
          )}
          {c.error && <span className="text-[11px] text-amber-600 dark:text-amber-400">API: {c.error}</span>}
        </div>
      )}
      {ai && ai.available && (
        <div className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300 bg-violet-50/60 dark:bg-violet-500/5 rounded-lg p-2">
          <Bot className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
          <span>
            <b>{ai.is_proof ? 'Matches' : 'Does not match'}</b> · {ai.confidence}% · {ai.model}
            {ai.looks_fake && <b className="text-red-600"> · looks edited</b>}
            {ai.summary ? ` — ${ai.summary}` : ''}
            {ai.issues && ai.issues.length > 0 && <span className="block text-red-600 dark:text-red-400">Issues: {ai.issues.join('; ')}</span>}
          </span>
        </div>
      )}
      {v.api_meta_json?.permalink && (
        <a href={v.api_meta_json.permalink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#168BFF] hover:underline">
          <ExternalLink className="w-3 h-3" /> @{v.api_meta_json.username} · {dt(v.api_meta_json.timestamp)}
        </a>
      )}
    </li>
  );
};

/**
 * Task History → View: everything after the proof — the automatic checks
 * (Instagram API + AI), the pending reward, where it was funded from, the
 * ledger trail, and the staff controls (release / refund / re-check).
 */
export const RewardVerificationPanel: React.FC<{ data: TaskHistoryDetail; assignmentId: number; canAct: boolean; onDone: () => void }> = ({ data, assignmentId, canAct, onDone }) => {
  const sub = data.submission;
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!sub) return null;

  const run = async () => {
    if (!action) return;
    if (ACTIONS[action].needsNote && note.trim().length < 3) {
      setMsg({ ok: false, text: 'Add a short reason (kept in the audit log).' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await taskHistoryApi.rewardAction(assignmentId, action, note.trim() || undefined);
      setMsg({ ok: true, text: res.message || 'Done.' });
      setAction(null);
      setNote('');
      onDone();
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not complete that action.') });
    } finally {
      setBusy(false);
    }
  };

  const verifications = sub.post_verifications ?? [];
  const ig = data.instagram;

  return (
    <section className="bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/10">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#168BFF]" /> Verification & reward
        </h2>
        <RewardStatusBadge status={sub.status} rewardStatus={sub.reward_status} />
      </header>

      <div className="p-5 space-y-5">
        {/* Key facts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Automatic check</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
              {sub.auto_verify_status === 'done' ? verifications.find((v) => v.stage === 'initial')?.outcome ?? 'done' : sub.auto_verify_status ? 'running…' : 'not run'}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Final check due</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100">{sub.reward_status === 'pending_duration' ? dt(sub.final_check_due_at) : '—'}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Final check attempts</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100">{sub.final_check_attempts ?? 0}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Settled</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100">{dt(sub.final_checked_at)}</p>
          </div>
        </div>

        {sub.reward_status === 'reverification_required' && (
          <p className="flex items-start gap-2 text-xs text-orange-800 dark:text-orange-200 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 shrink-0" /> The final check could not confirm the post after several tries. Check it yourself, then release or refund.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Instagram connection */}
          <div className="rounded-xl border border-gray-100 dark:border-white/10 p-3.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1.5">
              <InstagramLogo className="w-3.5 h-3.5" /> Contributor's Instagram
            </p>
            {!ig ? (
              <p className="text-xs text-gray-500">Not connected — Instagram posts can't be verified automatically.</p>
            ) : (
              <div className="text-xs text-gray-700 dark:text-gray-200 space-y-0.5">
                <p className="font-bold">@{ig.handle} <span className="font-normal text-gray-500">· {ig.connected_via === 'oauth' ? 'official login' : 'bio code'} · {ig.status}</span></p>
                {ig.connected_via === 'oauth' && (
                  <p className={ig.token_expired ? 'text-red-600' : 'text-gray-500'}>
                    {ig.token_expired ? 'Access expired — must reconnect' : `Access until ${dt(ig.expires_at)}`}
                  </p>
                )}
                {ig.note && <p className="text-gray-500">{ig.note}</p>}
              </div>
            )}
            {sub.platform_post_url && (
              <a href={sub.platform_post_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#168BFF] hover:underline break-all">
                <ExternalLink className="w-3 h-3 shrink-0" /> Confirmed post · {dt(sub.platform_posted_at)}
              </a>
            )}
          </div>

          {/* Funding source */}
          <div className="rounded-xl border border-gray-100 dark:border-white/10 p-3.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3.5 h-3.5" /> Funded by
            </p>
            {!data.funding ? (
              <p className="text-xs text-gray-500">Recorded when the proof is approved.</p>
            ) : (
              <div className="text-xs text-gray-700 dark:text-gray-200 space-y-0.5">
                <p className="font-bold">{data.funding.user?.name ?? '—'}</p>
                <p className="text-gray-500">{data.funding.user?.email}</p>
                <p className="text-gray-500">
                  {data.funding.type === 'business_wallet' ? 'Business wallet' : data.funding.type} #{data.funding.wallet_id} · {data.funding.reference}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canAct && data.reward_actions.length > 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-3.5 space-y-3">
            <div className="flex flex-wrap gap-2">
              {data.reward_actions.map((a) => {
                const meta = ACTIONS[a];
                return (
                  <button
                    key={a}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setAction(a);
                      setMsg(null);
                      if (!ACTIONS[a].needsNote) setNote('');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${
                      action === a ? meta.cls + ' shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/15'
                    }`}
                  >
                    <meta.icon className="w-3.5 h-3.5" /> {meta.label}
                  </button>
                );
              })}
            </div>
            {action && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{ACTIONS[action].help}</p>
                {ACTIONS[action].needsNote && (
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="Reason (kept in the audit log)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]"
                  />
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAction(null)} className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
                    Cancel
                  </button>
                  <button type="button" disabled={busy} onClick={() => void run()} className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-60 ${ACTIONS[action].cls}`}>
                    {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm — {ACTIONS[action].label}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{msg.text}</p>}

        {/* Verification history */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Verification history</p>
          {verifications.length === 0 ? (
            <p className="text-xs text-gray-500">No automatic checks yet.</p>
          ) : (
            <ol className="space-y-2">
              {verifications.map((v) => (
                <VerificationRow key={v.id} v={v} />
              ))}
            </ol>
          )}
        </div>

        {/* Ledger */}
        {data.ledger.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Money trail
            </p>
            <div className="rounded-xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
              {data.ledger.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                  <Wallet className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-800 dark:text-gray-200 capitalize truncate">
                      {t.type.replace(/_/g, ' ')} <span className="font-normal text-gray-500">· {t.wallet_owner?.name ?? `wallet #${t.wallet_id}`}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{t.description}</p>
                  </div>
                  <span className={`font-black tabular-nums ${t.amount_cents >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.amount_cents >= 0 ? '+' : '−'}{fmtMoney(Math.abs(t.amount_cents))}
                  </span>
                  <span className="hidden sm:block text-[11px] text-gray-400 w-36 text-right">{dt(t.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
