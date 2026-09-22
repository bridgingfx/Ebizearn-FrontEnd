import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, BadgeCheck, Camera, Mail, Share2, Star, ThumbsUp } from 'lucide-react';
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

/** Abstract CSS-only phone mockup showing contributor task cards. */
const PhoneMockup: React.FC = () => (
  <div className="relative mx-auto w-[270px] sm:w-[300px]">
    {/* Glow behind the phone */}
    <div className="absolute -inset-8 bg-gradient-to-tr from-cyan-300/50 via-sky-200/40 to-amber-200/50 blur-3xl rounded-full" />
    {/* Phone frame */}
    <div className="relative rounded-[2.4rem] bg-[#0b1526] p-2.5 shadow-2xl shadow-sky-900/30 rotate-[-3deg]">
      <div className="rounded-[1.9rem] bg-white overflow-hidden">
        {/* Notch */}
        <div className="relative bg-[#0b1526] h-7 flex items-center justify-center">
          <div className="w-24 h-5 bg-[#0b1526] absolute -bottom-2 rounded-b-2xl" />
          <div className="w-16 h-3 bg-black/80 rounded-full" />
        </div>
        <div className="px-4 pt-3 pb-5 bg-gradient-to-b from-sky-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-slate-900">Today's Tasks</p>
            <span className="text-[10px] font-bold text-white bg-[#16B364] px-2 py-1 rounded-full">3 available</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              { icon: Camera, title: 'Product unboxing video', pay: '$12.00', tint: 'bg-rose-100 text-rose-600' },
              { icon: Share2, title: 'Share launch post', pay: '$4.50', tint: 'bg-sky-100 text-sky-600' },
              { icon: ThumbsUp, title: 'App store review', pay: '$6.25', tint: 'bg-amber-100 text-amber-600' },
            ].map((t, i) => (
              <div key={t.title} className={`bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 ${i === 0 ? 'ring-2 ring-[#168BFF]/30' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.tint}`}>
                  <t.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{t.title}</p>
                  <p className="text-[10px] text-slate-400">Verified campaign</p>
                </div>
                <span className="text-[11px] font-black text-[#16B364]">{t.pay}</span>
              </div>
            ))}
          </div>
          {/* Payout progress */}
          <div className="mt-3 bg-slate-900 rounded-2xl p-3 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300">Weekly payout</span>
              <span className="text-[10px] font-black text-[#20C4E8]">$38.40</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-[#20C4E8] to-[#168BFF]" />
            </div>
            <p className="mt-1.5 text-[9px] text-slate-400 flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-[#16B364]" /> Proof approved &bull; pays Friday
            </p>
          </div>
        </div>
      </div>
    </div>
    {/* Floating rating chip */}
    <div className="absolute -right-6 top-16 bg-white/80 backdrop-blur rounded-2xl px-3 py-2 shadow-xl border border-white/60 flex items-center gap-1.5 rotate-3">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="text-[11px] font-black text-slate-800">4.9</span>
      <span className="text-[10px] text-slate-500">reputation</span>
    </div>
  </div>
);

export const ContributorLoginPage: React.FC = () => {
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
      const role = await login(email, password, 'contributor');
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
    <div className="min-h-screen relative overflow-hidden flex items-center">
      {/* Bright gradient-mesh background */}
      <div className="absolute inset-0 bg-[#f4f9ff]" />
      <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-sky-300/70 to-cyan-200/40 blur-3xl" />
      <div className="absolute -bottom-48 -right-32 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-amber-200/60 via-orange-100/50 to-transparent blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[#7257FF]/25 to-transparent blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: headline + phone mockup */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-sky-200 text-[#168BFF] text-[11px] font-black uppercase tracking-wider shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            Contributor portal
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Complete tasks. <span className="text-gradient-brand">Build rewards.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Pick up verified campaigns from real brands, submit proof from your phone, and get paid in cash — free to join, always.
          </p>
          <div className="mt-8 hidden lg:block">
            <PhoneMockup />
          </div>
        </div>

        {/* Right: glassmorphism sign-in card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-white/70 backdrop-blur-xl rounded-[1.75rem] p-7 sm:p-8 border border-white/80 shadow-2xl shadow-sky-900/10">
            <div className="text-center mb-6">
              <AuthFavicon />
              <h2 className="text-xl font-black text-slate-900">Welcome back, earner</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to your contributor account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15"
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
                className="w-full py-3 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/70 text-center text-xs text-slate-500">
              New to eBiz Earn?{' '}
              <Link to="/contributor/register" className="text-[#168BFF] font-bold hover:underline">
                Create account
              </Link>
            </div>
          </div>

          {/* Mobile-only mockup teaser */}
          <div className="mt-10 lg:hidden">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </div>
  );
};
