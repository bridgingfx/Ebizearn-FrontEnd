/**
 * Country dial-code list for the phone field's country-code picker.
 * Flags are derived from the ISO code via regional-indicator code points
 * (renders natively on Apple platforms; falls back to the ISO pair
 * elsewhere). Kept as a flat list so the picker stays dependency-free.
 */
export interface CountryDial {
  iso: string;
  name: string;
  dial: string;
}

export const COUNTRY_DIALS: CountryDial[] = [
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'AF', name: 'Afghanistan', dial: '+93' },
  { iso: 'AL', name: 'Albania', dial: '+355' },
  { iso: 'DZ', name: 'Algeria', dial: '+213' },
  { iso: 'AR', name: 'Argentina', dial: '+54' },
  { iso: 'AM', name: 'Armenia', dial: '+374' },
  { iso: 'AU', name: 'Australia', dial: '+61' },
  { iso: 'AT', name: 'Austria', dial: '+43' },
  { iso: 'AZ', name: 'Azerbaijan', dial: '+994' },
  { iso: 'BH', name: 'Bahrain', dial: '+973' },
  { iso: 'BD', name: 'Bangladesh', dial: '+880' },
  { iso: 'BY', name: 'Belarus', dial: '+375' },
  { iso: 'BE', name: 'Belgium', dial: '+32' },
  { iso: 'BR', name: 'Brazil', dial: '+55' },
  { iso: 'BG', name: 'Bulgaria', dial: '+359' },
  { iso: 'KH', name: 'Cambodia', dial: '+855' },
  { iso: 'CM', name: 'Cameroon', dial: '+237' },
  { iso: 'CA', name: 'Canada', dial: '+1' },
  { iso: 'CL', name: 'Chile', dial: '+56' },
  { iso: 'CN', name: 'China', dial: '+86' },
  { iso: 'CO', name: 'Colombia', dial: '+57' },
  { iso: 'HR', name: 'Croatia', dial: '+385' },
  { iso: 'CY', name: 'Cyprus', dial: '+357' },
  { iso: 'CZ', name: 'Czechia', dial: '+420' },
  { iso: 'DK', name: 'Denmark', dial: '+45' },
  { iso: 'EG', name: 'Egypt', dial: '+20' },
  { iso: 'ET', name: 'Ethiopia', dial: '+251' },
  { iso: 'FI', name: 'Finland', dial: '+358' },
  { iso: 'FR', name: 'France', dial: '+33' },
  { iso: 'GE', name: 'Georgia', dial: '+995' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'GH', name: 'Ghana', dial: '+233' },
  { iso: 'GR', name: 'Greece', dial: '+30' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852' },
  { iso: 'HU', name: 'Hungary', dial: '+36' },
  { iso: 'IS', name: 'Iceland', dial: '+354' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'ID', name: 'Indonesia', dial: '+62' },
  { iso: 'IR', name: 'Iran', dial: '+98' },
  { iso: 'IQ', name: 'Iraq', dial: '+964' },
  { iso: 'IE', name: 'Ireland', dial: '+353' },
  { iso: 'IT', name: 'Italy', dial: '+39' },
  { iso: 'JP', name: 'Japan', dial: '+81' },
  { iso: 'JO', name: 'Jordan', dial: '+962' },
  { iso: 'KZ', name: 'Kazakhstan', dial: '+7' },
  { iso: 'KE', name: 'Kenya', dial: '+254' },
  { iso: 'KW', name: 'Kuwait', dial: '+965' },
  { iso: 'LV', name: 'Latvia', dial: '+371' },
  { iso: 'LB', name: 'Lebanon', dial: '+961' },
  { iso: 'LT', name: 'Lithuania', dial: '+370' },
  { iso: 'MY', name: 'Malaysia', dial: '+60' },
  { iso: 'MV', name: 'Maldives', dial: '+960' },
  { iso: 'MA', name: 'Morocco', dial: '+212' },
  { iso: 'NP', name: 'Nepal', dial: '+977' },
  { iso: 'NL', name: 'Netherlands', dial: '+31' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64' },
  { iso: 'NG', name: 'Nigeria', dial: '+234' },
  { iso: 'NO', name: 'Norway', dial: '+47' },
  { iso: 'OM', name: 'Oman', dial: '+968' },
  { iso: 'PK', name: 'Pakistan', dial: '+92' },
  { iso: 'PS', name: 'Palestine', dial: '+970' },
  { iso: 'PE', name: 'Peru', dial: '+51' },
  { iso: 'PH', name: 'Philippines', dial: '+63' },
  { iso: 'PL', name: 'Poland', dial: '+48' },
  { iso: 'PT', name: 'Portugal', dial: '+351' },
  { iso: 'QA', name: 'Qatar', dial: '+974' },
  { iso: 'RO', name: 'Romania', dial: '+40' },
  { iso: 'RU', name: 'Russia', dial: '+7' },
  { iso: 'RW', name: 'Rwanda', dial: '+250' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'SN', name: 'Senegal', dial: '+221' },
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'ZA', name: 'South Africa', dial: '+27' },
  { iso: 'KR', name: 'South Korea', dial: '+82' },
  { iso: 'ES', name: 'Spain', dial: '+34' },
  { iso: 'LK', name: 'Sri Lanka', dial: '+94' },
  { iso: 'SD', name: 'Sudan', dial: '+249' },
  { iso: 'SE', name: 'Sweden', dial: '+46' },
  { iso: 'CH', name: 'Switzerland', dial: '+41' },
  { iso: 'SY', name: 'Syria', dial: '+963' },
  { iso: 'TW', name: 'Taiwan', dial: '+886' },
  { iso: 'TZ', name: 'Tanzania', dial: '+255' },
  { iso: 'TH', name: 'Thailand', dial: '+66' },
  { iso: 'TN', name: 'Tunisia', dial: '+216' },
  { iso: 'TR', name: 'Türkiye', dial: '+90' },
  { iso: 'UG', name: 'Uganda', dial: '+256' },
  { iso: 'UA', name: 'Ukraine', dial: '+380' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'UZ', name: 'Uzbekistan', dial: '+998' },
  { iso: 'VN', name: 'Vietnam', dial: '+84' },
  { iso: 'YE', name: 'Yemen', dial: '+967' },
  { iso: 'ZW', name: 'Zimbabwe', dial: '+263' },
];

/** Flag emoji from an ISO-3166 code via regional indicators. */
export const flagForIso = (iso: string): string => {
  const upper = iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return '';
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
};

export const findCountryDialByIso = (iso: string): CountryDial | undefined =>
  COUNTRY_DIALS.find((c) => c.iso === iso.toUpperCase());

export const findCountryDialByDial = (dial: string): CountryDial | undefined =>
  COUNTRY_DIALS.find((c) => c.dial === dial);

/** Default pre-select: +995 (Georgia). */
export const DEFAULT_DIAL = '+995';
