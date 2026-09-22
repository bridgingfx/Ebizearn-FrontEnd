import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, KeyRound, Lock } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';

/**
 * Hidden Super Admin console sign-in.
 *
 * SECURITY: This route is intentionally unlinked — no navigation menu, footer,
 * login hub, or sitemap entry points here. Accounts are created manually by an
 * existing Super Admin; there is no public registration for this role.
 */
export const SuperAdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const role = await login(email, password);
      if (role) {
        if (role !== 'superadmin') {
          logout();
          setError('Access denied. This console is restricted to Super Admin accounts.');
          return;
        }
        navigate('/admin/super', { replace: true });
      } else {
        setError('Invalid credentials.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#0A0F1C]">
      <div className="max-w-sm w-full bg-[#111827] rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <AuthFavicon />
          </div>
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-black text-gray-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Restricted console</span>
          </div>
          <h2 className="text-xl font-black text-white">Operations Console</h2>
          <p className="text-[11px] text-gray-500 mt-1">
            Authorized Super Admin access only. All sign-in attempts are logged.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-900 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Email</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#7357FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Password</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" dark />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#7357FF] hover:bg-[#5f45e0] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{submitting ? 'Verifying…' : 'Enter Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
