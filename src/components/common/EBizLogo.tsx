import React from 'react';

interface EBizLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  iconOnly?: boolean;
}

const logoHeights = {
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20',
};

const iconHeights = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-16 w-16',
};

export const EBizLogo: React.FC<EBizLogoProps> = ({
  size = 'md',
  className = '',
  iconOnly = false,
}) => {
  if (iconOnly) {
    return (
      <span className={`inline-flex items-center overflow-hidden select-none ${iconHeights[size]} ${className}`}>
        <img
          src="/assets/ebiz-logo.png"
          alt="eBizEarn"
          className="h-full max-w-none object-contain object-left"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/assets/ebiz-logo.png"
        alt="eBizEarn"
        className={`${logoHeights[size]} w-auto object-contain`}
        draggable={false}
      />
    </span>
  );
};
