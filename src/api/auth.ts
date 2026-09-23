import { api, type ApiResponse } from './client';
import type { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'business';
  country_code?: string;
  referral_code?: string;
  company_name?: string;
  /** Full international number, E.164-ish (e.g. "+971501234567"). Required at signup. */
  phone?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

/** Dedicated portal a login page signs into. Sent to /auth/login so the API
 *  can reject cross-portal attempts (403) with its own message. */
export type LoginPortal = 'contributor' | 'business' | 'moderator' | 'superadmin';

export const authApi = {
  login: (email: string, password: string, portal?: LoginPortal) =>
    api.post<ApiResponse<AuthSession>>('/auth/login', { email, password, ...(portal ? { portal } : {}) }).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthSession>>('/auth/register', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<ApiResponse<{ user: User }>>('/auth/me').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ reset_url?: string }>>('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (payload: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post<ApiResponse<null>>('/auth/reset-password', payload).then((r) => r.data),

  /**
   * Social sign-in: exchange a provider ID token for a Sanctum session.
   * The frontend obtains the ID token via the provider's JS SDK / OAuth
   * redirect; the backend verifies it and returns { user, token } exactly
   * like a password login. `provider` is `google` or `apple`.
   */
  socialLogin: (provider: 'google' | 'apple', idToken: string, portal?: LoginPortal) =>
    api
      .post<ApiResponse<AuthSession>>(`/auth/social/${provider}`, {
        id_token: idToken,
        ...(portal ? { portal } : {}),
      })
      .then((r) => r.data),

  /** Re-send the email-verification message (60s cooldown enforced client-side). */
  resendVerificationEmail: () =>
    api.post<ApiResponse<null>>('/auth/email/resend').then((r) => r.data),

  /**
   * Verify an email address with the token from the verification email link.
   * The email points at {FRONTEND_URL}/verify-email?token=… — the page reads
   * the token and POSTs it here. Not authenticated; the token itself is the
   * credential (hashed + TTL-checked server-side).
   */
  verifyEmail: (token: string) =>
    api.post<ApiResponse<{ user: User }>>('/auth/email/verify', { token }).then((r) => r.data),

  /* ------------------------------------------------------------------ */
  /* Email OTP verification (signup flow)                                */
  /* ------------------------------------------------------------------ */

  /**
   * Send a 6-digit email OTP. Called right after a successful register —
   * the account exists but is unverified and no session token was issued.
   * 60s resend cooldown enforced server-side (`cooldown` error code).
   */
  otpSend: (email: string) =>
    api.post<ApiResponse<{ expires_in?: number }>>('/auth/otp/send', { email }).then((r) => r.data),

  /**
   * Verify the 6-digit OTP. On success returns the user + Sanctum token —
   * the frontend persists them exactly like a login (auto-logged-in).
   */
  otpVerify: (email: string, code: string) =>
    api
      .post<ApiResponse<AuthSession>>('/auth/otp/verify', { email, code })
      .then((r) => r.data),

  /**
   * Attach a phone number to the signed-in user's profile (used by the
   * post-Google-signup phone step). Body: E.164 phone + dial code.
   *
   * BACKEND-CONTRACT ASSUMPTION: endpoint is PUT /api/v1/profile accepting
   * { phone, phone_country_code }. Gracefully handled if 404 (backend not
   * deployed yet) — the UI shows a "being set up" message + retry + skip.
   */
  updatePhone: (payload: { phone: string; phone_country_code: string }) =>
    api.put<ApiResponse<{ user: User }>>('/profile', payload).then((r) => r.data),
};

/* ---------------------------------------------------------------------- */
/* OTP error mapping                                                       */
/* ---------------------------------------------------------------------- */

/**
 * Error codes returned by the OTP endpoints (from the backend brief).
 * `service_unavailable` = endpoint 404'd (backend not deployed yet) —
 * the UI shows a friendly "being set up" message instead of raw errors.
 */
export type OtpErrorCode =
  | 'expired'
  | 'invalid'
  | 'too_many_attempts'
  | 'cooldown'
  | 'rate_limited'
  | 'not_found'
  | 'service_unavailable'
  | 'network'
  | 'unknown';

export interface OtpFailure {
  code: OtpErrorCode;
  status?: number;
  /** Backend's own message when present, else empty. */
  message: string;
  /** Remaining attempts for `invalid`, when the backend reports it. */
  attemptsRemaining?: number;
  /** Seconds until resend is allowed for `cooldown`, when reported. */
  retryAfter?: number;
}

const KNOWN_OTP_CODES: OtpErrorCode[] = [
  'expired',
  'invalid',
  'too_many_attempts',
  'cooldown',
  'rate_limited',
  'not_found',
];

interface OtpErrorShape {
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
      attempts_remaining?: number;
      retry_after?: number;
      data?: {
        code?: string;
        message?: string;
        attempts_remaining?: number;
        retry_after?: number;
      };
    };
  };
}

/** Normalize any OTP request failure into a typed code the UI can map. */
export function getOtpError(error: unknown): OtpFailure {
  const resp = (error as OtpErrorShape)?.response;
  if (!resp) {
    return {
      code: 'network',
      message: 'Could not reach the server. Check your connection and try again.',
    };
  }
  const status = resp.status;
  // The backend worker deploys the OTP endpoints separately — a 404 means
  // the verification service simply isn't live yet. Never surface this as a
  // technical error to the user.
  if (status === 404) {
    return {
      code: 'service_unavailable',
      status,
      message: 'Verification service is being set up — please try again shortly.',
    };
  }
  const body = resp.data ?? {};
  const nested = body.data ?? {};
  const rawCode = (body.code || nested.code || '') as string;
  const code: OtpErrorCode = (KNOWN_OTP_CODES as string[]).includes(rawCode)
    ? (rawCode as OtpErrorCode)
    : 'unknown';
  const attemptsRemaining =
    typeof body.attempts_remaining === 'number'
      ? body.attempts_remaining
      : typeof nested.attempts_remaining === 'number'
        ? nested.attempts_remaining
        : undefined;
  const retryAfter =
    typeof body.retry_after === 'number'
      ? body.retry_after
      : typeof nested.retry_after === 'number'
        ? nested.retry_after
        : undefined;
  return {
    code,
    status,
    message: body.message || nested.message || '',
    attemptsRemaining,
    retryAfter,
  };
}
