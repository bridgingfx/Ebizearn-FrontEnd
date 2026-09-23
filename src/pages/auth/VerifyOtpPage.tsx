import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react';import { useAuth } from '../../context/AuthContext';
import { authApi, getOtpError, type OtpFailure } from '../../api';
import {
  getPendingOtpEmail,
  clearPendingOtp,
} from '../../utils/pendingAuth';
import {
  AuthSplitLayout,
  AuthBadge,
  AuthError,
  authInputClass,
} from '../../components/auth/AuthSplitLayout';
import { navigateAfterLogin } from '../../components/auth/EmailVerification';

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

/**
 * Friendly copy per OTP error code. `expired` / `too_many_attempts` steer
 * the user toward resending a fresh code; `invalid` shakes the boxes and
 * shows remaining attempts when the backend reports them.
 */
function messageFor(failure: OtpFailure): string {
  switch (failure.code) {
    case 'expired':
      return 'This code has expired. Tap “Resend code” below and we’ll send you a fresh one.';
    case 'too_many_attempts':
      return 'Too many wrong attempts — that code is now locked. Tap “Resend code” for a fresh one.';
    case 'invalid':
      return failure.attemptsRemaining !== undefined && failure.attemptsRemaining > 0
        ? `That code didn’t match. ${failure.attemptsRemaining} ${failure.attemptsRemaining === 1 ? 'attempt' : 'attempts'} left before it locks.`
        : 'That code didn’t match. Check the email and try again.';
    case 'cooldown':
      return 'A code was just sent — please wait a moment before requesting another.';
    case 'rate_limited':
      return 'Too many requests. Please wait a little while and try again.';
    case 'not_found':
      return 'We couldn’t find a code for this email. Tap “Resend code” to get one.';
    case 'network':
      return failure.message;
    case 'service_unavailable':
      return failure.message;
    default:
      return (
        failure.message ||
        'Something went wrong verifying your code. Please try again.'
      );
  }
}

const OTP_BULLETS = [
  { icon: ShieldCheck, title: 'Protected account', text: 'Verification keeps your earnings safe.' },
  { icon: MailCheck, title: 'One code', text: 'A 6-digit code lands in your inbox in seconds.' },
  { icon: CheckCircle2, title: 'Instant access', text: 'Enter it and you’re signed straight in.' },
];

/**
 * Email-OTP step shown right after a successful email signup.
 *
 * Contract: register created the (unverified) user with NO session token and
 * the backend sent the first OTP email inside the register transaction.
 * This page verifies the 6-digit code via `otp/verify` (resends via
 * `otp/send`); on success it persists the returned Sanctum token exactly
 * like a login (auto-logged-in) via AuthContext.completeSession.
 *
 * The OTP endpoints are deployed separately by the backend worker — a 404
 * surfaces the friendly "being set up" banner with a retry button instead
 * of an error screen. The page never white-screens: every state (no email,
 * service down, network failure) has rendered UI.
 */
