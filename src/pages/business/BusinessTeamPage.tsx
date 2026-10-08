import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { businessTeamApi, getApiError } from '../../api';
import type { BusinessTeam, TeamMember, TeamPermission } from '../../api';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ErrorBlock, LoadingBlock, PageHeader, StatusBadge } from '../../components/common/ui';
import { BUSINESS_SECTIONS } from '../../utils/permissionGroups';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#168BFF]';
const labelClass = 'text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5';
const cardClass = 'bg-white dark:bg-[#0C1322] rounded-2xl border border-[#E7ECF3] dark:border-white/10 shadow-xs';

/** Team permissions laid out by business sidebar section. */
function useSectionBlocks(permissions: TeamPermission[]) {
  return useMemo(() => {
    const byName = new Map(permissions.map((p) => [p.name, p]));
    const placed = new Set<string>();
    const blocks = BUSINESS_SECTIONS.map((s) => {
      const perms = s.perms.map((n) => byName.get(n)).filter((p): p is TeamPermission => !!p);
      perms.forEach((p) => placed.add(p.name));
      return { title: s.label, perms };
    }).filter((b) => b.perms.length > 0);
    const rest = permissions.filter((p) => !placed.has(p.name));
    if (rest.length) blocks.push({ title: 'Other', perms: rest });
    return blocks;
  }, [permissions]);
}

