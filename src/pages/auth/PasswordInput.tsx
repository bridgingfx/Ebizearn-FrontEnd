import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
  /** Dark variant for the hidden ops console. */
  dark?: boolean;
  /** Roomy 52px variant for the redesigned auth pages (all-ages readability). */
  large?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Password',
  minLength,
  autoComplete,
  dark = false,
  large = false,
}) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  const sizeClass = large ? 'min-h-[52px] px-4 text-base' : 'py-2 text-xs sm:text-sm';
  const iconOffset = large ? 'left-4 top-[18px]' : 'left-3 top-3';

  return (
    <div className="relative">
      <Lock className={`w-4 h-4 text-gray-400 dark:text-gray-500 absolute ${iconOffset}`} />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={
          dark
            ? `w-full pl-9 pr-10 ${sizeClass} bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#7357FF]`
            : `w-full pl-9 pr-12 ${sizeClass} bg-white dark:bg-[#0C1322] border-2 border-slate-200 dark:border-white/10 rounded-2xl placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/15 transition-all`
        }
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#168BFF] transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <Icon className="w-5 h-5" />
      </button>
    </div>
  );
};
