import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, getApiError } from '../../api';
import { ArrowRight } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
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
    setSubmitting(true);
    setError(null);

    try {
      await authApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Could not reset password. Please check the token and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E4EAF2] shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <h2 className="text-2xl font-black text-[#101828]">Choose New Password</h2>
          <p className="text-xs text-[#667085] mt-1">Set a new password for your eBizEarn account.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Reset Token</label>
            <input type="text" required value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
            <PasswordInput value={password} onChange={setPassword} minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
            <PasswordInput value={passwordConfirmation} onChange={setPasswordConfirmation} minLength={8} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            <span>{submitting ? 'Updating Password...' : 'Reset Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link to="/login" className="text-[#168BFF] font-bold hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};




