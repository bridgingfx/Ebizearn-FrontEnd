import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Banknote,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AuthSplitLayout,
  PortalBanner,
  AuthField,
  AuthError,
  AuthSubmitButton,
  authInputClass,
  AuthMethodDivider,
} from '../../components/auth/AuthSplitLayout';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { PasswordInput } from './PasswordInput';
import { navigateAfterLogin } from '../../components/auth/EmailVerification';
import { prefetchWhenIdle, preloadContributorApp } from '../../routes/prefetch';
import { toast } from '../../utils/toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContributorLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  /** One-time notice passed from the password-reset flow. */
  const [notice] = useState<string | null>(() => (location.state as { notice?: string } | null)?.notice || null);

  useEffect(() => {
    if (notice) {
      toast.success(notice);
      window.history.replaceState({}, document.title);
    }
    // Runs once — clears the one-time navigation state after reading it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warm the contributor portal chunk in the background: the user is one
  // successful login away from /app, so prefetching now hides the chunk
  // download behind the login interaction.
  useEffect(() => {
    prefetchWhenIdle(preloadContributorApp);
  }, []);

  const validate = (): boolean => {
    let ok = true;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid email address.');
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
      const role = await login(email.trim(), password, 'contributor');
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
      image="/images/auth/contributor-login.webp"
      imageAlt="Contributor completing tasks on a phone and earning rewards"
      badge={<PortalBanner label="Contributor portal" />}
      headline={
        <>
          Complete tasks. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C4E8] to-[#168BFF]">Build rewards.</span>
        </>
      }
      subtext="Pick up verified campaigns from real brands, submit proof from your phone, and get paid in cash — free to join, always."
      accentClass="text-[#20C4E8]"
      bullets={[
        { icon: ShieldCheck, title: 'Verified campaigns', text: 'Every task comes from a real, reviewed business.' },
        { icon: Banknote, title: 'Real cash payouts', text: 'Withdraw to your bank from $50.' },
        { icon: Sparkles, title: 'Free forever', text: 'No fees, no deposits, no upgrades.' },
      ]}
    >
      <div className="mb-5 text-center">
        <h2 className="text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-[#07182F] dark:text-gray-100">Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168BFF] to-[#7257FF]">back</span></h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-400">Sign in to your contributor account.</p>
      </div>

      {error && <AuthError message={error} />}

      <form onSubmit={handleLogin} className="space-y-3.5" noValidate>
        <AuthField id="email" label="Email address" error={emailError}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => email && setEmailError(EMAIL_RE.test(email.trim()) ? null : 'Enter a valid email address.')}
            placeholder="you@example.com"
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

        <AuthSubmitButton loading={submitting} loadingLabel="Signing you in…">
          <span>Sign in</span>
          <ArrowRight className="w-4 h-4" />
        </AuthSubmitButton>
      </form>

      <AuthMethodDivider label="or" className="my-4" />

      <SocialLoginButtons portal="contributor" mode="login" />

      <p className="mt-5 text-center text-sm text-slate-500 dark:text-gray-400">
        New to eBiz Earn?{' '}
        <Link to="/contributor/register" className="text-[#168BFF] font-bold hover:underline">
          Create a free account
        </Link>
      </p>
    </AuthSplitLayout>
  );
};
