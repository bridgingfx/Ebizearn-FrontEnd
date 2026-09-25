import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  FileSearch,
  History,
  BadgeCheck,
} from 'lucide-react';
import {
  AuthSplitLayout,
  PortalBanner,
  AuthField,
  AuthError,
  AuthSubmitButton,
  authInputClass,
} from '../../components/auth/AuthSplitLayout';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
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
      <div className="mb-5 lg:mb-4 text-center">
        <h2 className="text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-[#07182F] dark:text-gray-100">Moderator <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168BFF] to-[#7257FF]">sign in</span></h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-400">Internal operations access — all sign-in attempts are logged</p>
      </div>

      {error && (
        <AuthError message={error} />
      )}

      <form onSubmit={handleLogin} className="space-y-4 lg:space-y-3.5" noValidate>
        <AuthField id="email" label="Work email" error={emailError}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => email && setEmailError(EMAIL_RE.test(email.trim()) ? null : 'Enter a valid work email address.')}
            placeholder="moderator@ebizearn.com"
            autoComplete="email"
            inputMode="email"
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          id="password"
          label="Password"
          error={passwordError}
          action={
            <Link to="/forgot-password" className="text-[13px] font-semibold text-[#168BFF] hover:underline">
              Forgot password?
            </Link>
          }
        >
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
          className="bg-gradient-to-r from-amber-400 to-amber-600 hover:brightness-105 !text-[#1a1405] shadow-lg shadow-amber-500/25"
        >
          <span>Moderator Login</span>
          <ArrowRight className="w-5 h-5" />
        </AuthSubmitButton>
      </form>

      <SocialLoginButtons portal="moderator" mode="login" dividerLabel="or" dividerClassName="my-5 lg:my-4" />
    </AuthSplitLayout>
  );
};
