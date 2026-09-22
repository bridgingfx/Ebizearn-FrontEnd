import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Sliders,
  Users,
  CheckCircle2,
  Receipt,
  Megaphone,
  ShieldAlert,
  HelpCircle,
  BarChart3,
  Activity,
  Settings,
  Bell,
  Search,
  LogOut,
  FileCode,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { EBizLogo } from '../components/common/EBizLogo';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { UserAvatar } from '../components/common/UserAvatar';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/admin', icon: Home, exact: true },
    { name: 'Control Center', path: '/superadmin', icon: Sliders, superOnly: true },
    { name: 'Email', path: '/admin/email', icon: Mail, superOnly: true },
    { name: 'Users & KYC', path: '/admin/users', icon: Users },
    { name: 'Verification', path: '/admin/verification', icon: CheckCircle2 },
    { name: 'Payouts', path: '/admin/payouts', icon: Receipt },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
    { name: 'Fraud & Risk', path: '/admin/fraud', icon: ShieldAlert },
    { name: 'Support', path: '/admin/support', icon: HelpCircle },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'System Health', path: '/admin/health', icon: Activity },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileCode },
  ];

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const isSuperAdmin = user?.role === 'superadmin';
  const headerName = isSuperAdmin ? (user?.name || 'Super Admin') : user?.role === 'admin' ? 'Admin' : (user?.name || 'Admin');
  const headerSubtitle = isSuperAdmin ? 'Platform Control' : user?.role === 'admin' ? 'Admin Console' : 'Admin Console';
  const consoleLabel = isSuperAdmin ? 'Super Admin Console v2.4.1' : 'Admin Console v2.4.1';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row text-left font-sans">
      
      {/* =========================================================================
          DESKTOP SIDEBAR
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-[#07182F] text-white sticky top-0 h-screen p-5 justify-between shadow-xl z-30 shrink-0">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center pb-5 border-b border-white/10 mb-4">
            <EBizLogo variant="dark" size="sm" subtitleText="Admin Command Center" />
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.filter((item) => !item.superOnly || user?.role === 'superadmin').map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
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
        <div className="pt-4 border-t border-white/10 text-[11px] text-gray-400 space-y-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="font-extrabold text-white block">BizNetwork</span>
            <span className="text-[9px] text-gray-300 block">Build. Contribute. Grow.</span>
            <span className="text-[9px] text-[#20C4E8] block mt-1">{consoleLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
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

      {/* =========================================================================
          MAIN APPLICATION WRAPPER & TOP BAR
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8">
        
        {/* Top Header with Search & Admin Profile */}
        <header className="bg-white border-b border-[#E7ECF3] sticky top-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
          
          {/* Search bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users, transactions, campaigns... /"
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#168BFF] focus:bg-white transition-all"
            />
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <UserAvatar
                src={user?.profile?.avatar_url}
                name={headerName}
                email={user?.email}
                size="sm"
                className="ring-2 ring-[#20C4E8] bg-[#07182F]"
              />
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-gray-900 block leading-tight">{headerName}</span>
                <span className="text-[10px] text-gray-400 block leading-none">{headerSubtitle}</span>
              </div>
            </div>
          </div>

        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
