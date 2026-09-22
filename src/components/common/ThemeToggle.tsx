import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  /**
   * 'adaptive' — for surfaces that change with the theme (light in light
   * mode, dark in dark mode). 'onDark' — for surfaces that are always dark
   * (e.g. the navy site navbar, dark sidebars, mobile top bar).
   */
  tone?: 'adaptive' | 'onDark';
  className?: string;
}

/** Sun/moon theme switcher. Visible in the site header and app top bars. */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ tone = 'adaptive', className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const toneClass =
    tone === 'onDark'
      ? 'text-gray-300 hover:text-white hover:bg-white/15'
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${toneClass} ${className}`}
    >
      {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
};
