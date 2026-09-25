import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Code2,
  FileText,
  ImagePlus,
  Loader2,
  Mail,
  Monitor,
  MousePointerClick,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { emailApi, getApiError } from '../../../api';
import type { EmailTemplate } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../utils/toast';

type Field = 'subject' | 'html_body' | 'text_body';
type Pane = 'html' | 'text';

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B111D] text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Example values used for the live preview (the server uses the same kind for test sends). */
const useSampleValues = (userName: string) =>
  useMemo(() => {
    const origin = window.location.origin;
    return {
      user_name: userName,
      app_name: 'eBizEarn',
      support_email: 'support@ebizearn.com',
      logo_url: `${origin}/assets/email-logo.png`,
      app_url: origin,
      help_url: `${origin}/faq`,
      terms_url: `${origin}/terms`,
      privacy_url: `${origin}/privacy`,
      year: String(new Date().getFullYear()),
      login_url: `${origin}/login`,
      verification_url: `${origin}/verify-email`,
      reset_url: `${origin}/reset-password`,
      amount: 'USD 25.00',
      task_title: 'Follow @acmebrand on Instagram',
      reason: 'The screenshot does not show the follow button.',
    } as Record<string, string>;
  }, [userName]);

const fill = (content: string, values: Record<string, string>, escape: boolean) =>
  content.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, key: string) => (key in values ? (escape ? escapeHtml(values[key]) : values[key]) : m));

