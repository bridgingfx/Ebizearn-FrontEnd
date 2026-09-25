import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, X } from 'lucide-react';
import { CONSENT_SUMMARY, TERMS_VERSION } from '../../legal/terms';
import { buildConsent, clearStoredConsent, storeConsent, type TermsConsent } from '../../utils/termsConsent';

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

interface TermsConsentModalProps {
  /** Receives the freshly built consent record on "I agree and acknowledge". */
  onAccept: (consent: TermsConsent) => void;
  onClose: () => void;
}

/**
 * Plain-language summary of what the user agrees to. The checkbox on the
 * signup form never toggles directly — it opens this modal, and only the
 * "I agree and acknowledge" button inside it records consent.
 */
export const TermsConsentModal: React.FC<TermsConsentModalProps> = ({ onAccept, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-consent-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#07182F]/70 backdrop-blur-sm cursor-default"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#0C1322] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/30 max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-[#168BFF]/10 dark:bg-[#168BFF]/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#168BFF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="terms-consent-title"
              className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-gray-100"
            >
              Before you join — please read
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              A short summary of our Terms (v{TERMS_VERSION}). The full text is one tap away.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 -mr-1 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-gray-200 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto">
          <ul className="space-y-2.5">
            {CONSENT_SUMMARY.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600 dark:text-gray-300">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-400 dark:text-gray-500">
            Your acceptance is recorded with the terms version, timestamp, and IP address as proof of
            consent.{' '}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#168BFF] hover:underline"
            >
              Read the full Terms
            </Link>{' '}
            ·{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#168BFF] hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onAccept(buildConsent())}
            className="w-full min-h-[52px] px-6 rounded-2xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 text-white font-extrabold text-[15px] shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99]"
          >
            I agree and acknowledge
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] px-6 rounded-2xl text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Checkbox (opens the modal — never toggles directly)                 */
/* ------------------------------------------------------------------ */

interface TermsConsentCheckboxProps {
  /** null = not accepted. */
  consent: TermsConsent | null;
  onAccept: (consent: TermsConsent) => void;
  onRevoke: () => void;
  id?: string;
}

/**
 * The Terms checkbox for signup forms. Clicking the box (or its label)
 * opens the consent modal instead of toggling — consent is only recorded
 * through the modal's "I agree and acknowledge" button. Unchecking revokes
 * it and the parent must disable the submit button again.
 */
export const TermsConsentCheckbox: React.FC<TermsConsentCheckboxProps> = ({
  consent,
  onAccept,
  onRevoke,
  id = 'terms-consent',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const accepted = consent !== null;

  const handleAccept = (c: TermsConsent) => {
    storeConsent(c);
    onAccept(c);
    setModalOpen(false);
  };

  const handleBoxClick = () => {
    if (accepted) {
      clearStoredConsent();
      onRevoke();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3">
        <button
          type="button"
          id={id}
          role="checkbox"
          aria-checked={accepted}
          aria-describedby={`${id}-label`}
          onClick={handleBoxClick}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF]/60 ${
            accepted
              ? 'bg-[#168BFF] border-[#168BFF]'
              : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/25 hover:border-[#168BFF]'
          }`}
        >
          {accepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />}
        </button>
        <p id={`${id}-label`} className="text-[12px] leading-relaxed text-slate-500 dark:text-gray-400">
          I have read the summary and I agree to the{' '}
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-700 dark:text-gray-200 underline decoration-slate-300 dark:decoration-white/25 hover:text-[#168BFF]"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-700 dark:text-gray-200 underline decoration-slate-300 dark:decoration-white/25 hover:text-[#168BFF]"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </Link>
          .{' '}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="font-bold text-[#168BFF] hover:underline"
          >
            Review summary
          </button>
        </p>
      </div>

      {modalOpen && <TermsConsentModal onAccept={handleAccept} onClose={() => setModalOpen(false)} />}
    </>
  );
};
