import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MailCheck,
  MailOpen,
  Send,
  Loader2,
  ShieldCheck,
  ArrowRight,
  LogOut,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, getApiError } from '../../api';
import { EBizLogo } from '../common/EBizLogo';
import type { User, UserRole } from '../../types';
import { roleRoute } from './AuthSplitLayout';

/**
 * Email-verification state.
 * - `email_verified_at` set  → verified
 * - `email_verified_at: null` (explicit from API) → NOT verified → gate
 * - field absent (legacy response) → treated as verified (do not gate)
 */
export const isEmailVerified = (user: User | null | undefined): boolean => {
  if (!user) return false;
  if (user.email_verified_at === null) return false;
  return true;
};

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Beautiful branded "Check your email" screen shown after signup and to
 * any signed-in user whose /me response reports an unverified email.
 */
export const VerifyEmailPage: React.FC = () => {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setNotice(null);
    try {
      const res = await authApi.resendVerificationEmail();
      if (res.success) {
        setNotice({ kind: 'ok', text: 'Verification email sent. Please check your inbox (and spam folder).' });
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setNotice({ kind: 'err', text: res.message || 'Could not send the email. Please try again.' });
      }
    } catch (err) {
      setNotice({ kind: 'err', text: getApiError(err, 'Could not send the email. Please try again.') });
    } finally {
      setResending(false);
    }
  };

  const handleContinue = async () => {
    setChecking(true);
    setNotice(null);
    try {
      await refreshMe();
      // Re-read the latest user after refresh; navigate when verified.
      const stored = localStorage.getItem('biznetwork_token');
      if (stored) {
        const me = await authApi.me().catch(() => null);
        const latest = me?.data?.user;
        if (latest && isEmailVerified(latest)) {
          navigate(roleRoute[latest.role], { replace: true });
          return;
        }
      }
      setNotice({
        kind: 'err',
        text: 'Your email is not verified yet. Please click the link in the email, then try again.',
      });
    } catch {
      setNotice({ kind: 'err', text: 'Could not check verification status. Please try again.' });
    } finally {
      setChecking(false);
    }
  };

  const handleUseDifferentEmail = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Brand bar */}
      <div className="bg-[#07182F] px-6 py-4">
        <Link to="/" className="inline-flex">
          <EBizLogo variant="dark" size="sm" subtitleText="ebizearn.com" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[520px] text-center">
          <div className="bg-white rounded-[2rem] border border-[#E7ECF3] card-shadow p-8 sm:p-12">
            {/* Animated mail emblem */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-[#168BFF] to-[#7257FF] opacity-15 blur-xl" />
              <div className="relative w-24 h-24 rounded-[1.75rem] bg-gradient-to-br from-[#168BFF] to-[#7257FF] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MailCheck className="w-11 h-11 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#16B364] border-4 border-white flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#101828]">Check your email</h1>
            <p className="mt-3 text-base text-[#667085] leading-relaxed">
              We sent a verification link to{' '}
              <span className="font-bold text-[#101828] break-all">{user?.email || 'your email address'}</span>.
              Click the link to activate your account — it keeps your earnings and payouts secure.
            </p>

            {notice && (
              <div
                className={`mt-5 p-4 rounded-2xl text-sm font-medium flex items-start gap-2.5 text-left ${
                  notice.kind === 'ok'
                    ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-2 border-red-200 text-red-700'
                }`}
                role="status"
              >
                {notice.kind === 'ok' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <MailOpen className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span>{notice.text}</span>
              </div>
            )}

            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={handleContinue}
                disabled={checking}
                className="w-full min-h-[54px] px-6 rounded-2xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking…</span>
                  </>
                ) : (
                  <>
                    <span>I've verified my email — continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="w-full min-h-[52px] px-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#168BFF] hover:text-[#168BFF] text-slate-700 font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>Resend email in {cooldown}s</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Resend verification email</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#16B364]" />
              <span>Verification protects your wallet from unauthorized access.</span>
            </div>

            <button
              type="button"
              onClick={handleUseDifferentEmail}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#168BFF] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Use a different email
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Didn't get the email? Check your spam folder, or wait a minute and resend.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Post-login routing shared by every portal login page: the /me response
 * is the source of truth for email verification — unverified users are
 * sent to the verification gate instead of the dashboard.
 */
export const navigateAfterLogin = async (
  navigate: (to: string, opts?: { replace?: boolean }) => void,
  role: UserRole
): Promise<void> => {
  const me = await authApi.me().catch(() => null);
  const latest = me?.data?.user;
  if (latest && !isEmailVerified(latest)) {
    navigate('/verify-email', { replace: true });
    return;
  }
  navigate(roleRoute[role], { replace: true });
};

/**
 * Verification guard hook for money-moving actions (withdrawals, campaign
 * launch, proof submission) — an unverified user must not proceed
 * behind email verification. Call `requireVerified()` at the start of the
 * action handler; if it returns false the action must not run and a
 * friendly prompt modal is shown instead. Render `gate` near the page root.
 */
export const useRequireVerifiedEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promptOpen, setPromptOpen] = useState(false);

  const verified = isEmailVerified(user);

  const requireVerified = (): boolean => {
    if (verified) return true;
    setPromptOpen(true);
    return false;
  };

  const gate = promptOpen ? (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={() => setPromptOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Email verification required"
    >
      <div
        className="bg-white rounded-[1.75rem] w-full max-w-md p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setPromptOpen(false)}
          className="float-right p-1.5 rounded-lg hover:bg-slate-100 -mt-2 -mr-2"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-[#168BFF] to-[#7257FF] flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
          <MailCheck className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-black text-[#101828]">Verify your email first</h3>
        <p className="mt-2 text-sm text-[#667085] leading-relaxed">
          To keep your money safe, this action needs a verified email address. It takes less than a
          minute — check your inbox for our verification link.
        </p>
        <button
          type="button"
          onClick={() => {
            setPromptOpen(false);
            navigate('/verify-email');
          }}
          className="mt-5 w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] text-white font-extrabold text-base shadow-lg shadow-blue-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-2"
        >
          <span>Verify email now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setPromptOpen(false)}
          className="mt-2 w-full min-h-[48px] rounded-2xl text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  ) : null;

  return { isVerified: verified, requireVerified, gate };
};
