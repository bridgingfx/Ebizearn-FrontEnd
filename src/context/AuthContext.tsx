import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '../types';
import { authApi, getApiError, TOKEN_KEY, SESSION_EXPIRED_EVENT, type LoginPortal } from '../api';
import { toast } from '../utils/toast';
import type { RegisterPayload, TermsAcceptance } from '../api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  /** Sign in against a dedicated portal. On failure the API's own error
   *  message is thrown so the login page can display it (e.g. 403 portal
   *  mismatch). */
  login: (email: string, password: string, portal?: LoginPortal) => Promise<UserRole | null>;
  /**
   * Social sign-in: POST the provider ID token to /auth/social/{provider}
   * and persist the returned Sanctum token exactly like a password login.
   */
  socialLogin: (provider: 'google' | 'apple', idToken: string, portal?: LoginPortal, extra?: { name?: string; email?: string }, terms?: TermsAcceptance) => Promise<UserRole | null>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; message?: string; role?: UserRole }>;
  /**
   * Persist a { user, token } pair exactly like a login (used by the OTP
   * verification step: otp/verify returns the Sanctum token on success).
   * Returns the user's role for post-auth routing.
   */
  completeSession: (user: User, token: string) => UserRole;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshMe: () => Promise<void>;
  updateWalletBalance: (newBalanceCents: number) => void;
  creditWallet: (amountCents: number) => void;
  updateKycStatus: (status: 'unverified' | 'pending' | 'verified' | 'rejected') => void;
  /** True when the account has no phone — UI must block until provided. */
  phoneRequired: boolean;
  setPhoneRequired: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_ROLE_KEY = 'ebizearn_active_role';
