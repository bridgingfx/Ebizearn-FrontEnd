import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Building2, CalendarClock, ShieldCheck, Target } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';

/** Abstract CSS-only campaign-launch mockup: campaign builder preview. */
const CampaignMockup: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[460px]">
    <div className="absolute -inset-6 bg-[#16B364]/15 blur-3xl rounded-full" />
    <div className="relative rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-300">New campaign</p>
        <span className="text-[10px] font-bold text-[#16B364] bg-[#16B364]/10 border border-[#16B364]/30 px-2.5 py-1 rounded-full">
          Step 2 of 4
        </span>
      </div>
      {/* Campaign title skeleton */}
      <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
        <p className="text-[10px] text-slate-400 font-semibold">Campaign name</p>
        <p className="mt-1 text-sm font-bold text-white">Q4 Product Launch Push</p>
      </div>
      {/* Task rows */}
      <div className="mt-3 space-y-2.5">
        {[
          { icon: Target, label: 'Share launch post', quota: '5,000 spots', escrow: '$22.5k' },
          { icon: CalendarClock, label: 'Unboxing video', quota: '800 spots', escrow: '$9.6k' },
        ].map((row) => (
          <div key={row.label} className="rounded-2xl bg-white/[0.05] border border-white/10 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#20C4E8]/10 text-[#20C4E8] flex items-center justify-center shrink-0">
              <row.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{row.label}</p>
              <p className="text-[10px] text-slate-400">{row.quota}</p>
            </div>
            <span className="text-[11px] font-black text-amber-300 shrink-0">{row.escrow}</span>
          </div>
        ))}
      </div>
      {/* Progress steps */}
      <div className="mt-5 flex items-center gap-2">
        {['Details', 'Tasks', 'Funding', 'Review'].map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${i < 2 ? 'bg-[#16B364] text-white' : 'bg-white/10 text-slate-400'}`}>
                {i + 1}
              </span>
              <span className={`text-[10px] font-bold ${i < 2 ? 'text-white' : 'text-slate-500'}`}>{step}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-px ${i < 1 ? 'bg-[#16B364]/60' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16B364] shrink-0" />
        <span>Escrow locks funds — released only on verified proof.</span>
      </div>
    </div>
  </div>
);

export const BusinessSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Tech & SaaS');
  const [password, setPassword] = useState('');
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
      role: 'business',
      company_name: companyName,
    });

    setSubmitting(false);
    if (result.ok) {
      navigate('/business/campaigns/create', { replace: true });
      return;
    }
    setError(result.message || 'Could not create business account.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07182F] flex items-center">
      {/* Dark navy theme (matches business login) */}
      <div className="absolute inset-0 bg-grid-mesh-dark opacity-60" />
      <div className="absolute -top-32 right-0 w-[34rem] h-[34rem] rounded-full bg-[#168BFF]/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 w-[30rem] h-[30rem] rounded-full bg-[#7257FF]/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: headline + campaign mockup */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-[#20C4E8] text-[11px] font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            Business registration
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            Reach thousands of verified humans <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C4E8] to-[#16B364]">this week.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Create your corporate account in 2 minutes, fund your campaign, and mobilize real contributors — pay only for verified proof.
          </p>
          <div className="mt-8 hidden lg:block">
            <CampaignMockup />
          </div>
        </div>

        {/* Right: enterprise registration card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-white rounded-[1.75rem] p-7 sm:p-8 shadow-2xl shadow-black/40 border border-white/20">
            <div className="text-center mb-6">
              <AuthFavicon />
              <h2 className="text-xl font-black text-slate-900">Create Business Account</h2>
              <p className="text-xs text-slate-500 mt-1">Set up your campaign workspace</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSignup} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / brand name</label>
                <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Growth Labs" autoComplete="organization" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alexandre Dubois" autoComplete="name" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]">
                    <option value="Tech & SaaS">Tech &amp; SaaS</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Consumer Brands">Consumer Brands</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" autoComplete="email" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/15" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL <span className="font-normal text-slate-400">(optional)</span></label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" autoComplete="url" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <PasswordInput value={password} onChange={setPassword} placeholder="Min. 8 characters" minLength={8} autoComplete="new-password" />
              </div>

              <button type="submit" disabled={submitting} className="w-full mt-1 py-3.5 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                <span>{submitting ? 'Setting up workspace…' : 'Launch First Campaign'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
              <p>
                Already have a business account? <Link to="/business/login" className="text-[#168BFF] font-bold hover:underline">Business Login</Link>
              </p>
              <p>
                Want to earn as a contributor? <Link to="/contributor/register" className="text-slate-600 font-semibold hover:underline">Register as contributor</Link>
              </p>
            </div>
          </div>

          {/* Mobile-only mockup teaser */}
          <div className="mt-10 lg:hidden">
            <CampaignMockup />
          </div>
        </div>
      </div>
    </div>
  );
};
