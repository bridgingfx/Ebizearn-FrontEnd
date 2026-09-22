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

/** Best human-readable message from a failed request. */
export function getApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
  const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
  return data?.message || firstFieldError || fallback;
}
