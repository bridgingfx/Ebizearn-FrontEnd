import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Building2, Cpu, Mail, ShieldCheck, Users } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';
import type { UserRole } from '../../types';

const portalRoutes: Record<UserRole, string> = {
  contributor: '/app',
  business: '/business',
  admin: '/admin',
  superadmin: '/admin/super',
};

const portalOptions = [
  {
    key: 'contributor',
    label: 'Contributor',
    description: 'Earn tasks',
    icon: Users,
    path: '/login/contributor',
    accent: '#168BFF',
    bg: 'from-blue-50 via-white to-cyan-50',
    panel: 'bg-blue-50 text-blue-700 border-blue-100',
    headline: 'Contributor Portal',
    subline: 'Pick up verified tasks and track payouts.',
  },
  {
    key: 'business',
    label: 'Business CRM',
    description: 'Campaigns',
    icon: Building2,
    path: '/login/business',
    accent: '#16B364',
    bg: 'from-emerald-50 via-white to-blue-50',
    panel: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    headline: 'Business CRM',
    subline: 'Launch campaigns and review verified proof.',
  },
  {
    key: 'admin',
    label: 'Moderator',
    description: 'Reviews',
    icon: ShieldCheck,
    path: '/login/moderator',
    accent: '#F79009',
    bg: 'from-amber-50 via-white to-orange-50',
    panel: 'bg-amber-50 text-amber-700 border-amber-100',
    headline: 'Moderator Desk',
    subline: 'Work verification, payouts, fraud, and support queues.',
  },
  {
    key: 'superadmin',
    label: 'Super Admin',
    description: 'Control',
    icon: Cpu,
    path: '/login/superadmin',
    accent: '#7357FF',
    bg: 'from-violet-50 via-white to-slate-50',
    panel: 'bg-violet-50 text-violet-700 border-violet-100',
    headline: 'Super Admin Console',
    subline: 'Control platform settings, providers, and governance.',
  },
] as const;

interface LoginPageProps {
  portal?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({ portal }) => {
  const [searchParams] = useSearchParams();
  const requestedPortal = (portal || searchParams.get('portal') || 'contributor') as UserRole;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const selectedPortal = useMemo(
    () => portalOptions.find((item) => item.key === requestedPortal) || portalOptions[0],
    [requestedPortal]
  );
  const SelectedIcon = selectedPortal.icon;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const role = await login(email, password);
      if (role) {
        if (role !== selectedPortal.key) {
          logout();
          setError(`This is the ${selectedPortal.label} login. Please use the correct portal for this account.`);
          return;
        }
        navigate(portalRoutes[role], { replace: true });
      } else {
        setError('Invalid email or password. Please check your account details and try again.');
      }
    } catch {
      setError('Connection error. Please make sure the API server is running and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${selectedPortal.bg}`}>
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E4EAF2] shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <div className={`mx-auto mb-3 mt-3 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black ${selectedPortal.panel}`}>
            <SelectedIcon className="w-4 h-4" />
            <span>{selectedPortal.label}</span>
          </div>
          <h2 className="text-2xl font-black text-[#101828]">{selectedPortal.headline}</h2>
          <p className="text-xs text-[#667085] mt-1">{selectedPortal.subline}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#168BFF]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#168BFF] font-semibold hover:underline">
                Forgot?
              </Link>
            </div>
            <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: selectedPortal.accent }}
            className="w-full py-3 hover:brightness-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 text-center mb-3">
            Choose Portal
          </p>
          <div className="grid grid-cols-2 gap-2">
            {portalOptions.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === selectedPortal.key;
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-[#168BFF] bg-blue-50/60'
                      : 'border-gray-200 hover:border-[#168BFF] hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#101828]">
                    <Icon className="w-3.5 h-3.5 text-[#168BFF]" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup/contributor" className="text-[#168BFF] font-bold hover:underline">
            Sign up free
          </Link>
          <span className="mx-1 text-gray-300">|</span>
          <Link to="/signup/business" className="text-[#7257FF] font-bold hover:underline">
            Business signup
          </Link>
        </div>
      </div>
    </div>
  );
};




