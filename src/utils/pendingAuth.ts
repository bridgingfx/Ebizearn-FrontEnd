/**
 * sessionStorage handoff for the signup OTP / phone-setup flows.
 * Kept in a tiny dependency-free module so both lazy pages and the eager
 * SocialLoginButtons can share the keys without pulling page chunks into
 * the main bundle.
 */

const OTP_EMAIL_KEY = 'ebizearn_otp_email';
const OTP_ROLE_KEY = 'ebizearn_otp_role';
const PENDING_PHONE_ROLE_KEY = 'ebizearn_pending_phone_role';

/** Persist the pending email-OTP verification after a successful register. */
export const setPendingOtpEmail = (email: string, role: 'contributor' | 'business'): void => {
  sessionStorage.setItem(OTP_EMAIL_KEY, email);
  sessionStorage.setItem(OTP_ROLE_KEY, role);
};

export const getPendingOtpEmail = (): { email: string | null; role: string | null } => ({
  email: sessionStorage.getItem(OTP_EMAIL_KEY),
  role: sessionStorage.getItem(OTP_ROLE_KEY),
});

export const clearPendingOtp = (): void => {
  sessionStorage.removeItem(OTP_EMAIL_KEY);
  sessionStorage.removeItem(OTP_ROLE_KEY);
};

/** Stash the role before showing the post-Google-signup phone step. */
export const setPendingPhoneRole = (role: string): void => {
  sessionStorage.setItem(PENDING_PHONE_ROLE_KEY, role);
};

export const getPendingPhoneRole = (): string | null =>
  sessionStorage.getItem(PENDING_PHONE_ROLE_KEY);

export const clearPendingPhoneRole = (): void => {
  sessionStorage.removeItem(PENDING_PHONE_ROLE_KEY);
};
