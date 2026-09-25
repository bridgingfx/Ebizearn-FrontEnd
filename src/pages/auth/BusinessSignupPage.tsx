import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Gift,
  HandCoins,
  Landmark,
  ScanSearch,
} from 'lucide-react';
import { authApi, getApiError, getApiFieldErrors } from '../../api';
import {
  AuthSplitLayout,
  AuthBadge,
  AuthField,
  AuthError,
  AuthSubmitButton,
  authInputClass,
  AuthMethodDivider,
} from '../../components/auth/AuthSplitLayout';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { PasswordInput } from './PasswordInput';
import {
  PhoneField,
} from '../../components/auth/PhoneInput';
import { phoneDigits, validatePhone, type PhoneValue } from '../../utils/phone';
import { DEFAULT_DIAL } from '../../utils/countryDialCodes';
import { setPendingOtpEmail } from '../../utils/pendingAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const INDUSTRIES = ['Tech & SaaS', 'E-Commerce', 'Consumer Brands', 'Mobile Apps', 'Real Estate', 'Finance', 'Other'];

export const BusinessSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Tech & SaaS');
  const [phone, setPhone] = useState<PhoneValue>({ dialCode: DEFAULT_DIAL, number: '' });
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showReferral, setShowReferral] = useState(!!referralCode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (companyName.trim().length < 2) errs.companyName = 'Enter your company or brand name.';
    if (name.trim().length < 2) errs.name = 'Enter the contact person’s name.';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid work email address.';
    const phoneErr = validatePhone(phone);
    if (phoneErr) errs.phone = phoneErr;
    if (!STRONG_PASSWORD_RE.test(password)) {
      errs.password = 'Use 10+ characters with uppercase, lowercase, number, and symbol.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);

    try {
      // IMPORTANT: per the OTP contract the account is created unverified
      // with NO session token — so call authApi directly and do NOT persist
      // anything here. The token arrives later from otp/verify.
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'business',
        company_name: companyName.trim(),
        referral_code: referralCode.trim() || undefined,
        phone_country_code: phone.dialCode,
        phone_number: phoneDigits(phone.number),
      });

      if (!res.success || !res.data?.user) {
        setSubmitting(false);
        setError(res.message || 'Could not create your business account. Please check the form and try again.');
        return;
      }

      // The backend sends the first OTP email itself inside the register
      // transaction — no otp/send call here (that would deliver a second
      // email). Hand off to the code-entry step; resends go through the
      // VerifyOtpPage "Resend code" button.
      setPendingOtpEmail(email.trim(), 'business');
      setSubmitting(false);
      navigate('/verify-otp', { replace: true });
    } catch (err) {
      setSubmitting(false);
      const apiFields = getApiFieldErrors(err);
      const mapped: Record<string, string> = {};
      Object.entries(apiFields).forEach(([k, v]) => {
        const key = k.startsWith('phone') ? 'phone' : k === 'company_name' ? 'companyName' : k;
        if (!mapped[key]) mapped[key] = v;
      });
      if (mapped.website || mapped.referral_code) setShowReferral(true);
      setFieldErrors((prev) => ({ ...prev, ...mapped }));
      setError(getApiError(err, 'Could not create your business account. Please check the form and try again.'));
    }
  };

  return (
    <AuthSplitLayout
      image="/images/auth/business-login.webp"
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
      <div className="mb-5 short:mb-3 text-center">
        <h2 className="text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-[#07182F] dark:text-gray-100">
          Create{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168BFF] to-[#7257FF]">business account</span>
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-400 short:hidden">Set up your campaign workspace.</p>
      </div>

      {error && (
        <AuthError message={error} />
      )}

      <form onSubmit={handleSignup} className="space-y-3 short:space-y-2.5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <AuthField id="industry" label="Industry">
            <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={authInputClass}>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </AuthField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        <PhoneField
          id="phone"
          label="Business phone"
          value={phone}
          onChange={(v) => {
            setPhone(v);
            if (fieldErrors.phone) {
              const next = { ...fieldErrors };
              const err = validatePhone(v);
              if (err) next.phone = err;
              else delete next.phone;
              setFieldErrors(next);
            }
          }}
          error={fieldErrors.phone || undefined}
        />



        <AuthField
          id="password"
          label="Password"
          error={fieldErrors.password}
          hint={password ? undefined : '10+ characters with uppercase, lowercase, number and symbol.'}
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            minLength={10}
            autoComplete="new-password"
            large
            showStrength
          />
        </AuthField>

        {showReferral ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthField id="website" label="Website (optional)">
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
            <AuthField id="referral" label="Referral code (optional)" error={fieldErrors.referral_code}>
              <div className="relative">
                <Gift className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="referral"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. AB12CD34"
                  autoComplete="off"
                  className={`${authInputClass} pl-10 uppercase`}
                />
              </div>
            </AuthField>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowReferral(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#168BFF] hover:underline"
          >
            <Gift className="w-3.5 h-3.5" /> Add website or referral code
          </button>
        )}

        <AuthSubmitButton loading={submitting} loadingLabel="Setting up your workspace…" className="bg-[#07182F] hover:bg-[#0D2342] shadow-lg shadow-slate-900/25">
          <span>Create business account</span>
          <ArrowRight className="w-4 h-4" />
        </AuthSubmitButton>

        <p className="text-[11px] text-slate-400 dark:text-gray-500 leading-relaxed text-center">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline hover:text-slate-600">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
        </p>
      </form>

      <AuthMethodDivider label="or" className="my-4 short:my-3" />

      <SocialLoginButtons portal="business" mode="register" />

      <div className="mt-4 short:mt-3 text-center text-sm text-slate-500 dark:text-gray-400 space-y-0.5">
        <p>
          Already have a business account?{' '}
          <Link to="/business/login" className="text-[#168BFF] font-bold hover:underline">Business sign in</Link>
        </p>
        <p className="text-[13px] short:hidden">
          Want to earn as a contributor?{' '}
          <Link to="/contributor/register" className="font-semibold text-slate-600 dark:text-gray-400 hover:underline">Register as contributor</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};