export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeSession } = useAuth();
  const [pending] = useState(getPendingOtpEmail);
  const email = pending.email;
  const role = pending.role;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [serviceDown, setServiceDown] = useState(false);
  const [success, setSuccess] = useState(false);
  /** Bump to re-trigger the shake animation on invalid codes. */
  const [shakeKey, setShakeKey] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const verify = useCallback(
    async (code: string) => {
      if (!email || verifyingRef.current || code.length !== CODE_LENGTH) return;
      verifyingRef.current = true;
      setVerifying(true);
      setError(null);
      try {
        const res = await authApi.otpVerify(email, code);
        if (res.success && res.data.user && res.data.token) {
          setSuccess(true);
          clearPendingOtp();
          const userRole = completeSession(res.data.user, res.data.token);
          await navigateAfterLogin(navigate, userRole);
          return;
        }
        setError(res.message || 'Verification failed. Please try again.');
      } catch (err) {
        const failure = getOtpError(err);
        if (failure.code === 'service_unavailable') {
          setServiceDown(true);
        } else if (failure.code === 'cooldown' && failure.retryAfter) {
          setCooldown(Math.min(failure.retryAfter, 300));
        }
        setError(messageFor(failure));
        if (failure.code === 'invalid') {
          setShakeKey((k) => k + 1);
        }
      } finally {
        verifyingRef.current = false;
        setVerifying(false);
      }
    },
    [email, completeSession, navigate]
  );

  const setDigit = (index: number, char: string) => {
    const d = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = d;
    setDigits(next);
    if (d && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (next.every((c) => c !== '')) {
      void verify(next.join(''));
    }
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusAt = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusAt]?.focus();
    if (pasted.length === CODE_LENGTH) {
      void verify(pasted);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await authApi.otpSend(email);
      if (res.success) {
        setServiceDown(false);
        setDigits(Array(CODE_LENGTH).fill(''));
        setCooldown(RESEND_COOLDOWN_SECONDS);
        inputsRef.current[0]?.focus();
      } else {
        setError(res.message || 'Could not resend the code. Please try again.');
      }
    } catch (err) {
      const failure = getOtpError(err);
      if (failure.code === 'service_unavailable') {
        setServiceDown(true);
      } else if (failure.code === 'cooldown' && failure.retryAfter) {
        setCooldown(Math.min(failure.retryAfter, 300));
      }
      setError(messageFor(failure));
    } finally {
      setResending(false);
    }
  };

  const isBusiness = role === 'business';

  /* No email in session (deep link / refresh without state): explain and
   * offer a way back instead of rendering nothing. */
  if (!email) {
    return (
      <AuthSplitLayout
        image="/images/auth/contributor-login.jpg"
        imageAlt="Email verification"
        badge={<AuthBadge icon={<MailCheck className="w-3.5 h-3.5" />} label="Email verification" />}
        headline="Verify your email"
        subtext="Enter the 6-digit code we sent you to activate your account."
        accentClass="text-[#20C4E8]"
        bullets={OTP_BULLETS}
      >
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-gray-400">
            We couldn’t find your signup details for this session.
          </p>
          <Link
            to="/contributor/register"
            className="mt-5 inline-flex min-h-[52px] px-6 items-center justify-center rounded-2xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] text-white font-extrabold shadow-lg shadow-blue-500/25"
          >
            Back to sign up
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      image={isBusiness ? '/images/auth/business-login.jpg' : '/images/auth/contributor-login.jpg'}
      imageAlt="Verifying a new account"
      badge={<AuthBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Email verification" />}
      headline={
        <>
          Enter your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168BFF] to-[#7257FF]">
            6-digit code.
          </span>
        </>
      }
      subtext="This keeps your account — and your earnings — secure."
      accentClass="text-[#168BFF]"
      bullets={OTP_BULLETS}
    >
      <div className="mb-4 lg:mb-3">
        <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-900 dark:text-gray-100">
          Check your inbox
        </h2>
        <p className="mt-1.5 text-base text-slate-500 dark:text-gray-400">
          We sent a 6-digit code to{' '}
          <span className="font-bold text-slate-800 dark:text-gray-200 break-all">{email}</span>
        </p>
      </div>

      {serviceDown && (
        <div className="mb-5 p-4 bg-amber-50 border-2 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-2xl flex items-start gap-2.5" role="status">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Verification service is being set up — please try again shortly.</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-2 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{resending ? 'Retrying…' : 'Retry'}</span>
            </button>
          </div>
        </div>
      )}

      {error && !serviceDown && (
        <div className="mb-5">
          <AuthError message={error} />
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-sm font-medium rounded-2xl flex items-start gap-2.5" role="status">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Code verified — signing you in…</span>
        </div>
      )}

      <div key={shakeKey} className={shakeKey > 0 ? 'animate-otp-shake' : ''}>
        <div
          className="flex items-center justify-between gap-2 sm:gap-3"
          role="group"
          aria-label="6-digit verification code"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={i === 0 ? onPaste : undefined}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              aria-label={`Digit ${i + 1} of 6`}
              disabled={verifying || success}
              className={`${authInputClass} !px-0 text-center !text-2xl font-extrabold aspect-square w-full disabled:opacity-60`}
            />
          ))}
        </div>
      </div>

      {verifying && (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400" role="status">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying…</span>
        </p>
      )}

      <div className="mt-6 text-center">
        {cooldown > 0 ? (
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Resend code in <span className="font-bold tabular-nums">{cooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-2 min-h-[48px] px-4 text-sm font-bold text-[#168BFF] hover:underline disabled:opacity-60"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{resending ? 'Sending…' : 'Resend code'}</span>
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-gray-400">
        <ShieldCheck className="w-4 h-4 text-[#16B364]" />
        <span>Codes expire after a few minutes for your security.</span>
      </div>

      <button
        type="button"
        onClick={() => {
          clearPendingOtp();
          navigate('/login', { replace: true });
        }}
        className="mt-4 mx-auto block text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-[#168BFF] transition-colors"
      >
        Use a different email
      </button>
    </AuthSplitLayout>
  );
};
