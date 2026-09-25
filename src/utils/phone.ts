import { COUNTRY_DIALS, type CountryDial } from './countryDialCodes';

export interface PhoneValue {
  /** E.g. "+995" */
  dialCode: string;
  /** National number as typed (may contain spaces/dashes). */
  number: string;
}

/** Digits-only national number. */
export const phoneDigits = (number: string): string => number.replace(/\D/g, '');

/** Full international number in E.164-ish form, e.g. "+995501234567". */
export const phoneToE164 = (value: PhoneValue): string =>
  `${value.dialCode}${phoneDigits(value.number)}`;

/** Inline rule: 4–15 digits after stripping formatting characters. */
export const validatePhone = (value: PhoneValue): string | null => {
  const digits = phoneDigits(value.number);
  if (!value.dialCode || !COUNTRY_DIALS.some((c: CountryDial) => c.dial === value.dialCode)) {
    return 'Choose a valid country code.';
  }
  if (digits.length < 4 || digits.length > 15) {
    return 'Enter a valid phone number (4–15 digits).';
  }
  return null;
};
