import React, { useState } from 'react';

const SIZES = {
  xs: 'w-4 h-4 text-[8px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
} as const;

const COLORS = ['bg-[#168BFF]', 'bg-[#7357FF]', 'bg-[#16B364]', 'bg-[#F79009]', 'bg-[#E5484D]', 'bg-[#0E9384]'];

interface UserAvatarProps {
  /** Image URL; when missing (or it fails to load) the first letter is shown. */
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Avatar image, falling back to the first letter of the user's name (or email). */
export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, email, size = 'md', className = '' }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const label = (name?.trim() || email?.trim() || '?');
  const initial = label.charAt(0).toUpperCase();
  const color = COLORS[label.charCodeAt(0) % COLORS.length];
  const base = `${SIZES[size]} rounded-full shrink-0 ${className}`;

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={name || email || 'User avatar'}
        onError={() => setFailedSrc(src)}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name || email || 'User avatar'}
      className={`${base} ${color} text-white font-bold inline-flex items-center justify-center select-none`}
    >
      {initial}
    </span>
  );
};
