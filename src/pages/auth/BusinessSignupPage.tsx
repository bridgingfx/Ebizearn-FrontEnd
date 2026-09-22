import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';

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
    <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E4EAF2] shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <h2 className="text-2xl font-black text-[#101828]">Create Business Account</h2>
          <p className="text-xs text-[#667085] mt-1">Connect with 500,000+ real contributors worldwide</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Company / Brand Name</label>
            <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Growth Labs" className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alexandre Dubois" className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]">
                <option value="Tech & SaaS">Tech & SaaS</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Consumer Brands">Consumer Brands</option>
                <option value="Mobile Apps">Mobile Apps</option>
                <option value="Real Estate">Real Estate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Work Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Website URL</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="Min. 8 characters" minLength={8} autoComplete="new-password" />
          </div>

          <button type="submit" disabled={submitting} className="w-full mt-2 py-3.5 bg-[#07182F] hover:bg-[#0D2342] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            <span>{submitting ? 'Setting up Workspace...' : 'Launch First Campaign'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Want to earn as a contributor instead? <Link to="/signup/contributor" className="text-[#168BFF] font-bold hover:underline">Register as Contributor</Link>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Already have a business account? <Link to="/login/business" className="text-[#7257FF] font-bold hover:underline">Business login</Link>
        </div>
      </div>
    </div>
  );
};





