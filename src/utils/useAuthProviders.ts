import { useEffect, useState } from 'react';
import { authProvidersApi, type AuthProvidersPublic } from '../api/authProviders';

/**
 * Which social sign-in buttons are switched on (Super Admin → Settings).
 * Fetched once per page load and shared by every login / register page.
 * The last answer is remembered in this browser so the buttons don't pop in
 * late on the next visit; the live answer always replaces it.
 */
const STORAGE_KEY = 'ebizearn_auth_providers_v1';

let cached: AuthProvidersPublic | null = null;
let inflight: Promise<AuthProvidersPublic | null> | null = null;
const listeners = new Set<(c: AuthProvidersPublic) => void>();

function readStored(): AuthProvidersPublic | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthProvidersPublic) : null;
  } catch {
    return null;
  }
}

function fetchProviders(): Promise<AuthProvidersPublic | null> {
  inflight ??= authProvidersApi
    .publicConfig()
    .then((res) => {
      cached = res.data;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      } catch {
        /* storage unavailable — fine */
      }
      listeners.forEach((l) => l(res.data));
      return res.data;
    })
    .catch(() => {
      inflight = null; // allow a retry on the next page
      return null;
    });
  return inflight;
}

/** Start loading early (e.g. when an auth page is prefetched). */
export const preloadAuthProviders = () => void fetchProviders();

/**
 * `null` while unknown (first ever visit, still loading) — callers keep the
 * button slot reserved so nothing jumps.
 */
export function useAuthProviders(): AuthProvidersPublic | null {
  const [config, setConfig] = useState<AuthProvidersPublic | null>(() => cached ?? readStored());

  useEffect(() => {
    listeners.add(setConfig);
    void fetchProviders();
    return () => {
      listeners.delete(setConfig);
    };
  }, []);

  return config;
}
