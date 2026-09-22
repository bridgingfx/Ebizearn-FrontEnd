import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { emailApi, getApiError } from '../../../api';
import type { EmailTemplate } from '../../../api';

const inputClass = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#168BFF]';

export const TemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await emailApi.templates();
      setTemplates(res.data);
      setSelectedKey((key) => key ?? res.data[0]?.event_key ?? null);
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err, 'Could not load templates.') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDraft(templates.find((t) => t.event_key === selectedKey) ?? null);
  }, [selectedKey, templates]);

  const replaceTemplate = (updated: EmailTemplate) =>
    setTemplates((list) => list.map((t) => (t.event_key === updated.event_key ? updated : t)));

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await emailApi.updateTemplate(draft.event_key, {
        subject: draft.subject,
        html_body: draft.html_body,
        text_body: draft.text_body,
        is_enabled: draft.is_enabled,
      });
      replaceTemplate(res.data);
      setNotice({ ok: true, text: 'Template saved.' });
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err, 'Could not save template.') });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!draft || !window.confirm('Restore this template to its default content?')) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await emailApi.resetTemplate(draft.event_key);
      replaceTemplate(res.data);
      setNotice({ ok: true, text: 'Template restored to default.' });
    } catch (err) {
      setNotice({ ok: false, text: getApiError(err, 'Could not reset template.') });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      <div className="space-y-1">
        {templates.map((t) => (
          <button
            key={t.event_key}
            type="button"
            onClick={() => { setSelectedKey(t.event_key); setNotice(null); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 cursor-pointer ${
              t.event_key === selectedKey ? 'bg-[#07182F] text-white' : 'bg-slate-50 text-gray-700 hover:bg-slate-100'
            }`}
          >
            <span className="truncate">{t.name}</span>
            {!t.is_enabled && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">off</span>}
          </button>
        ))}
      </div>

      {draft && (
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-mono text-gray-500">event: {draft.event_key}</p>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={draft.is_enabled} onChange={(e) => setDraft({ ...draft, is_enabled: e.target.checked })} />
              Enabled
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {draft.variables.map((v) => (
              <code key={v} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">{`{{${v}}}`}</code>
            ))}
          </div>

          <label className="block text-[11px] font-bold text-gray-600">Subject
            <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className={`${inputClass} mt-1 font-normal`} />
          </label>
          <label className="block text-[11px] font-bold text-gray-600">HTML body
            <textarea value={draft.html_body} onChange={(e) => setDraft({ ...draft, html_body: e.target.value })} rows={10} className={`${inputClass} mt-1 font-mono font-normal`} />
          </label>
          <label className="block text-[11px] font-bold text-gray-600">Plain text body
            <textarea value={draft.text_body} onChange={(e) => setDraft({ ...draft, text_body: e.target.value })} rows={6} className={`${inputClass} mt-1 font-mono font-normal`} />
          </label>

          {notice && (
            <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold ${notice.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{notice.text}</div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={busy}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#07182F] hover:bg-[#168BFF] text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
              <Save className="w-4 h-4" />{busy ? 'Saving…' : 'Save template'}
            </button>
            <button type="button" onClick={reset} disabled={busy}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
              <RotateCcw className="w-4 h-4" />Restore default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
