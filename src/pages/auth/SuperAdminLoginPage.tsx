import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Fingerprint, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { toast } from '../../utils/toast';
import { useHideChatWidget } from '../../utils/useHideChatWidget';
import { PasswordInput } from './PasswordInput';
import { AppFooter } from '../../components/common/AppFooter';
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
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  useHideChatWidget(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const role = await login(email, password, 'superadmin');
      if (role) {
        if (role !== 'superadmin') {
          logout();
          toast.error('Access denied. This console is restricted to Super Admin accounts.');
          return;
        }
        navigate(roleRoute[role], { replace: true });
      } else {
        toast.error('Invalid credentials.');
      }
    } catch (err) {
      // Display the API's own message (covers 403 portal mismatch).
      toast.error(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="console-login min-h-screen relative overflow-hidden bg-[#050608] flex flex-col px-4">
      {/* Faint scan-line texture + single cold glow */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
      <div className="pointer-events-none absolute top-[18%] left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] max-w-[120vw] bg-emerald-500/[0.08] blur-3xl rounded-full" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-[400px] rounded-3xl border border-white/[0.08] bg-[#0b0d12]/90 backdrop-blur-xl p-7 sm:p-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/5 border border-emerald-400/20 flex items-center justify-center shadow-[0_0_40px_-8px_rgba(16,185,129,0.45)]">
              <Fingerprint className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
              <Lock className="w-3 h-3" />
              Restricted console
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Control Panel</h1>
            <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">
              Authorized Super Admin access only. All sign-in attempts are logged.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="console-email" className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
              <input
                id="console-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full h-11 px-3.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div>
              <label htmlFor="console-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <PasswordInput id="console-password" value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" dark large />
            </div>

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full h-11 mt-2 bg-emerald-500 hover:bg-emerald-400 text-[#04120b] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{submitting ? 'Verifying…' : 'Enter Console'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5" />
          Internal systems only. Unauthorized access is prohibited.
        </p>
      </main>

      <div className="relative z-10 w-full max-w-5xl mx-auto [&_footer]:border-white/10 [&_footer]:text-gray-500">
        <AppFooter />
      </div>
    </div>
  );
};