/** Super Admin → Email → Templates: edit built-in emails, create custom ones, preview and test. */
export const TemplateEditor: React.FC = () => {
  const { user } = useAuth();
  const samples = useSampleValues((user?.name ?? 'Sarah').split(' ')[0]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'save' | 'reset' | 'delete' | 'test' | 'upload' | null>(null);
  const [query, setQuery] = useState('');
  const [pane, setPane] = useState<Pane>('html');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [testTo, setTestTo] = useState(user?.email ?? '');
  const [showTest, setShowTest] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const subjectRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const lastField = useRef<Field>('html_body');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await emailApi.templates();
      setTemplates(res.data);
      setSelectedKey((key) => key ?? res.data[0]?.event_key ?? null);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load templates.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saved = templates.find((t) => t.event_key === selectedKey) ?? null;

  useEffect(() => {
    setDraft(saved);
    // Only when switching templates — not on every list refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, saved?.id]);

  const dirty =
    !!draft && !!saved &&
    (draft.subject !== saved.subject || draft.html_body !== saved.html_body || draft.text_body !== saved.text_body || draft.is_enabled !== saved.is_enabled || draft.name !== saved.name);

  const select = (key: string) => {
    if (dirty && !window.confirm('Discard unsaved changes to this template?')) return;
    setSelectedKey(key);
    setShowTest(false);
  };

  const replaceTemplate = (updated: EmailTemplate) => {
    setTemplates((list) => list.map((t) => (t.event_key === updated.event_key ? updated : t)));
    setDraft(updated);
  };

  const set = <K extends keyof EmailTemplate>(key: K, value: EmailTemplate[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  /** Insert text at the cursor of the last focused field. */
  const insert = (snippet: string, field: Field = lastField.current) => {
    if (!draft) return;
    const el = field === 'subject' ? subjectRef.current : field === 'html_body' ? htmlRef.current : textRef.current;
    const current = draft[field];
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + snippet + current.slice(end);
    set(field, next);
    if (field === 'html_body') setPane('html');
    if (field === 'text_body') setPane('text');
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

  const insertHtml = (snippet: string) => insert(snippet, 'html_body');

  const save = async () => {
    if (!draft) return;
    setBusy('save');
    try {
      const res = await emailApi.updateTemplate(draft.event_key, {
        name: draft.is_custom ? draft.name : undefined,
        subject: draft.subject,
        html_body: draft.html_body,
        text_body: draft.text_body,
        is_enabled: draft.is_enabled,
      });
      replaceTemplate(res.data);
    } catch {
      // Shown by the API client toast.
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    if (!draft || !window.confirm('Restore this email to the default eBizEarn design and text?')) return;
    setBusy('reset');
    try {
      const res = await emailApi.resetTemplate(draft.event_key);
      replaceTemplate(res.data);
    } catch {
      // Shown by the API client toast.
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!draft || !window.confirm(`Delete the template "${draft.name}"?`)) return;
    setBusy('delete');
    try {
      await emailApi.deleteTemplate(draft.event_key);
      const rest = templates.filter((t) => t.event_key !== draft.event_key);
      setTemplates(rest);
      setSelectedKey(rest[0]?.event_key ?? null);
    } catch {
      // Shown by the API client toast.
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async () => {
    if (!draft) return;
    setBusy('test');
    try {
      await emailApi.testTemplate(draft.event_key, { to: testTo, subject: draft.subject, html_body: draft.html_body, text_body: draft.text_body });
      setShowTest(false);
    } catch {
      // Shown by the API client toast.
    } finally {
      setBusy(null);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy('upload');
    try {
      const res = await emailApi.uploadAsset(file);
      insertHtml(
        `<img src="${res.data.url}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:14px;margin:0 0 20px">`,
      );
    } catch {
      // Shown by the API client toast.
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await emailApi.createTemplate({ name: newName.trim(), subject: newSubject.trim() });
      setTemplates((list) => [...list, res.data]);
      setSelectedKey(res.data.event_key);
      setCreating(false);
      setNewName('');
      setNewSubject('');
    } catch {
      // Shown by the API client toast.
    }
  };

  const filtered = templates.filter((t) => !query || `${t.name} ${t.event_key}`.toLowerCase().includes(query.toLowerCase()));
  const system = filtered.filter((t) => !t.is_custom);
  const custom = filtered.filter((t) => t.is_custom);

  const previewDoc = useMemo(() => (draft ? fill(draft.html_body, samples, true) : ''), [draft, samples]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin inline-block" />
      </div>
    );
  }

  const renderItem = (t: EmailTemplate) => {
    const on = t.event_key === selectedKey;
    return (
      <button
        key={t.event_key}
        type="button"
        onClick={() => select(t.event_key)}
        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
          on ? 'bg-[#07182F] dark:bg-[#168BFF] text-white shadow-sm' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.is_enabled ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-gray-600'}`} title={t.is_enabled ? 'Enabled' : 'Disabled'} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold truncate">{t.name}</span>
          <span className={`block text-[10px] font-mono truncate ${on ? 'text-white/60' : 'text-slate-400'}`}>{t.event_key}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
      {/* Template list */}
      <aside className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-3 lg:sticky lg:top-4">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="w-full h-10 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> New template
        </button>
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates" className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#168BFF] text-slate-900 dark:text-gray-100" />
        </div>

        <p className="mt-4 mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform emails</p>
        <div className="space-y-0.5 max-h-[50vh] lg:max-h-none overflow-y-auto no-scrollbar">
          {system.map(renderItem)}
        </div>

        <p className="mt-4 mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom templates</p>
        {custom.length === 0 ? (
          <p className="px-2 pb-1 text-[11px] text-slate-400">None yet — create one for announcements or offers.</p>
        ) : (
          <div className="space-y-0.5">{custom.map(renderItem)}</div>
        )}
      </aside>

      {/* Editor */}
      {draft && (
        <section className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {draft.is_custom ? (
                  <input value={draft.name} onChange={(e) => set('name', e.target.value)} className="text-lg font-bold text-slate-900 dark:text-gray-100 bg-transparent border-b border-dashed border-slate-300 dark:border-white/20 focus:outline-none focus:border-[#168BFF] w-full max-w-sm" />
                ) : (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{draft.name}</h3>
                )}
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-400">
                  <span className="font-mono">{draft.event_key}</span> · {draft.is_custom ? 'Custom template — choose it as the design of a marketing campaign (Campaigns tab)' : 'Sent automatically by the platform'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none mr-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">{draft.is_enabled ? 'Enabled' : 'Disabled'}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.is_enabled}
                    onClick={() => set('is_enabled', !draft.is_enabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${draft.is_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${draft.is_enabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </label>
                <button type="button" onClick={() => setShowTest((v) => !v)} className="h-9 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-white/15 inline-flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Send test
                </button>
                {draft.is_custom ? (
                  <button type="button" onClick={remove} disabled={busy !== null} title="Delete template" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 inline-flex items-center justify-center disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={reset} disabled={busy !== null} title="Restore default design and text" className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 inline-flex items-center gap-1.5 disabled:opacity-50">
                    <RotateCcw className="w-3.5 h-3.5" /> Default
                  </button>
                )}
                <button type="button" onClick={save} disabled={busy !== null || !dirty} className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#07182F] dark:bg-[#168BFF] hover:bg-[#168BFF] disabled:opacity-40 inline-flex items-center gap-1.5">
                  {busy === 'save' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </div>

            {showTest && (
              <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className={inputClass} />
                <button type="button" onClick={sendTest} disabled={!testTo || busy !== null} className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shrink-0">
                  {busy === 'test' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send with sample data
                </button>
              </div>
            )}

            {dirty && <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-300">You have unsaved changes.</p>}

            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Subject line</span>
              <input
                ref={subjectRef}
                value={draft.subject}
                onFocus={() => (lastField.current = 'subject')}
                onChange={(e) => set('subject', e.target.value)}
                className={inputClass}
              />
            </label>

            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">Variables <span className="font-normal text-slate-400">— click to insert at the cursor</span></span>
              <div className="flex flex-wrap gap-1.5">
                {draft.variables.map((v) => (
                  <button key={v} type="button" onClick={() => insert(`{{${v}}}`)} className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20">
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-start">
            {/* Code */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 dark:border-white/10">
                <div className="flex gap-1">
                  {([['html', 'HTML design', Code2], ['text', 'Plain text', FileText]] as const).map(([id, label, Icon]) => (
                    <button key={id} type="button" onClick={() => setPane(id)} className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${pane === id ? 'bg-slate-900 dark:bg-white/15 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
                {pane === 'html' && (
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => insertHtml('<img src="{{logo_url}}" width="150" alt="{{app_name}}" style="display:block;width:150px;height:auto;border:0;margin:0 0 20px">')} className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#168BFF]" /> Logo
                    </button>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={busy === 'upload'} className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 inline-flex items-center gap-1.5 disabled:opacity-50">
                      {busy === 'upload' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5 text-[#168BFF]" />} Image
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertHtml(
                          '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td bgcolor="#168BFF" style="border-radius:12px;background:#168BFF;background-image:linear-gradient(90deg,#168BFF,#7257FF)"><a href="{{app_url}}" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none">Button text &rarr;</a></td></tr></table>',
                        )
                      }
                      className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 inline-flex items-center gap-1.5"
                    >
                      <MousePointerClick className="w-3.5 h-3.5 text-[#168BFF]" /> Button
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                  </div>
                )}
              </div>
              {pane === 'html' ? (
                <textarea
                  ref={htmlRef}
                  value={draft.html_body}
                  onFocus={() => (lastField.current = 'html_body')}
                  onChange={(e) => set('html_body', e.target.value)}
                  spellCheck={false}
                  className="block w-full h-[560px] p-4 bg-[#0B1220] text-[#D6E2F5] font-mono text-[12px] leading-relaxed resize-y focus:outline-none"
                />
              ) : (
                <textarea
                  ref={textRef}
                  value={draft.text_body}
                  onFocus={() => (lastField.current = 'text_body')}
                  onChange={(e) => set('text_body', e.target.value)}
                  className="block w-full h-[560px] p-4 bg-white dark:bg-[#0B111D] text-slate-800 dark:text-gray-200 font-mono text-[12px] leading-relaxed resize-y focus:outline-none"
                />
              )}
              <p className="px-4 py-2.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-white/10">
                The plain-text version is shown by email apps that can’t display HTML. Keep both in sync.
              </p>
            </div>

            {/* Live preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C1322] overflow-hidden 2xl:sticky 2xl:top-4">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 dark:border-white/10">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-200 inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#168BFF]" /> Live preview
                </span>
                <div className="flex gap-1">
                  {([['desktop', Monitor], ['mobile', Smartphone]] as const).map(([id, Icon]) => (
                    <button key={id} type="button" onClick={() => setDevice(id)} title={id === 'desktop' ? 'Desktop' : 'Mobile'} className={`h-8 w-8 rounded-lg inline-flex items-center justify-center ${device === id ? 'bg-slate-900 dark:bg-white/15 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/10 text-xs">
                <span className="text-slate-400">Subject:</span>{' '}
                <span className="font-semibold text-slate-800 dark:text-gray-100">{fill(draft.subject, samples, false)}</span>
              </div>
              <div className="bg-slate-100 dark:bg-black/30 p-3 sm:p-4 flex justify-center">
                <iframe
                  title="Email preview"
                  srcDoc={previewDoc}
                  sandbox=""
                  className="bg-white rounded-xl shadow-sm transition-all"
                  style={{ width: device === 'mobile' ? 375 : '100%', maxWidth: '100%', height: 640, border: 0 }}
                />
              </div>
              <p className="px-4 py-2.5 text-[11px] text-slate-400">Preview uses sample data. Use “Send test” to see it in a real inbox.</p>
            </div>
          </div>
        </section>
      )}

      {/* New template */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCreating(false)} />
          <form onSubmit={create} className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0C1322] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">New email template</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">It starts with the branded eBizEarn design — logo, hero, content and footer.</p>
              </div>
              <button type="button" onClick={() => setCreating(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Template name</span>
              <input autoFocus required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Ramadan bonus announcement" className={inputClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Subject line</span>
              <input required value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Double rewards this week, {{user_name}}!" className={inputClass} />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setCreating(false)} className="h-10 px-4 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
              <button type="submit" disabled={!newName.trim() || !newSubject.trim()} className="h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#168BFF] to-[#7257FF] disabled:opacity-50">Create template</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
