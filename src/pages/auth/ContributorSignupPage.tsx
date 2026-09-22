import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, BadgeCheck, CheckCircle2, Gift, TrendingUp } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';

/** Abstract CSS-only earnings mockup: weekly payout summary card. */
const EarningsMockup: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[340px]">
    <div className="absolute -inset-6 bg-gradient-to-tr from-amber-200/50 to-emerald-200/40 blur-3xl rounded-full" />
    <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl shadow-sky-900/15 p-5 rotate-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-slate-800">Lifetime earnings</p>
        <span className="text-[10px] font-bold text-[#16B364] bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">Verified</span>
      </div>
      <p className="mt-1 text-4xl font-black text-slate-900 tracking-tight">$1,284<span className="text-lg text-slate-400">.50</span></p>
      <div className="mt-3 flex items-end gap-1.5 h-20">
        {[30, 44, 36, 58, 52, 70, 64, 82, 76, 92].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-md ${i === 9 ? 'bg-gradient-to-t from-[#16B364] to-[#20C4E8]' : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {['Unboxing video approved — $12.00', 'Storefront review approved — $6.25'].map((row) => (
          <div key={row} className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16B364] shrink-0" />
            <span className="truncate">{row}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#20C4E8]" /> Payout Friday
        </span>
        <span className="text-xs font-black text-[#20C4E8]">PayPal • Wise</span>
      </div>
    </div>
  </div>
);

export const ContributorSignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refCodeFromUrl = searchParams.get('ref') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('AE');
  const [referralCode, setReferralCode] = useState(refCodeFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await register({
      name,
      email,
      password,
      role: 'contributor',
      country_code: country,
      referral_code: referralCode || undefined,
    });

    setSubmitting(false);
    if (result.ok) {
      navigate('/onboarding', { replace: true });
      return;
    }
    setError(result.message || 'Could not create contributor account.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center">
      {/* Bright gradient-mesh background (matches contributor login) */}
      <div className="absolute inset-0 bg-[#f4f9ff]" />
      <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-sky-300/70 to-cyan-200/40 blur-3xl" />
      <div className="absolute -bottom-48 -right-32 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-amber-200/60 via-orange-100/50 to-transparent blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[#7257FF]/25 to-transparent blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: headline + earnings mockup */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-sky-200 text-[#168BFF] text-[11px] font-black uppercase tracking-wider shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            Contributor registration
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Start earning in <span className="text-gradient-brand">under 60 seconds.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Free forever — no fees, no deposits. Complete verified tasks and withdraw real cash from $50.
          </p>
          <div className="mt-8 hidden lg:block">
            <EarningsMockup />
          </div>
        </div>

        {/* Right: glassmorphism registration card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-white/70 backdrop-blur-xl rounded-[1.75rem] p-7 sm:p-8 border border-white/80 shadow-2xl shadow-sky-900/10">
            <div className="mb-5 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16B364] shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-900">100% Free to Join &amp; Earn</p>
                <p className="text-[11px] text-emerald-700 leading-snug">No registration fees, no upgrade plans, and no deposit required. Ever.</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <AuthFavicon />
              <h2 className="text-xl font-black text-slate-900">Create your free account</h2>
              <p className="text-xs text-slate-500 mt-1">Start earning from verified digital tasks today</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSignup} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" autoComplete="name" className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@example.com" autoComplete="email" className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <PasswordInput value={password} onChange={setPassword} placeholder="Min. 8 characters" minLength={8} autoComplete="new-password" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]">
                    <option value="AE">United Arab Emirates</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="IN">India</option>
                    <option value="PK">Pakistan</option>
                    <option value="BD">Bangladesh</option>
                    <option value="LK">Sri Lanka</option>
                    <option value="PH">Philippines</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Referral code</label>
                  <div className="relative">
                    <Gift className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Optional" className="w-full pl-8 pr-2 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] uppercase" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full mt-1 py-3.5 bg-gradient-brand text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl hover:brightness-105 flex items-center justify-center gap-2 disabled:opacity-60">
                <span>{submitting ? 'Creating profile…' : 'Continue to onboarding'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/70 text-center text-xs text-slate-500">
              Already have an account? <Link to="/login" className="text-[#168BFF] font-bold hover:underline">Log in</Link>
            </div>
          </div>

          {/* Mobile-only mockup teaser */}
          <div className="mt-10 lg:hidden">
            <EarningsMockup />
          </div>
        </div>
      </div>
    </div>
  );
};
