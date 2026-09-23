import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, getApiError } from '../../api';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { AppFooter } from '../../components/common/AppFooter';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setResetUrl(null);

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message || 'If that email exists, reset instructions are ready.');
      if (res.data?.reset_url) {
        setResetUrl(res.data.reset_url);
      }
    } catch (err) {
      setError(getApiError(err, 'Could not create reset link. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC] dark:bg-[#0B0F19]">
      <div className="max-w-md w-full bg-white dark:bg-[#0C1322] rounded-3xl p-8 border border-[#E4EAF2] dark:border-white/10 shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <h2 className="text-2xl font-bold text-[#101828] dark:text-gray-100">Reset Password</h2>
          <p className="text-xs text-[#667085] mt-1">Enter your account email to generate a reset link.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl" role="alert">{error}</div>}
        {message && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl" role="status">{message}</div>}
        {resetUrl && (
          <Link to={resetUrl.replace(window.location.origin, '')} className="mb-4 block p-3 bg-blue-50 border border-blue-200 text-[#168BFF] text-xs font-bold rounded-xl hover:bg-blue-100">
            Open local reset form
          </Link>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" inputMode="email" className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px]">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="w-4 h-4" />}
            <span>{submitting ? 'Creating link…' : 'Send Reset Link'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Remember your password? <Link to="/login" className="text-[#168BFF] font-bold hover:underline">Back to login</Link>
        </div>
      </div>
      <div className="max-w-md w-full">
        <AppFooter />
      </div>
    </div>
  );
};


