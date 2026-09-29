import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  BookOpen,
  CheckSquare,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { EBizLogo } from '../components/common/EBizLogo';
import { RegionSelector } from '../components/common/RegionSelector';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { AppFooter } from '../components/common/AppFooter';

export const BusinessLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/business', icon: LayoutDashboard, exact: true },
    { name: 'Campaigns', path: '/business/campaigns', icon: Megaphone },
    { name: 'Task Library', path: '/business/tasks', icon: BookOpen },
    { name: 'Proof Gallery', path: '/business/submissions', icon: CheckSquare },
    { name: 'Analytics', path: '/business/reports', icon: BarChart3 },
    { name: 'Billing & Invoices', path: '/business/billing', icon: CreditCard },
    { name: 'Team Access', path: '/business/team', icon: Users },
    { name: 'Settings', path: '/business/settings', icon: Settings },
    { name: 'Support', path: '/business/support', icon: HelpCircle },
  ];

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  // Mobile bottom tab bar: 5 primary destinations + "More" sheet (9 sidebar
  // items don't fit a tab bar). Matches ContributorLayout's bottom-bar style.
  const mobileTabs = [
    { name: 'Home', path: '/business', icon: LayoutDashboard, exact: true },
    { name: 'Campaigns', path: '/business/campaigns', icon: Megaphone },
    { name: 'Tasks', path: '/business/tasks', icon: BookOpen },
    { name: 'Proof', path: '/business/submissions', icon: CheckSquare },
    { name: 'Reports', path: '/business/reports', icon: BarChart3 },
  ];
  const moreItems = [
    { name: 'Billing & Invoices', path: '/business/billing', icon: CreditCard },
    { name: 'Team Access', path: '/business/team', icon: Users },
    { name: 'Settings', path: '/business/settings', icon: Settings },
    { name: 'Support', path: '/business/support', icon: HelpCircle },
  ];
  const tabActive = (tab: { path: string; exact?: boolean }) =>
    tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
  const moreActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  const handleLogout = () => {
    logout();
    navigate('/business/login');
  };

  const companyName = user?.business?.company_name || user?.name || 'Business';
  const initials = companyName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F19] flex flex-col md:flex-row text-left font-sans">
      
      {/* =========================================================================
          DESKTOP SIDEBAR
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-[#07182F] text-white sticky top-0 h-screen p-5 justify-between shadow-xl z-30 shrink-0">
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Logo */}
          <Link to="/" className="flex items-center pb-5 border-b border-white/10 mb-6 shrink-0">
            <EBizLogo variant="dark" size="sm" subtitleText="Business Enterprise" />
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar -mx-1 px-1 py-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#168BFF] text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-white/10 text-xs shrink-0">
          <Link
            to="/business/support"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>Help & Support</span>
          </Link>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-white text-xs block">eBiz Earn</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">Business workspace</span>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          <ConfirmModal
            open={logoutOpen}
            title="Log out?"
            message="Are you sure you want to log out?"
            confirmLabel="Yes, log out"
            cancelLabel="No"
            variant="danger"
            onConfirm={handleLogout}
            onCancel={() => setLogoutOpen(false)}
          />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN WRAPPER & TOP BAR
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8">
        
        {/* Top bar — real business identity only. No decorative balance pills or dead buttons. */}
        <header className="bg-white dark:bg-[#0C1322] border-b border-[#E7ECF3] dark:border-white/10 sticky top-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs transition-colors">
          <Link
            to="/business/billing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 dark:border-blue-500/30 dark:text-blue-300 rounded-xl text-xs font-bold text-[#168BFF] transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing & funds</span>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <div className="hidden md:block">
              <RegionSelector variant="light" />
            </div>
            <div className="flex items-center gap-2.5 pl-2">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block leading-tight">{companyName}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block leading-none">Business account</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#168BFF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
          <AppFooter />
        </main>

      </div>

      {/* =========================================================================
          MOBILE BOTTOM TAB BAR (glass) + "MORE" SHEET
          md:hidden — the desktop sidebar is hidden on mobile, so this gives
          business users on phones full nav access: 5 primary tabs + More.
         ========================================================================= */}
      <nav
        aria-label="Business navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-[#0C1322]/85 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="grid grid-cols-6 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tabActive(tab);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
                  active
                    ? 'text-[#168BFF]'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold leading-none whitespace-nowrap tracking-tight">{tab.name}</span>
                {active && <span className="w-1 h-1 rounded-full bg-[#168BFF] mt-0.5" />}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More options"
            aria-expanded={moreOpen}
            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
              moreActive
                ? 'text-[#168BFF]'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={moreActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold leading-none whitespace-nowrap tracking-tight">More</span>
            {moreActive && <span className="w-1 h-1 rounded-full bg-[#168BFF] mt-0.5" />}
          </button>
        </div>
      </nav>

      {/* Mobile "More" bottom sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="More options">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] cursor-pointer"
          />
          <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#0C1322]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 rounded-t-3xl p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/20 mx-auto mb-3" />
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-black text-gray-900 dark:text-gray-100">Business menu</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-[55vh] overflow-y-auto">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-colors ${
                      active
                        ? 'bg-[#168BFF] text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setLogoutOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
