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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { EBizLogo } from '../components/common/EBizLogo';
import { ConfirmModal } from '../components/common/ConfirmModal';

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
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row text-left font-sans">
      
      {/* =========================================================================
          DESKTOP SIDEBAR
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-[#07182F] text-white sticky top-0 h-screen p-5 justify-between shadow-xl z-30 shrink-0">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center pb-5 border-b border-white/10 mb-6">
            <EBizLogo variant="dark" size="sm" subtitleText="Business Enterprise" />
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5">
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
        <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
          <Link
            to="/business/support"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>Help &amp; Support</span>
          </Link>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-white text-xs block">eBiz Earn</span>
              <span className="text-[9px] text-gray-400">Business workspace</span>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
        <header className="bg-white border-b border-[#E7ECF3] sticky top-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
          <Link
            to="/business/billing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-[#168BFF] transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#168BFF]" />
            <span>Billing &amp; funds</span>
          </Link>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2.5 pl-2">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-gray-900 block leading-tight">{companyName}</span>
                <span className="text-[10px] text-gray-400 block leading-none">Business account</span>
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
        </main>

      </div>

    </div>
  );
};
