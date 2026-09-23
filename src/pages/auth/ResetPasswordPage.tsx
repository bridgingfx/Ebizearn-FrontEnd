import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, getApiError } from '../../api';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { AppFooter } from '../../components/common/AppFooter';
import { PasswordInput } from './PasswordInput';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Your new password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('The two passwords do not match. Please re-enter them.');
      return;
    }

    setSubmitting(true);

    try {
      await authApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      // Silent redirect would leave the user wondering — hand a confirmation to the login page.
      navigate('/login', { replace: true, state: { notice: 'Your password was reset. Sign in with your new password.' } });
    } catch (err) {
      setError(getApiError(err, 'Could not reset password. Please check the token and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC] dark:bg-[#0B0F19]">
      <div className="max-w-md w-full bg-white dark:bg-[#0C1322] rounded-3xl p-8 border border-[#E4EAF2] dark:border-white/10 shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <h2 className="text-2xl font-black text-[#101828] dark:text-gray-100">Choose New Password</h2>
          <p className="text-xs text-[#667085] mt-1">Set a new password for your eBizEarn account.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>
          <div>
            <label htmlFor="reset-token" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Reset Token</label>
            <input id="reset-token" type="text" required value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>
          <div>
            <label htmlFor="reset-password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <PasswordInput id="reset-password" value={password} onChange={setPassword} minLength={8} autoComplete="new-password" showStrength />
          </div>
          <div>
            <label htmlFor="reset-password-confirm" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <PasswordInput id="reset-password-confirm" value={passwordConfirmation} onChange={setPasswordConfirmation} minLength={8} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="w-4 h-4" />}
            <span>{submitting ? 'Updating password…' : 'Reset Password'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-[#168BFF] font-bold hover:underline">Back to login</Link>
        </div>
      </div>
      <div className="max-w-md w-full">
        <AppFooter />
      </div>
    </div>
  );
};




