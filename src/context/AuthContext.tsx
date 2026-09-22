import React, { createContext, useContext, useState } from 'react';
import type { User, UserRole } from '../types';
import { authApi, getApiError, TOKEN_KEY, type LoginPortal } from '../api';
import type { RegisterPayload } from '../api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  /** Sign in against a dedicated portal. On failure the API's own error
   *  message is thrown so the login page can display it (e.g. 403 portal
   *  mismatch). */
  login: (email: string, password: string, portal?: LoginPortal) => Promise<UserRole | null>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; message?: string; role?: UserRole }>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshMe: () => Promise<void>;
  updateWalletBalance: (newBalanceCents: number) => void;
  creditWallet: (amountCents: number) => void;
  updateKycStatus: (status: 'unverified' | 'pending' | 'verified' | 'rejected') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_ROLE_KEY = 'ebizearn_active_role';

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

  const register = async (payload: RegisterPayload): Promise<{ ok: boolean; message?: string; role?: UserRole }> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data.user) {
        updateAndPersistUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(ACTIVE_ROLE_KEY, res.data.user.role);
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
        register,
        logout,
        updateUser: updateAndPersistUser,
        refreshMe,
        updateWalletBalance,
        creditWallet,
        updateKycStatus,
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
