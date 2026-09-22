import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { api, getApiError } from '../../api';

interface RequestDemoModalProps {
  open: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

/** Demo-request modal for business prospects. Pure marketing intake — honest,
 *  no fabricated claims. Posts to /demo-requests on the Laravel API. */
export const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!open) return null;

  const reset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
    setStatus('idle');
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await api.post('/demo-requests', { name, email, company, message });
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMsg(
        getApiError(
          error,
          'We could not send your request right now. Please try again in a few minutes or contact us directly.'
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Request a demo">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-14 h-14 text-[#16B364] mx-auto" />
            <h3 className="mt-4 text-xl font-black text-slate-900">Request received</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Thanks, {name.split(' ')[0] || 'there'} — our team will be in touch within 2 business days.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 px-8 py-3 bg-[#07182F] text-white font-bold text-sm rounded-xl hover:bg-[#0D2342] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-black text-slate-900">Request a demo</h3>
            <p className="mt-1 text-xs text-slate-500">
              Tell us about your campaign goals and we’ll walk you through the platform.
            </p>

            {status === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company or brand name"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What would you like to achieve with eBiz Earn?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{status === 'sending' ? 'Sending…' : 'Send request'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
