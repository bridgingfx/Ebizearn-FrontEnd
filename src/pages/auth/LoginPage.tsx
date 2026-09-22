import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ArrowLeft, Building2, Mail, ShieldCheck, Users } from 'lucide-react';
import { AuthFavicon } from './AuthFavicon';
import { PasswordInput } from './PasswordInput';
import type { UserRole } from '../../types';

type PortalKey = 'contributor' | 'business' | 'team';

const portalRoutes: Record<PortalKey | 'superadmin', string> = {
  contributor: '/app',
  business: '/business',
  team: '/admin',
  superadmin: '/admin/super',
};

/** Roles accepted at each portal. Registration only ever creates contributor/business. */
const portalAcceptedRoles: Record<PortalKey, UserRole[]> = {
  contributor: ['contributor'],
  business: ['business'],
  team: ['admin'],
};

const portalConfig: Record<PortalKey, { label: string; headline: string; subline: string; icon: typeof Users; accent: string }> = {
  contributor: {
    label: 'Contributor',
    headline: 'Contributor Sign In',
    subline: 'Pick up verified tasks and track your earnings.',
    icon: Users,
    accent: '#168BFF',
  },
  business: {
    label: 'Business',
    headline: 'Business Sign In',
    subline: 'Launch campaigns and review verified proof.',
    icon: Building2,
    accent: '#16B364',
  },
  team: {
    label: 'Team',
    headline: 'Team Sign In',
    subline: 'Internal access for moderators and platform staff.',
    icon: ShieldCheck,
    accent: '#F79009',
  },
};

interface LoginPageProps {
  portal?: PortalKey;
}

export const LoginPage: React.FC<LoginPageProps> = ({ portal }) => {
  const [searchParams] = useSearchParams();
  const paramPortal = (searchParams.get('portal') || '') as PortalKey;
  const requestedPortal: PortalKey | null = portal || (portalConfig[paramPortal] ? paramPortal : null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const selectedPortal = useMemo(
    () => (requestedPortal ? portalConfig[requestedPortal] : null),
    [requestedPortal]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortal || !requestedPortal) return;
    setSubmitting(true);
    setError(null);

    try {
      const role = await login(email, password);
      if (role) {
        if (!portalAcceptedRoles[requestedPortal].includes(role)) {
          logout();
          setError(
            `This is the ${selectedPortal.label} sign-in. This account belongs to a different portal — please use the correct sign-in for your account.`
          );
          return;
        }
        navigate(portalRoutes[role === 'admin' ? 'team' : role] || portalRoutes[requestedPortal], { replace: true });
      } else {
        setError('Invalid email or password. Please check your account details and try again.');
      }
    } catch {
      setError('Connection error. Please make sure the API server is reachable and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Login hub: choose a portal. Super Admin console is intentionally NOT linked.
  // ---------------------------------------------------------------------------
  if (!selectedPortal) {
    const publicPortals: PortalKey[] = ['contributor', 'business'];
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E4EAF2] shadow-floating">
          <div className="text-center mb-8">
            <AuthFavicon />
            <h2 className="text-2xl font-black text-[#101828] mt-3">Sign in to eBiz Earn</h2>
            <p className="text-xs text-[#667085] mt-1">Choose the portal for your account type.</p>
          </div>

          <div className="space-y-3">
            {publicPortals.map((key) => {
              const cfg = portalConfig[key];
              const Icon = cfg.icon;
              return (
                <Link
                  key={key}
                  to={`/login/${key}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-[#168BFF] hover:bg-blue-50/40 transition-all group"
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cfg.accent }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-black text-[#101828]">{cfg.label} Login</p>
                    <p className="text-[11px] text-[#667085]">{cfg.subline}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#168BFF] group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
            <p className="text-xs text-gray-500">
              New to eBiz Earn?{' '}
              <Link to="/signup/contributor" className="text-[#168BFF] font-bold hover:underline">
                Create a free contributor account
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              For businesses:{' '}
              <Link to="/signup/business" className="text-[#16B364] font-bold hover:underline">
                Register your business
              </Link>
            </p>
            <Link to="/login/team" className="inline-block mt-3 text-[11px] text-gray-400 hover:text-gray-600 hover:underline">
              Team sign-in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const SelectedIcon = selectedPortal.icon;

  return (
    <div className="min-h-screen pt-28 pb-16 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E4EAF2] shadow-floating">
        <div className="text-center mb-6">
          <AuthFavicon />
          <div className="mx-auto mb-3 mt-3 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black bg-gray-50 text-gray-700 border-gray-200">
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
                autoComplete="email"
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
            <span>{submitting ? 'Authenticating…' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link to="/login" className="inline-flex items-center gap-1 text-[#168BFF] font-bold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to portal choice
          </Link>
        </div>

        {requestedPortal !== 'team' && (
          <div className="mt-4 text-center text-xs text-gray-500">
            {requestedPortal === 'contributor' ? (
              <span>
                New here?{' '}
                <Link to="/signup/contributor" className="text-[#168BFF] font-bold hover:underline">
                  Create a free account
                </Link>
              </span>
            ) : (
              <span>
                New business?{' '}
                <Link to="/signup/business" className="text-[#16B364] font-bold hover:underline">
                  Register your business
                </Link>
              </span>
            )}
          </div>
        )}

        {requestedPortal !== 'team' && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/login/team" className="text-[11px] text-gray-400 hover:text-gray-600 hover:underline">
              Team sign-in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