/** Section checklist; access the owner lacks is locked. */
const AccessChecklist: React.FC<{
  permissions: TeamPermission[];
  value: string[];
  onChange: (next: string[]) => void;
}> = ({ permissions, value, onChange }) => {
  const blocks = useSectionBlocks(permissions);
  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter((n) => n !== name) : [...value, name]);

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {blocks.map((b) => (
        <div key={b.title} className="rounded-xl border border-gray-100 dark:border-white/10 p-3">
          <p className="text-xs font-black text-gray-900 dark:text-gray-100 mb-2">{b.title}</p>
          <ul className="space-y-1.5">
            {b.perms.map((p) => {
              const checked = value.includes(p.name);
              const locked = !p.available && !checked;
              return (
                <li key={p.name}>
                  <label
                    className={`flex items-start gap-2 text-xs ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={locked ? 'You do not have this access yourself, so you cannot give it.' : undefined}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-[#168BFF]"
                      checked={checked}
                      disabled={locked}
                      onChange={() => toggle(p.name)}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {p.label}
                      {locked && <Lock className="w-3 h-3 inline-block ml-1 -mt-0.5" />}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

const Message: React.FC<{ msg: { ok: boolean; text: string } | null }> = ({ msg }) =>
  msg ? (
    <p className={`text-xs font-semibold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
      {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />} {msg.text}
    </p>
  ) : null;

const MemberCard: React.FC<{
  member: TeamMember;
  permissions: TeamPermission[];
  onSaved: (team: BusinessTeam, message?: string) => void;
  onRemove: (member: TeamMember) => void;
}> = ({ member, permissions, onSaved, onRemove }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>(member.permissions);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => setValue(member.permissions), [member.permissions]);

  const dirty = value.length !== member.permissions.length || value.some((p) => !member.permissions.includes(p));
  const suspended = member.status === 'suspended';

  const run = async (fn: () => Promise<{ success: boolean; message?: string; data: BusinessTeam }>) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fn();
      if (res.success) {
        setMsg({ ok: true, text: res.message || 'Saved.' });
        onSaved(res.data);
      }
    } catch (e) {
      setMsg({ ok: false, text: getApiError(e, 'Could not save.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`${cardClass} p-4 space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {member.permissions.length === 0 ? 'Dashboard and Settings only' : `${member.permissions.length} access rights`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={member.status} />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Access
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => businessTeamApi.setStatus(member.id, suspended ? 'active' : 'suspended'))}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
          >
            {suspended ? 'Reactivate' : 'Suspend'}
          </button>
          <button
            type="button"
            onClick={() => onRemove(member)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            aria-label={`Remove ${member.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 pt-1">
          <AccessChecklist permissions={permissions} value={value} onChange={setValue} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Message msg={msg} />
            <button
              type="button"
              disabled={!dirty || busy}
              onClick={() => void run(() => businessTeamApi.updatePermissions(member.id, value))}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-40"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save access
            </button>
          </div>
        </div>
      )}
      {!open && msg && <Message msg={msg} />}
    </li>
  );
};

/**
 * Team Access: the business owner adds team members who sign in to this
 * business panel and see only the sections ticked for them — never more
 * than the owner has.
 */
export const BusinessTeamPage: React.FC = () => {
  const [team, setTeam] = useState<BusinessTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessTeamApi.get();
      setTeam(res.data);
    } catch (e) {
      setError(getApiError(e, 'Could not load your team.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openForm = () => {
    setAdding(true);
    setMsg(null);
    setForm({ name: '', email: '', password: '' });
    // Start with view-only access to campaigns when the owner has it.
    setFormPerms(team?.permissions.some((p) => p.name === 'view_own_campaigns' && p.available) ? ['view_own_campaigns'] : []);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await businessTeamApi.add({ ...form, permissions: formPerms });
      if (res.success) {
        setTeam(res.data);
        setAdding(false);
        setMsg({ ok: true, text: res.message || 'Team member added.' });
      }
    } catch (err) {
      setMsg({ ok: false, text: getApiError(err, 'Could not add the team member.') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!removing) return;
    const member = removing;
    setRemoving(null);
    try {
      const res = await businessTeamApi.remove(member.id);
      if (res.success) {
        setTeam(res.data);
        setMsg({ ok: true, text: res.message || 'Removed.' });
      }
    } catch (err) {
      setMsg({ ok: false, text: getApiError(err, 'Could not remove the team member.') });
    }
  };

  const full = !!team && team.members.length >= team.max_members;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Team Access"
        subtitle="Add colleagues who sign in to this business account and choose which sections each of them can use."
        actions={
          team && !adding ? (
            <button
              type="button"
              onClick={openForm}
              disabled={full}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-40"
            >
              <UserPlus className="w-4 h-4" /> Add team member
            </button>
          ) : undefined
        }
      />

      {loading && <LoadingBlock label="Loading your team…" />}
      {!loading && error && <ErrorBlock message={error} onRetry={() => void load()} />}

      {!loading && team && (
        <>
          {msg && !adding && <Message msg={msg} />}

          {adding && (
            <form onSubmit={(e) => void add(e)} className={`${cardClass} p-5 space-y-4`}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#168BFF]" /> New team member
                </h3>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass} htmlFor="tm-name">Name</label>
                  <input id="tm-name" required minLength={2} className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="tm-email">Email (sign-in)</label>
                  <input id="tm-email" required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="tm-password">Password</label>
                  <input
                    id="tm-password"
                    required
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    className={inputClass}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className={labelClass}>What they can use</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  Dashboard and Settings are always available. Locked items are ones your own account does not have.
                </p>
                <AccessChecklist permissions={team.permissions} value={formPerms} onChange={setFormPerms} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Message msg={msg} />
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-xs font-bold disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Add member
                </button>
              </div>
            </form>
          )}

          {team.members.length === 0 ? (
            !adding && (
              <EmptyState
                icon={Users}
                title="No team members yet"
                description="Add a colleague, give them a password, and tick the sections they may use. They sign in on the business login page."
              />
            )
          ) : (
            <ul className="space-y-3">
              {team.members.map((m) => (
                <MemberCard key={m.id} member={m} permissions={team.permissions} onSaved={setTeam} onRemove={setRemoving} />
              ))}
            </ul>
          )}
          {full && (
            <p className="text-xs text-gray-500 dark:text-gray-400">You have reached the limit of {team.max_members} team members.</p>
          )}
        </>
      )}

      <ConfirmModal
        open={!!removing}
        title="Remove team member?"
        message={removing ? `${removing.name} will be signed out and can no longer use this business account.` : undefined}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => void remove()}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
};