export { ACTIVE_ROLE_KEY };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return null;
    }
    // User object is rehydrated from the API on boot; localStorage is only a
    // cache. refreshMe() in App boot will replace it with live data.
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem(TOKEN_KEY));
  // True when the signed-in account has no phone (social signup) — the UI
  // must block until the user provides one. Dawood: phone is mandatory.
  const [phoneRequired, setPhoneRequired] = useState(false);

  const role: UserRole = user?.role || 'contributor';

  const updateAndPersistUser = (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem(ACTIVE_ROLE_KEY, updatedUser.role);
    }
  };

  const login = async (email: string, password: string, portal?: LoginPortal): Promise<UserRole | null> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password, portal);
      if (res.success && res.data.user) {
        updateAndPersistUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(ACTIVE_ROLE_KEY, res.data.user.role);
        setIsLoading(false);
        return res.data.user.role;
      }
    } catch (error) {
      // No demo fallback: login only succeeds against the real API.
      // Re-throw with the API's own message so the portal page can show it.
      setIsLoading(false);
      throw new Error(
        getApiError(error, 'Invalid email or password. Please check your account details and try again.')
      );
    }
    setIsLoading(false);
    return null;
  };

  const socialLogin = async (
    provider: 'google' | 'apple',
    idToken: string,
    portal?: LoginPortal,
    extra?: { name?: string; email?: string },
    terms?: TermsAcceptance
  ): Promise<UserRole | null> => {
    setIsLoading(true);
    try {
      const res = await authApi.socialLogin(provider, idToken, portal, extra, terms);
      if (res.success && res.data.user) {
        updateAndPersistUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(ACTIVE_ROLE_KEY, res.data.user.role);
        // Social signup skips phone collection — block the UI until provided.
        setPhoneRequired(res.data.phone_required === true || !res.data.user.phone);
        setIsLoading(false);
        return res.data.user.role;
      }
    } catch (error) {
      setIsLoading(false);
      throw new Error(
        getApiError(
          error,
          'Social sign-in failed. Please try again or use your email and password instead.'
        )
      );
    }
    setIsLoading(false);
    return null;
  };

  const register = async (payload: RegisterPayload): Promise<{ ok: boolean; message?: string; role?: UserRole; requiresOtp?: boolean }> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data.user) {
        if (res.data.requires_otp) {
          // Pending email-OTP verification — no session token is issued yet.
          // The caller must route to /verify-otp; the token arrives from otp/verify.
          setIsLoading(false);
          return { ok: true, role: res.data.user.role, requiresOtp: true };
        }
        updateAndPersistUser(res.data.user);
        setIsLoading(false);
        return { ok: true, role: res.data.user.role };
      }
    } catch (error) {
      setIsLoading(false);
      return { ok: false, message: getApiError(error, 'Registration failed. Please check the form and try again.') };
    }
    setIsLoading(false);
    return { ok: false, message: 'Registration failed. Please try again.' };
  };

  const completeSession = (user: User, token: string): UserRole => {
    updateAndPersistUser(user);
    setToken(token);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACTIVE_ROLE_KEY, user.role);
    setIsLoading(false);
    return user.role;
  };

  const logout = () => {
    try {
      authApi.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
  };

  // The API client reports a revoked/expired token: drop the session locally
  // (no logout call — the token is already dead). Route guards then send the
  // user to their own role's sign-in page (ACTIVE_ROLE_KEY is kept so the
  // guard knows which one — a superadmin must land back on the superadmin
  // login, not the moderator one).
  useEffect(() => {
    const onExpired = () => {
      if (!localStorage.getItem(TOKEN_KEY)) return;
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      toast.error('Your session has expired — please sign in again.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // Live permissions: when Super Admin / an admin / a business owner changes
  // a role or this account's access, the sidebar follows without a new
  // sign-in — re-read on tab focus and every minute. Only the permission
  // list is replaced; a failed check changes nothing (expiry is handled by
  // SESSION_EXPIRED_EVENT).
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let busy = false;
    const sync = async () => {
      if (busy || document.visibilityState !== 'visible' || !localStorage.getItem(TOKEN_KEY)) return;
      busy = true;
      try {
        const res = await authApi.me();
        const fresh = res.success ? res.data.user : null;
        if (fresh) {
          setUser((prev) => {
            if (!prev || prev.id !== fresh.id) return prev;
            const a = [...(prev.permissions ?? [])].sort().join(',');
            const b = [...(fresh.permissions ?? [])].sort().join(',');
            return a === b ? prev : { ...prev, permissions: fresh.permissions };
          });
        }
      } catch {
        // Network hiccup — keep the current permissions.
      } finally {
        busy = false;
      }
    };
    const timer = window.setInterval(() => void sync(), 60_000);
    const onVisible = () => void sync();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId]);

  const refreshMe = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      if (res.success && res.data.user) {
        updateAndPersistUser(res.data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const updateWalletBalance = (newBalanceCents: number) => {
    if (user && user.wallet) {
      updateAndPersistUser({
        ...user,
        wallet: { ...user.wallet, available_balance_cents: newBalanceCents },
      });
    }
  };

  const creditWallet = (amountCents: number) => {
    if (user && user.wallet) {
      updateAndPersistUser({
        ...user,
        profile: user.profile
          ? { ...user.profile, completed_tasks_count: (user.profile.completed_tasks_count || 0) + 1 }
          : undefined,
        wallet: {
          ...user.wallet,
          available_balance_cents: (user.wallet.available_balance_cents || 0) + amountCents,
          lifetime_earnings_cents: (user.wallet.lifetime_earnings_cents || 0) + amountCents,
        },
      });
    }
  };

  const updateKycStatus = (status: 'unverified' | 'pending' | 'verified' | 'rejected') => {
    if (user) {
      updateAndPersistUser({
        ...user,
        profile: user.profile
          ? {
              ...user.profile,
              kyc_status: status,
              kyc_verified_at: status === 'verified' ? new Date().toISOString() : undefined,
            }
          : undefined,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        login,
        socialLogin,
        register,
        completeSession,
        logout,
        // Profile/KYC responses don't carry `permissions`; keep the current set.
        updateUser: (next: User) =>
          updateAndPersistUser(next.permissions ? next : { ...next, permissions: user?.permissions }),
        refreshMe,
        updateWalletBalance,
        creditWallet,
        updateKycStatus,
        phoneRequired,
        setPhoneRequired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
