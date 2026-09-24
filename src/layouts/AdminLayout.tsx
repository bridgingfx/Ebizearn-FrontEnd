import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  Megaphone,
  ClipboardList,
  Wallet,
  ArrowLeftRight,
  Gift,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Headset,
  Activity,
  Settings,
  ScrollText,
  LogOut,
  Mail,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EBizLogo } from '../components/common/EBizLogo';
import { RegionSelector } from '../components/common/RegionSelector';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { AppFooter } from '../components/common/AppFooter';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // `perm`: the API permission the page needs — hidden when the signed-in
  // staff account lacks it (Super Admin sees everything). `superOnly` pages
  // are Super Admin tools.
  type NavItem = { name: string; path: string; icon: React.ElementType; exact?: boolean; perm?: string; superOnly?: boolean };
  const canSee = (item: NavItem) => {
    if (user?.role === 'superadmin') return true;
    if (item.superOnly) return false;
    if (!item.perm || !user?.permissions) return true;
    return user.permissions.includes(item.perm);
  };

  const allNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Users & KYC', path: '/admin/users', icon: Users, perm: 'manage_users' },
    { name: 'KYC Review', path: '/admin/kyc', icon: ShieldCheck, perm: 'review_kyc' },
    { name: 'Businesses', path: '/admin/businesses', icon: Building2, perm: 'manage_users' },
    { name: 'Verification', path: '/admin/verification', icon: FileCheck, perm: 'review_submissions' },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone, perm: 'manage_task_templates' },
    { name: 'Tasks', path: '/admin/tasks', icon: ClipboardList, perm: 'manage_task_templates' },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowLeftRight, perm: 'process_payouts' },
    { name: 'Wallets', path: '/admin/wallets', icon: Wallet },
    { name: 'Referrals', path: '/admin/referrals', icon: Gift, perm: 'view_reports' },
    { name: 'Demo Requests', path: '/admin/demo-requests', icon: Mail, perm: 'view_reports' },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3, perm: 'view_reports' },
    { name: 'Fraud & Risk', path: '/admin/fraud', icon: ShieldAlert, perm: 'review_submissions' },
    { name: 'Support', path: '/admin/support', icon: Headset, perm: 'handle_disputes' },
    { name: 'Analytics', path: '/admin/analytics', icon: Activity, perm: 'view_reports' },
    { name: 'System Health', path: '/admin/health', icon: Activity },
    { name: 'Roles & Permissions', path: '/admin/permissions', icon: KeyRound, superOnly: true },
    { name: 'Settings', path: '/admin/settings', icon: Settings, perm: 'manage_settings' },
    { name: 'Audit Logs', path: '/admin/audit', icon: ScrollText, perm: 'view_reports' },
  ];
  const navItems = allNavItems.filter(canSee);

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  // Mobile bottom tab bar: 5 primary destinations + "More" sheet (the rest
  // of the sidebar). Mirrors BusinessLayout's glass bottom-bar style.
  const mobileTabs: NavItem[] = [
    { name: 'Home', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Users', path: '/admin/users', icon: Users, perm: 'manage_users' },
    { name: 'Businesses', path: '/admin/businesses', icon: Building2, perm: 'manage_users' },
    { name: 'Verify', path: '/admin/verification', icon: FileCheck, perm: 'review_submissions' },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone, perm: 'manage_task_templates' },
  ].filter(canSee);
  const tabPaths = new Set(mobileTabs.map((t) => t.path));
  const moreItems = navItems.filter((item) => !item.exact && !tabPaths.has(item.path));
  const tabActive = (tab: { path: string; exact?: boolean }) =>
    tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
  const moreActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  const handleLogout = () => {
    // Capture the role BEFORE logout clears the session, then return the
    // operator to the correct portal: super admins go back to the hidden
    // console sign-in; moderators/admins return to the moderator login.
    const role = user?.role;
    logout();
    navigate(role === 'superadmin' ? '/secure-control-panel/login' : '/moderator/login', { replace: true });
  };

  const initials = (user?.name || 'Admin')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B0F19] flex flex-col md:flex-row font-sans text-left">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0E1C2F] text-white flex-col sticky top-0 h-screen p-6 shrink-0 z-30">
        <Link to="/" className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
          <EBizLogo variant="dark" size="sm" subtitleText="Command Center" />
        </Link>

        {/* Scrolls naturally (wheel / touch) with no visible scrollbar; the
            soft fade at the edges hints there is more above / below. */}
        <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto overscroll-contain no-scrollbar text-xs -mx-1 px-1 py-2 [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-20px),transparent)]">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#0E1C2F] font-bold'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-white/5 hover:text-white font-medium'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <header className="bg-white dark:bg-[#0C1322] border-b border-gray-200 dark:border-white/10 sticky top-0 z-20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-colors">
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block leading-tight truncate">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 block leading-none capitalize truncate">{user?.role} workspace</span>

          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block">
              <RegionSelector variant="light" />
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0E1C2F] text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
          <AppFooter />
        </main>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM TAB BAR (glass) + "MORE" SHEET
          md:hidden — the desktop sidebar is hidden on mobile, so this gives
          admins on phones full nav access: 5 primary tabs + More sheet.
          Mirrors the proven BusinessLayout pattern.
         ========================================================================= */}
      <nav
        aria-label="Admin navigation"
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
                    ? 'text-[#C9A227]'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold leading-none whitespace-nowrap tracking-tight">{tab.name}</span>
                {active && <span className="w-1 h-1 rounded-full bg-[#C9A227] mt-0.5" />}
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
                ? 'text-[#C9A227]'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={moreActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold leading-none whitespace-nowrap tracking-tight">More</span>
            {moreActive && <span className="w-1 h-1 rounded-full bg-[#C9A227] mt-0.5" />}
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
              <span className="text-xs font-black text-gray-900 dark:text-gray-100">Admin menu</span>
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
                        ? 'bg-[#D4AF37] text-[#0E1C2F] shadow-md'
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
