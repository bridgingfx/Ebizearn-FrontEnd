import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Landmark,
  ScanSearch,
  HandCoins,
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
import { prefetchWhenIdle, preloadBusinessApp } from '../../routes/prefetch';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const BusinessLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Warm the business CRM chunk in the background: the user is one successful
  // login away from /business, so prefetching now hides the chunk download
  // behind the login interaction.
  useEffect(() => {
    prefetchWhenIdle(preloadBusinessApp);
  }, []);

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
      const role = await login(email.trim(), password, 'business');
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
      image="/images/auth/business-login.jpg"
      imageAlt="Business team launching a verified marketing campaign"
      badge={<PortalBanner label="Business portal" />}
      headline={
        <>
          Launch verified campaigns with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C4E8] to-[#16B364]">real contributors.</span>
        </>
      }
      subtext="Fund campaigns in minutes, watch verified proof roll in, and pay only for authentic results."
      accentClass="text-[#20C4E8]"
      bullets={[
        { icon: Landmark, title: 'Escrow-protected funds', text: 'Budgets stay locked until proof is verified.' },
        { icon: ScanSearch, title: 'Proof verification', text: 'Every submission is checked before payout.' },
        { icon: HandCoins, title: 'Pay for results', text: 'Only approved, authentic work is charged.' },
      ]}
    >
      <div className="mb-5 lg:mb-4">
        <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900 dark:text-gray-100">Business sign in</h2>
        <p className="mt-1.5 text-base text-slate-500 dark:text-gray-400">Access your campaign command center</p>
      </div>

      {error && (
        <div className="mb-5">
          <AuthError message={error} />
        </div>
      )}

      <AuthMethodDivider label="Continue with email" className="mb-5" />

      <form onSubmit={handleLogin} className="space-y-4 lg:space-y-3.5" noValidate>
        <AuthField id="email" label="Work email" error={emailError}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => email && setEmailError(EMAIL_RE.test(email.trim()) ? null : 'Enter a valid work email address.')}
            placeholder="you@company.com"
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
            <Link to="/forgot-password" className="text-sm font-bold text-[#168BFF] hover:underline min-h-[44px] inline-flex items-center">
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

        <AuthSubmitButton loading={submitting} loadingLabel="Signing you in…" className="bg-[#07182F] hover:bg-[#0D2342] shadow-lg shadow-slate-900/25">
          <span>Business Login</span>
          <ArrowRight className="w-5 h-5" />
        </AuthSubmitButton>
      </form>

      <div className="mt-5 lg:mt-4 flex items-center gap-4">
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">or</span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="mt-5 lg:mt-4">
        <SocialLoginButtons portal="business" mode="login" />
      </div>

      <p className="mt-5 lg:mt-4 text-center text-base text-slate-500 dark:text-gray-400">
        New to eBiz Earn for business?{' '}
        <Link to="/business/register" className="text-[#168BFF] font-bold hover:underline">
          Create a business account
        </Link>
      </p>
    </AuthSplitLayout>
  );
};
