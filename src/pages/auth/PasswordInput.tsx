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
  /** Show an honest password-strength meter under the field (signup pages). */
  showStrength?: boolean;
}

/** Simple honest strength score — length plus character-class variety. */
const scorePassword = (value: string): { level: 0 | 1 | 2 | 3; label: string } => {
  if (value.length < 8) return { level: 0, label: 'Too short' };
  let classes = 0;
  if (/[a-z]/.test(value)) classes += 1;
  if (/[A-Z]/.test(value)) classes += 1;
  if (/[0-9]/.test(value)) classes += 1;
  if (/[^A-Za-z0-9]/.test(value)) classes += 1;
  const score = value.length >= 12 ? classes + 1 : classes;
  if (score <= 1) return { level: 1, label: 'Weak' };
  if (score <= 3) return { level: 2, label: 'Good' };
  return { level: 3, label: 'Strong' };
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Password',
  minLength,
  autoComplete,
  dark = false,
  large = false,
  showStrength = false,
}) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  const sizeClass = large ? 'h-11 px-3.5 text-[15px]' : 'py-2 text-xs sm:text-sm';
  const iconOffset = large ? 'left-3.5 top-1/2 -translate-y-1/2' : 'left-3 top-3';

  const strength = showStrength && !dark && value ? scorePassword(value) : null;
  const strengthMeta = [
    { width: '100%', color: 'bg-red-500', text: 'text-red-600' },
    { width: '38%', color: 'bg-amber-500', text: 'text-amber-600' },
    { width: '68%', color: 'bg-[#168BFF]', text: 'text-[#168BFF]' },
    { width: '100%', color: 'bg-[#16B364]', text: 'text-emerald-600' },
  ];

  return (
    <div>
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
            : `w-full pl-9 pr-12 ${sizeClass} text-slate-900 dark:text-gray-100 bg-slate-50/60 dark:bg-[#0C1322] border border-slate-200 dark:border-white/10 rounded-xl placeholder:text-slate-400 placeholder:text-[14px] dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#0C1322] focus:border-[#168BFF] focus:ring-4 focus:ring-[#168BFF]/12 transition-all`
        }
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#168BFF] transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <Icon className="w-[18px] h-[18px]" />
      </button>
      </div>
      {strength && (
        <div className="mt-1.5" aria-live="polite">
          <div className="h-1 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthMeta[strength.level].color}`}
              style={{ width: strengthMeta[strength.level].width }}
            />
          </div>
          <p className={`mt-1 text-[11px] font-bold ${strengthMeta[strength.level].text}`}>
            Password strength: {strength.label}
            {strength.level < 2 && ' — add upper/lowercase, numbers or symbols.'}
          </p>
        </div>
      )}
    </div>
  );
};
