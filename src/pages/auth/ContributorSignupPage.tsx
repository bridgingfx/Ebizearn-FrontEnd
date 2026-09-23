import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AuthSplitLayout,
  AuthBadge,
  AuthField,
  AuthError,
  AuthSubmitButton,
  authInputClass,
} from '../../components/auth/AuthSplitLayout';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { PasswordInput } from './PasswordInput';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'PH', name: 'Philippines' },
];

export const ContributorSignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refCodeFromUrl = searchParams.get('ref') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('AE');
  const [referralCode, setReferralCode] = useState(refCodeFromUrl);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (password.length < 8) errs.password = 'Use at least 8 characters.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'contributor',
      country_code: country,
      referral_code: referralCode.trim() || undefined,
    });

    setSubmitting(false);
    if (result.ok) {
      // Never drop a new user straight into the dashboard: verify email first.
      navigate('/verify-email', { replace: true });
      return;
    }
    setError(result.message || 'Could not create your account. Please check the form and try again.');
  };

  return (
    <AuthSplitLayout
      image="/images/auth/contributor-login.jpg"
      imageAlt="New contributor starting to earn from verified tasks"
      badge={
        <AuthBadge icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Contributor registration" />
      }
      headline={
        <>
          Start earning in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C4E8] to-[#168BFF]">under 60 seconds.</span>
        </>
      }
      subtext="Free forever — no fees, no deposits. Complete verified tasks and withdraw real cash."
      accentClass="text-[#20C4E8]"
      bullets={[
        { icon: ShieldCheck, title: 'Verified campaigns', text: 'Every task comes from a real, reviewed business.' },
        { icon: Banknote, title: 'Real cash payouts', text: 'Withdraw to your bank from $50.' },
        { icon: Sparkles, title: 'Free forever', text: 'No fees, no deposits, no upgrades.' },
      ]}
    >
      <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-[#16B364] shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-extrabold text-emerald-900">100% free to join & earn</p>
          <p className="text-sm text-emerald-700 leading-snug">No registration fees, no upgrade plans, no deposit. Ever.</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900 dark:text-gray-100">Create your free account</h2>
        <p className="mt-1.5 text-base text-slate-500 dark:text-gray-400">Start earning from verified digital tasks today</p>
      </div>

      {error && (
        <div className="mb-5">
          <AuthError message={error} />
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5" noValidate>
        <AuthField id="name" label="Full name" error={fieldErrors.name}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            autoComplete="name"
            className={authInputClass}
          />
        </AuthField>

        <AuthField id="email" label="Email address" error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            autoComplete="email"
            inputMode="email"
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          id="password"
          label="Password"
          error={fieldErrors.password}
          hint="At least 8 characters. Use a mix of letters and numbers."
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            minLength={8}
            autoComplete="new-password"
            large
            showStrength
          />
        </AuthField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField id="country" label="Country">
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`${authInputClass} min-h-[52px]`}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </AuthField>

          <AuthField id="referral" label="Referral code" hint="Optional">
            <div className="relative">
              <Gift className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-4 top-[18px]" />
              <input
                id="referral"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Optional"
                autoComplete="off"
                className={`${authInputClass} pl-11 uppercase`}
              />
            </div>
          </AuthField>
        </div>

        <AuthSubmitButton loading={submitting} loadingLabel="Creating your account…">
          <span>Create free account</span>
          <ArrowRight className="w-5 h-5" />
        </AuthSubmitButton>

        <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed text-center">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">or</span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="mt-6">
        <SocialLoginButtons portal="contributor" mode="register" />
      </div>

      <p className="mt-7 text-center text-base text-slate-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#168BFF] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
};
