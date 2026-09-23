import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Compact footer for authenticated app shells (contributor / business / admin)
 * and standalone auth pages. Slim single-line bar: copyright + core links.
 * Keeps the full marketing Footer reserved for public pages.
 */
interface AppFooterProps {
  compact?: boolean;
}

export const AppFooter: React.FC<AppFooterProps> = ({ compact = false }) => {
  return (
    <footer className={`border-t border-gray-200 dark:border-white/10 ${compact ? 'py-3 mt-4' : 'py-5 mt-10'}`}>
      <div className={`flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 ${compact ? 'gap-2' : 'gap-3'}`}>
        <p>© 2026 eBiz Network (ebizearn.com). All rights reserved.</p>
        <nav className={`flex flex-wrap items-center justify-center ${compact ? 'gap-x-3 gap-y-1 sm:justify-end' : 'gap-4'}`} aria-label="Footer">
          <Link to="/how-it-works" className="hover:text-[#168BFF] transition-colors">
            How It Works
          </Link>
          <Link to="/faq" className="hover:text-[#168BFF] transition-colors">
            Help Center
          </Link>
          <Link to="/contact" className="hover:text-[#168BFF] transition-colors">
            Contact
          </Link>
          <Link to="/blog" className="hover:text-[#168BFF] transition-colors">
            Blog
          </Link>
          <Link to="/terms" className="hover:text-[#168BFF] transition-colors">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-[#168BFF] transition-colors">
            Privacy
          </Link>
          <Link to="/disclaimer" className="hover:text-[#168BFF] transition-colors">
            Disclaimer
          </Link>
          <Link to="/cookies" className="hover:text-[#168BFF] transition-colors">
            Cookies
          </Link>
        </nav>
      </div>
    </footer>
  );
};
