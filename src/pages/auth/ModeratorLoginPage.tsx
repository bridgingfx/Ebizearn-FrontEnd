import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Camera, Check, ShieldCheck, Star, X, Video } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import type { UserRole } from '../../types';

const roleRoute: Record<UserRole, string> = {
  contributor: '/app',
  business: '/business',
  moderator: '/admin',
  admin: '/admin',
  superadmin: '/admin/super',
};

/** Abstract CSS-only verification-queue mockup: submission cards awaiting review. */
const QueueMockup: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[520px]">
    <div className="absolute -inset-6 bg-amber-500/10 blur-3xl rounded-full" />
    <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300">Verification queue</p>
        <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-full">
          128 pending
        </span>
      </div>
      <div className="space-y-3">
        {[
          { icon: Camera, title: 'Unboxing video proof', brand: 'Acme Growth Labs', status: 'ai-ok', ai: 'AI score 98%' },
          { icon: Video, title: 'App walkthrough clip', brand: 'FinXCART', status: 'ai-flag', ai: 'AI score 61% — review' },
          { icon: Star, title: 'Storefront review', brand: 'ProFX Expo', status: 'ai-ok', ai: 'AI score 94%' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-white/[0.05] border border-white/10 p-3.5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'ai-ok' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
              <item.icon className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{item.title}</p>
              <p className="text-[10px] text-slate-400">{item.brand} &bull; {item.ai}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="w-7 h-7 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center text-red-300">
                <X className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>Every approval or rejection is logged with reviewer identity and reason.</span>
      </div>
    </div>
  </div>
);

export const ModeratorLoginPage: React.FC = () => {
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
      const role = await login(email, password, 'moderator');
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
    <div className="min-h-screen relative overflow-hidden bg-[#10141c] flex items-center">
      {/* Dark slate texture + shield glow */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[42rem] h-[22rem] bg-amber-500/10 blur-3xl rounded-b-full" />
      <div className="absolute -bottom-40 right-0 w-[30rem] h-[30rem] bg-slate-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: shield motif + headline + queue mockup */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Moderator access
          </div>
          {/* Shield emblem */}
          <div className="mt-6 mb-2 flex lg:justify-start justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-600 rounded-[1.4rem] rotate-6 opacity-90" />
              <div className="absolute inset-0 bg-[#1a2233] rounded-[1.4rem] flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-9 h-9 text-amber-300" />
              </div>
            </div>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            Review campaigns. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Verify submissions.</span> Protect marketplace quality.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
            You keep the marketplace honest: audit campaigns, verify contributor proof, and act on fraud signals.
          </p>
          <div className="mt-8 hidden lg:block">
            <QueueMockup />
          </div>
        </div>

        {/* Right: ops sign-in card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-[#1a2233]/90 backdrop-blur rounded-[1.75rem] p-7 sm:p-8 border border-white/10 shadow-2xl shadow-black/60">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-xl font-black text-white">Moderator sign in</h2>
              <p className="text-[11px] text-slate-400 mt-1">Internal operations access — all attempts are logged</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-900 text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Work email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="moderator@ebizearn.com"
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-amber-300 font-bold hover:underline">
                    Forgot password
                  </Link>
                </div>
                <PasswordInput value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" dark />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:brightness-110 text-[#10141c] font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Verifying…' : 'Moderator Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile-only queue mockup */}
          <div className="mt-10 lg:hidden">
            <QueueMockup />
          </div>
        </div>
      </div>
    </div>
  );
};
