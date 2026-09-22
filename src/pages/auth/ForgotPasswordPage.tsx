import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, getApiError } from '../../api';
import { ArrowRight } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';

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
    <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E4EAF2] shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <h2 className="text-2xl font-black text-[#101828]">Reset Password</h2>
          <p className="text-xs text-[#667085] mt-1">Enter your account email to generate a reset link.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}
        {message && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">{message}</div>}
        {resetUrl && (
          <Link to={resetUrl.replace(window.location.origin, '')} className="mb-4 block p-3 bg-blue-50 border border-blue-200 text-[#168BFF] text-xs font-bold rounded-xl hover:bg-blue-100">
            Open local reset form
          </Link>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            <span>{submitting ? 'Creating Link...' : 'Send Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Remember your password? <Link to="/login" className="text-[#168BFF] font-bold hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};


