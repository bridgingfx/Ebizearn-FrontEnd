import axios from 'axios';

/**
 * Single axios instance for the Laravel API.
 * Base URL comes from VITE_API_URL (see .env.example): local -> http://127.0.0.1:8013/api/v1,
 * live -> https://api.ebizearn.com/api/v1 (set in frontend/.env.production).
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || '/api/v1';
const API_BASE_URL = rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`;

export const TOKEN_KEY = 'biznetwork_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Standard Laravel envelope: { success, message, data }. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

type ApiErrorShape = {
  response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
  code?: string;
};

/** Generic API messages that say nothing useful — prefer a field error. */
const GENERIC_MESSAGES = new Set(['validation error', 'the given data was invalid.', 'server error']);

/** Best human-readable message from a failed request. */
export function getApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const err = error as ApiErrorShape;
  const status = err?.response?.status;
  const data = err?.response?.data;

  // No response at all: offline, DNS, CORS or the API is down.
  if (!err?.response && (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED')) {
    return "Can't reach the server. Please check your internet connection and try again.";
  }
  if (status === 429) {
    return 'Too many attempts. Please wait a minute and try again.';
  }

  const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
  const message = data?.message?.trim();
  if (message && !GENERIC_MESSAGES.has(message.toLowerCase())) return message;
  return firstFieldError || message || fallback;
}

/** Per-field messages from a Laravel 422 ({ errors: { field: [msg] } }). */
export function getApiFieldErrors(error: unknown): Record<string, string> {
  const errors = (error as ApiErrorShape)?.response?.data?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
}
