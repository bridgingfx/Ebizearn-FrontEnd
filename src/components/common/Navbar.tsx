import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EBizLogo } from './EBizLogo';
import { RegionSelector } from './RegionSelector';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Earn', path: '/earn' },
    { name: 'For Businesses', path: '/for-businesses' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07182F]/75 backdrop-blur-xl saturate-150 shadow-lg border-b border-white/10 py-3'
          : 'bg-[#07182F] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: eBiz Network Logo */}
        <Link to="/" className="flex items-center group">
          <EBizLogo variant="dark" size="md" subtitleText="ebizearn.com" />
        </Link>

        {/* Center: Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive ? 'text-white font-semibold' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <ThemeToggle tone="onDark" />
          {/* Region & currency selector */}
          <RegionSelector variant="dark" />

          {user ? (
            <Link
              to={role === 'business' ? '/business' : role === 'admin' || role === 'superadmin' || role === 'moderator' ? '/admin' : '/app'}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-brand px-5 py-2.5 rounded-full shadow-md hover:opacity-95 transition-all"
            >
              <span>Go to {role === 'business' ? 'Business CRM' : role === 'admin' || role === 'moderator' ? 'Admin Panel' : 'Contributor App'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-200 hover:text-white transition-colors px-2 py-1.5"
              >
                Login
              </Link>

              <Link
                to="/contributor/register"
                className="text-sm font-semibold text-white bg-gradient-brand px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>Sign Up Free</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center gap-1">
          <ThemeToggle tone="onDark" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-300 hover:text-white p-2"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07182F] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-200 hover:text-white border-b border-white/5"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <div className="flex justify-center">
              <RegionSelector variant="dark" />
            </div>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-white border border-white/20 rounded-xl"
            >
              Login
            </Link>
            <Link
              to="/contributor/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-gradient-brand rounded-xl shadow-md"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
