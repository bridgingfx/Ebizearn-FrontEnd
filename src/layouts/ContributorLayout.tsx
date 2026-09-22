import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  ClipboardList,
  Wallet,
  Users,
  User as UserIcon,
  LogOut,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EBizLogo } from '../components/common/EBizLogo';
import { UserAvatar } from '../components/common/UserAvatar';
import { ConfirmModal } from '../components/common/ConfirmModal';

/**
 * Contributor app shell — mobile-first.
 * Bottom tab bar on mobile (7 tabs), sidebar on desktop.
 */
const TABS = [
  { name: 'Home', path: '/app', icon: Home, exact: true },
  { name: 'Tasks', path: '/app/tasks', icon: Compass },
  { name: 'My Tasks', path: '/app/my-tasks', icon: ClipboardList },
  { name: 'Wallet', path: '/app/wallet', icon: Wallet },
  { name: 'Referrals', path: '/app/referrals', icon: Users },
  { name: 'Feed', path: '/app/feed', icon: Zap },
  { name: 'Profile', path: '/app/profile', icon: UserIcon },
];

export const ContributorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const handleLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (tab: (typeof TABS)[number]) =>
    tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row text-left font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#07182F] text-white sticky top-0 h-screen p-5 justify-between shadow-xl z-30 shrink-0">
        <div>
          <Link to="/app" className="flex items-center pb-5 border-b border-white/10 mb-5">
            <EBizLogo variant="dark" size="sm" subtitleText="Contributor App" />
          </Link>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 mb-6 flex items-center gap-3">
            <UserAvatar src={user?.profile?.avatar_url} name={user?.name} email={user?.email} className="ring-2 ring-[#168BFF]" />
            <div className="min-w-0">
              <p className="text-xs font-black truncate">{user?.name || 'Contributor'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab);
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.exact}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active ? 'bg-[#168BFF] text-white shadow-md' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </NavLink>
              );
            })}
            <NavLink
              to="/app/support"
              className={({ isActive: active }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active ? 'bg-[#168BFF] text-white shadow-md' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <HelpCircle className="w-4 h-4" />
              Support
            </NavLink>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#07182F] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/app" className="flex items-center">
          <EBizLogo variant="dark" size="sm" subtitleText="Contributor App" />
        </Link>
        <div className="flex items-center gap-2">
          <UserAvatar src={user?.profile?.avatar_url} name={user?.name} email={user?.email} size="sm" />
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            aria-label="Sign out"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content — bottom padding so content clears the mobile tab bar */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-10 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-7 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
                  active ? 'text-[#168BFF]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold leading-none">{tab.name}</span>
                {active && <span className="w-1 h-1 rounded-full bg-[#168BFF] mt-0.5" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <ConfirmModal
        open={logoutOpen}
        title="Sign out?"
        message="You'll need to sign in again to access your tasks and wallet."
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
};
