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

/** Sun/moon theme switcher with a jelly pop animation on toggle. */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ tone = 'adaptive', className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [jelly, setJelly] = React.useState(false);

  const toneClass =
    tone === 'onDark'
      ? 'text-gray-300 hover:text-white hover:bg-white/15'
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10';

  const handleClick = () => {
    setJelly(true);
    toggleTheme();
    setTimeout(() => setJelly(false), 500);
  };

  return (
    <>
      <style>{`
        @keyframes jelly-pop {
          0% { transform: scale(1, 1); }
          25% { transform: scale(0.85, 1.15); }
          50% { transform: scale(1.15, 0.85); }
          75% { transform: scale(0.95, 1.05); }
          100% { transform: scale(1, 1); }
        }
        .jelly-animate { animation: jelly-pop 0.5s ease; }
      `}</style>
      <button
        type="button"
        onClick={handleClick}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`p-2 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${toneClass} ${className} ${jelly ? 'jelly-animate' : ''}`}
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </button>
    </>
  );
};
