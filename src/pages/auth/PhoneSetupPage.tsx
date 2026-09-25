import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, PhoneCall, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, getApiError, getOtpError } from '../../api';
import {
  AuthSplitLayout,
  AuthBadge,
  AuthError,
} from '../../components/auth/AuthSplitLayout';
import { PhoneField } from '../../components/auth/PhoneInput';
import { phoneDigits, phoneToE164, validatePhone, type PhoneValue } from '../../utils/phone';
import { DEFAULT_DIAL } from '../../utils/countryDialCodes';
import { getPendingPhoneRole, clearPendingPhoneRole } from '../../utils/pendingAuth';
import { navigateAfterLogin } from '../../components/auth/EmailVerification';

const PHONE_SETUP_BULLETS = [
  { icon: PhoneCall, title: 'Security alerts', text: 'Get notified about important account activity.' },
  { icon: ShieldCheck, title: 'Payout safety', text: 'We confirm withdrawals with you first.' },
  { icon: CheckCircle2, title: 'No spam', text: 'Never used for marketing. Ever.' },
];

/**
 * ONE required screen shown after Google signup when the account has no
 * phone on file. Same PhoneField component as the email signup forms.
 * No email OTP is asked for in this flow — Google already verified the email.
 *
 * If the phone-save endpoint isn't deployed yet (404), the page shows a
 * friendly "being set up" message with a retry button plus a "continue
 * without" escape hatch so the user is never trapped.
 */
export const PhoneSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const [phone, setPhone] = useState<PhoneValue>({ dialCode: DEFAULT_DIAL, number: '' });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceDown, setServiceDown] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Must be signed in (Google flow completed). Otherwise bounce to login —
   * never render a dead form. */
  if (!token || !user) {
    return (
      <AuthSplitLayout
        image="/images/auth/contributor-login.webp"
        imageAlt="Account setup"
        badge={<AuthBadge icon={<PhoneCall className="w-3.5 h-3.5" />} label="Almost done" />}
        headline="One more step"
        subtext="Finish setting up your account."
        accentClass="text-[#20C4E8]"
        bullets={PHONE_SETUP_BULLETS}
      >
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-gray-400">
            Your session expired before we could finish setup. Please sign in again.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex min-h-[52px] px-6 items-center justify-center rounded-2xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] text-white font-extrabold shadow-lg shadow-blue-500/25"
          >
            Back to sign in
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  const proceed = async () => {
    const pendingRole = getPendingPhoneRole();
    clearPendingPhoneRole();
    await navigateAfterLogin(navigate, (pendingRole as 'contributor' | 'business') || user.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setServiceDown(false);
    const phoneErr = validatePhone(phone);
    setFieldError(phoneErr);
    if (phoneErr) return;
    setSaving(true);
    try {
      const res = await authApi.updatePhone({
        phone_country_code: phone.dialCode,
        phone_number: phoneDigits(phone.number),
      });
      const latest = res?.data?.user;
      if (res.success && latest) {
        updateUser(latest);
      } else {
        // Backend accepted it but returned no user — patch locally so the
        // phone gate doesn't re-trigger on the next sign-in.
        updateUser({ ...user, phone: phoneToE164(phone) });
      }
      await proceed();
    } catch (err) {
      const failure = getOtpError(err);
      if (failure.code === 'service_unavailable') {
        setServiceDown(true);
      } else {
        setError(
          getApiError(err, 'Could not save your phone number. Please try again.')
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthSplitLayout
      image="/images/auth/contributor-login.webp"
      imageAlt="Finishing account setup"
      badge={<AuthBadge icon={<PhoneCall className="w-3.5 h-3.5" />} label="Almost done" />}
      headline={
        <>
          Add your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168BFF] to-[#7257FF]">
            phone number.
          </span>
        </>
      }
      subtext="We use it to secure your account and for payout-related alerts. Nothing else."
      accentClass="text-[#168BFF]"
      bullets={PHONE_SETUP_BULLETS}
    >
      <div className="mb-4 lg:mb-3">
        <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-900 dark:text-gray-100">
          One last detail
        </h2>
        <p className="mt-1.5 text-base text-slate-500 dark:text-gray-400">
          Hi {user.name.split(' ')[0]} — your Google account is connected. Add a phone number to finish.
        </p>
      </div>

      {serviceDown && (
        <div className="mb-5 p-4 bg-amber-50 border-2 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-2xl flex items-start gap-2.5" role="status">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Phone setup is being set up — please try again shortly.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{saving ? 'Retrying…' : 'Retry'}</span>
              </button>
              <button
                type="button"
                onClick={() => void proceed()}
                className="inline-flex items-center min-h-[44px] px-4 rounded-xl text-sm font-bold text-amber-800 dark:text-amber-200 hover:underline"
              >
                Continue without adding a phone
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5">
          <AuthError message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <PhoneField
          id="setup-phone"
          label="Phone number"
          value={phone}
          onChange={(v) => {
            setPhone(v);
            if (fieldError) setFieldError(validatePhone(v));
          }}
          error={fieldError}
          hint="We’ll only use this for account security and payout alerts."
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-[54px] px-6 text-white font-extrabold text-base rounded-2xl bg-gradient-to-r from-[#168BFF] to-[#7257FF] hover:brightness-105 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <span>Save & continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => void proceed()}
          className="mx-auto block text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-[#168BFF] transition-colors min-h-[44px]"
        >
          Skip for now
        </button>
      </form>
    </AuthSplitLayout>
  );
};
