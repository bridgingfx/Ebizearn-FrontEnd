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
  Headset,
  Activity,
  Settings,
  ScrollText,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EBizLogo } from '../components/common/EBizLogo';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Users & KYC', path: '/admin/users', icon: Users },
    { name: 'Businesses', path: '/admin/businesses', icon: Building2 },
    { name: 'Verification', path: '/admin/verification', icon: FileCheck },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
    { name: 'Tasks', path: '/admin/tasks', icon: ClipboardList },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowLeftRight },
    { name: 'Wallets', path: '/admin/wallets', icon: Wallet },
    { name: 'Referrals', path: '/admin/referrals', icon: Gift },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Fraud & Risk', path: '/admin/fraud', icon: ShieldAlert },
    { name: 'Support', path: '/admin/support', icon: Headset },
    { name: 'Analytics', path: '/admin/analytics', icon: Activity },
    { name: 'System Health', path: '/admin/health', icon: Activity },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit', icon: ScrollText },
  ];

  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login/team');
  };

  const initials = (user?.name || 'Admin')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row font-sans text-left">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0E1C2F] text-white flex-col sticky top-0 h-screen p-6 shrink-0 z-30">
        <Link to="/" className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
          <EBizLogo variant="dark" size="sm" subtitleText="Command Center" />
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs">
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
                    : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-bold"
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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-900 block leading-tight">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-gray-400 block leading-none capitalize">{user?.role} workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0E1C2F] text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
