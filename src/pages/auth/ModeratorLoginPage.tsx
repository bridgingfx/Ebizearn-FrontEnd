import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  FileSearch,
  History,
  BadgeCheck,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  AuthSplitLayout,
  PortalBanner,
  AuthField,
  AuthError,
  AuthSubmitButton,
  authInputClass,
} from '../../components/auth/AuthSplitLayout';
import { PasswordInput } from './PasswordInput';
import { navigateAfterLogin } from '../../components/auth/EmailVerification';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ModeratorLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    let ok = true;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid work email address.');
      ok = false;
    } else {
      setEmailError(null);
    }
    if (password.length < 1) {
      setPasswordError('Enter your password.');
      ok = false;
    } else {
      setPasswordError(null);
    }
    return ok;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const role = await login(email.trim(), password, 'moderator');
      if (role) {
        await navigateAfterLogin(navigate, role);
      }
    } catch (err) {
      // Display the API's own message (covers 403 portal mismatch).
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      image="/images/auth/moderator-login.webp"
      imageAlt="Moderator reviewing verification tasks to keep the marketplace fair"
      badge={<PortalBanner label="Moderator access" />}
      headline={
        <>
          Review tasks.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Maintain marketplace quality.</span>
        </>
      }
      subtext="You keep the marketplace honest: audit campaigns, verify contributor proof, and act on fraud signals."
      accentClass="text-amber-300"
      bullets={[
        { icon: FileSearch, title: 'Proof audits', text: 'Review submissions with full context.' },
        { icon: History, title: 'Full audit trail', text: 'Every decision is logged with reviewer identity.' },
        { icon: BadgeCheck, title: 'Quality first', text: 'Protect contributors and businesses alike.' },
      ]}
    >
      <div className="mb-6 short:mb-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-[#1a1405] shadow-lg shadow-amber-500/30 short:hidden">
          <ShieldCheck className="w-6 h-6" />
        </span>
        <span className="mt-4 short:mt-0 inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
          <Lock className="w-3 h-3" /> Staff only
        </span>
        <h2 className="mt-3 text-[28px] short:text-[24px] leading-tight font-extrabold tracking-[-0.02em] text-[#07182F] dark:text-gray-100">
          Moderator{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">sign in</span>
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-400">Internal operations console. Every sign-in is logged.</p>
      </div>

      {error && <AuthError message={error} />}

      <form onSubmit={handleLogin} className="space-y-4 short:space-y-3" noValidate>
        <AuthField id="email" label="Work email" error={emailError}>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => email && setEmailError(EMAIL_RE.test(email.trim()) ? null : 'Enter a valid work email address.')}
              placeholder="name@ebizearn.com"
              autoComplete="email"
              inputMode="email"
              className={`${authInputClass} pl-10 focus:!border-amber-500 focus:!ring-amber-500/15`}
            />
          </div>
        </AuthField>

        <AuthField id="password" label="Password" error={passwordError}>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
            large
          />
        </AuthField>

        <AuthSubmitButton
          loading={submitting}
          loadingLabel="Verifying…"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-105 !text-[#1a1405] shadow-lg shadow-amber-500/25"
        >
          <span>Enter moderator console</span>
          <ArrowRight className="w-5 h-5" />
        </AuthSubmitButton>
      </form>

      <div className="mt-5 short:mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] px-4 py-3">
        <KeyRound className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
        <p className="text-xs leading-relaxed text-slate-600 dark:text-gray-400">
          Staff accounts are created by a Super Admin. <span className="font-semibold text-slate-800 dark:text-gray-200">Forgot your password?</span> Ask your Super Admin to reset it.
        </p>
      </div>

      <p className="mt-4 short:mt-3 text-center text-[13px] text-slate-500 dark:text-gray-400">
        Not on the team?{' '}
        <Link to="/login" className="font-semibold text-[#168BFF] hover:underline">Contributor login</Link>
        <span className="mx-1.5 text-slate-300">·</span>
        <Link to="/business/login" className="font-semibold text-[#168BFF] hover:underline">Business login</Link>
      </p>
    </AuthSplitLayout>
  );
};
