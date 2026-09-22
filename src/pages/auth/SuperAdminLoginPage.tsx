import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Fingerprint, Lock } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import type { UserRole } from '../../types';

const roleRoute: Record<UserRole, string> = {
  contributor: '/app',
  business: '/business',
  moderator: '/admin',
  admin: '/admin',
  superadmin: '/admin/super',
};

/**
 * Private internal control-center sign-in (route: /secure-control-panel/login).
 *
 * SECURITY: This route is intentionally unlinked — no navigation menu, footer,
 * logo link, "back to home", or sitemap entry points here. Accounts are created
 * manually by an existing Super Admin; there is no public registration.
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
      const role = await login(email, password, 'superadmin');
      if (role) {
        if (role !== 'superadmin') {
          logout();
          setError('Access denied. This console is restricted to Super Admin accounts.');
          return;
        }
        navigate(roleRoute[role], { replace: true });
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      // Display the API's own message (covers 403 portal mismatch).
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050608] flex items-center justify-center px-4">
      {/* Faint scan-line texture + single cold glow */}
      <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-emerald-500/[0.07] blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-[#0b0d12] rounded-2xl p-8 border border-white/[0.07] shadow-2xl shadow-black">
          <div className="text-center mb-7">
            <div className="mx-auto mb-5 w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Restricted console</span>
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-100 tracking-tight">Control Panel</h1>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              Authorized Super Admin access only.<br />All sign-in attempts are logged.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/60 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 dark:text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 dark:text-gray-500 mb-1.5">Password</label>
              <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" dark />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#04120b] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{submitting ? 'Verifying…' : 'Enter Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-600 dark:text-gray-400">
          Internal systems only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};
