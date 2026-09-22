import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Building2,
  HandCoins,
  Landmark,
  ScanSearch,
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

const INDUSTRIES = ['Tech & SaaS', 'E-Commerce', 'Consumer Brands', 'Mobile Apps', 'Real Estate', 'Finance', 'Other'];

export const BusinessSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Tech & SaaS');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (companyName.trim().length < 2) errs.companyName = 'Enter your company or brand name.';
    if (name.trim().length < 2) errs.name = 'Enter the contact person’s name.';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid work email address.';
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
      role: 'business',
      company_name: companyName.trim(),
    });

    setSubmitting(false);
    if (result.ok) {
      // New businesses verify email before touching the CRM.
      navigate('/verify-email', { replace: true });
      return;
    }
    setError(result.message || 'Could not create your business account. Please check the form and try again.');
  };

  return (
    <AuthSplitLayout
      image="/images/auth/business-login.jpg"
      imageAlt="Business team launching a verified marketing campaign"
      badge={
        <AuthBadge icon={<Building2 className="w-3.5 h-3.5" />} label="Business registration" />
      }
      headline={
        <>
          Reach thousands of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0D488] via-[#D4AF37] to-[#B8912A]">verified humans</span>{' '}
          this week.
        </>
      }
      subtext="Create your corporate account in 2 minutes, fund your campaign, and mobilize real contributors — pay only for verified proof."
      accentClass="text-[#D4AF37]"
      artworkTheme="midnight"
      bullets={[
        { icon: Landmark, title: 'Escrow-protected funds', text: 'Budgets stay locked until proof is verified.' },
        { icon: ScanSearch, title: 'Proof verification', text: 'Every submission is checked before payout.' },
        { icon: HandCoins, title: 'Pay for results', text: 'Only approved, authentic work is charged.' },
      ]}
    >
      <div className="mb-6">
        <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900 dark:text-gray-100">Create business account</h2>
        <p className="mt-1.5 text-base text-slate-500 dark:text-gray-400">Set up your campaign workspace</p>
      </div>

      {error && (
        <div className="mb-5">
          <AuthError message={error} />
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5" noValidate>
        <AuthField id="companyName" label="Company / brand name" error={fieldErrors.companyName}>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Growth Labs"
            autoComplete="organization"
            className={authInputClass}
          />
        </AuthField>

        <div className="grid grid-cols-2 gap-4">
          <AuthField id="name" label="Contact name" error={fieldErrors.name}>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alexandre Dubois"
              autoComplete="name"
              className={authInputClass}
            />
          </AuthField>

          <AuthField id="industry" label="Industry">
            <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={authInputClass}>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </AuthField>
        </div>

        <AuthField id="email" label="Work email" error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@company.com"
            autoComplete="email"
            inputMode="email"
            className={authInputClass}
          />
        </AuthField>

        <AuthField id="website" label="Website URL" hint="Optional">
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://acme.com"
            autoComplete="url"
            inputMode="url"
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
          />
        </AuthField>

        <AuthSubmitButton loading={submitting} loadingLabel="Setting up your workspace…" className="bg-[#07182F] hover:bg-[#0D2342] shadow-lg shadow-slate-900/25">
          <span>Create business account</span>
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
        <SocialLoginButtons portal="business" mode="register" />
      </div>

      <div className="mt-7 text-center text-base text-slate-500 dark:text-gray-400 space-y-1.5">
        <p>
          Already have a business account?{' '}
          <Link to="/business/login" className="text-[#168BFF] font-bold hover:underline">Business sign in</Link>
        </p>
        <p>
          Want to earn as a contributor?{' '}
          <Link to="/contributor/register" className="font-semibold text-slate-600 dark:text-gray-400 hover:underline">Register as contributor</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};
