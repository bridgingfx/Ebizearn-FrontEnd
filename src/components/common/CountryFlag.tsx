import React, { useState } from 'react';
import { flagForIso } from '../../utils/countryDialCodes';

/**
 * Country flag as a small image, so it shows on every device — Windows
 * browsers don't draw emoji flags (they show "AE" instead). Falls back to the
 * emoji if the image can't load.
 */
export const CountryFlag: React.FC<{ iso: string; className?: string }> = ({ iso, className = 'w-6 h-[18px]' }) => {
  const [failed, setFailed] = useState(false);
  const code = iso.toLowerCase();

  if (failed || !/^[a-z]{2}$/.test(code)) {
    return (
      <span aria-hidden="true" className="text-lg leading-none">
        {flagForIso(iso)}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-[3px] object-cover ring-1 ring-black/10 dark:ring-white/15`}
    />
  );
};
