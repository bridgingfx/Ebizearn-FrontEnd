import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Building2, CheckCircle2, Mail, TrendingUp, Users, Wallet } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';
import type { UserRole } from '../../types';

const roleRoute: Record<UserRole, string> = {
  contributor: '/app',
  business: '/business',
  moderator: '/admin',
  admin: '/admin',
  superadmin: '/admin/super',
};

const bars = [38, 52, 44, 66, 58, 78, 72, 90, 84, 96, 88, 100];

/** Abstract CSS-only enterprise dashboard mockup: KPI cards + chart bars. */
const DashboardMockup: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[520px]">
    <div className="absolute -inset-6 bg-[#168BFF]/20 blur-3xl rounded-full" />
    <div className="relative rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/50">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[10px] text-slate-400 font-semibold tracking-wide">campaign-overview.ebizearn.com</span>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Active contributors', value: '48.2k', tone: 'text-[#20C4E8]' },
          { icon: CheckCircle2, label: 'Proofs approved', value: '96.4%', tone: 'text-[#16B364]' },
          { icon: Wallet, label: 'Escrow protected', value: '$214k', tone: 'text-amber-300' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white/[0.05] border border-white/10 p-3">
            <kpi.icon className={`w-4 h-4 ${kpi.tone}`} />
            <p className="mt-2 text-lg font-black text-white leading-none">{kpi.value}</p>
            <p className="mt-1 text-[9px] text-slate-400 leading-tight">{kpi.label}</p>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="mt-4 rounded-2xl bg-white/[0.05] border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#20C4E8]" /> Campaign reach — last 12 weeks
          </p>
          <span className="text-[10px] font-black text-[#16B364]">+38%</span>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {bars.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-t-md ${i >= 9 ? 'bg-gradient-to-t from-[#7257FF] to-[#20C4E8]' : 'bg-white/15'}`}
            />
          ))}
        </div>
      </div>
      {/* Bottom strip */}
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#16B364]/10 border border-[#16B364]/25 px-4 py-2.5">
        <p className="text-[10px] text-slate-300"><span className="font-bold text-white">2,140</span> proofs verified today</p>
        <p className="text-[10px] font-bold text-[#16B364]">Computer-vision checked</p>
      </div>
    </div>
  </div>
);

export const BusinessLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const role = await login(email, password, 'business');
      if (role) {
        navigate(roleRoute[role], { replace: true });
      }
    } catch (err) {
      // Display the API's own message (covers 403 portal mismatch).
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07182F] flex items-center">
      {/* Subtle grid + glow accents */}
      <div className="absolute inset-0 bg-grid-mesh-dark opacity-60" />
      <div className="absolute -top-32 right-0 w-[34rem] h-[34rem] rounded-full bg-[#168BFF]/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 w-[30rem] h-[30rem] rounded-full bg-[#7257FF]/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: headline + dashboard mockup */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-[#20C4E8] text-[11px] font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            Business portal
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            Launch verified campaigns with real contributors.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Fund campaigns in minutes, watch computer-vision-verified proof roll in, and pay only for authentic results.
          </p>
          <div className="mt-8">
            <DashboardMockup />
          </div>
        </div>

        {/* Right: enterprise sign-in card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end order-1 lg:order-2">
          <div className="bg-white rounded-[1.75rem] p-7 sm:p-8 shadow-2xl shadow-black/40 border border-white/20">
            <div className="text-center mb-6">
              <AuthFavicon />
              <h2 className="text-xl font-black text-slate-900">Business sign in</h2>
              <p className="text-xs text-slate-500 mt-1">Access your campaign command center</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-[#168BFF] font-bold hover:underline">
                    Forgot password
                  </Link>
                </div>
                <PasswordInput value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Signing in…' : 'Business Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/business/register"
                className="w-full py-3 bg-white hover:bg-slate-50 text-[#07182F] font-bold text-sm rounded-xl border-2 border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                Create Business Account
              </Link>
            </form>

            <p className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
              Enterprise-grade security. Campaign funds stay in escrow until proof is verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
