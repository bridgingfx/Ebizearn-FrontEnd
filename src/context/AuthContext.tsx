import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { authApi, getApiError, TOKEN_KEY } from '../api';
import type { RegisterPayload } from '../api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserRole | null>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; message?: string; role?: UserRole }>;
  logout: () => void;
  updateUser: (user: User) => void;
  switchRole: (newRole: UserRole) => void;
  updateWalletBalance: (newBalanceCents: number) => void;
  creditWallet: (amountCents: number) => void;
  updateKycStatus: (status: 'unverified' | 'pending' | 'verified' | 'rejected') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// Default realistic demo accounts matching the database seeders
const DEMO_USERS: Record<UserRole, User> = {
  contributor: {
    id: 1,
    uuid: 'c0000000-0000-0000-0000-000000000001',
    name: 'Sarah Jenkins',
    email: 'sarah@ebizearn.com',
    role: 'contributor',
    status: 'active',
    referral_code: 'SARAH26',
    profile: {
      id: 1,
      user_id: 1,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      country_code: 'AE',
      city: 'Dubai',
      language: 'en',
      bio: 'Verified digital task contributor & creator.',
      contributor_level: 'trusted',
      fraud_score: 2,
      completed_tasks_count: 12,
      approval_rate: 98.5,
      interests_json: ['social', 'app-testing', 'survey', 'reviews'],
      kyc_status: 'pending',
      kyc_document_type: 'emirates_id',
      kyc_submitted_at: '2026-09-17T12:00:00Z',
    },
    wallet: {
      id: 1,
      user_id: 1,
      currency: 'AED',
      available_balance_cents: 10450, // AED 104.50
      pending_balance_cents: 1650,    // AED 16.50
      lifetime_earnings_cents: 44000, // AED 440.00
      total_withdrawn_cents: 33550,   // AED 335.50
      is_locked: false,
    },
  },
  business: {
    id: 2,
    uuid: 'b0000000-0000-0000-0000-000000000002',
    name: 'Alexandre Dubois',
    email: 'brand@acme.com',
    role: 'business',
    status: 'active',
    business: {
      id: 1,
      uuid: 'biz-acme-001',
      owner_id: 2,
      company_name: 'Acme Growth Labs',
      website: 'https://acme.example.com',
      industry: 'Consumer Tech & SaaS',
      billing_email: 'billing@acme.example.com',
      status: 'active',
    },
  },
  admin: {
    id: 3,
    uuid: 'a0000000-0000-0000-0000-000000000003',
    name: 'Platform Moderator',
    email: 'admin@ebizearn.com',
    role: 'admin',
    status: 'active',
  },
  superadmin: {
    id: 4,
    uuid: 's0000000-0000-0000-0000-000000000004',
    name: 'Chief Technology Officer',
    email: 'superadmin@ebizearn.com',
    role: 'superadmin',
    status: 'active',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken && !DEMO_MODE) {
      return null;
    }
    const savedRole = (localStorage.getItem('biznetwork_active_role') as UserRole) || 'contributor';
    const savedUser = localStorage.getItem(`biznetwork_user_${savedRole}`);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // fallback
      }
    }
    return DEMO_MODE ? (DEMO_USERS[savedRole] || DEMO_USERS.contributor) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY) || (DEMO_MODE ? 'demo_token' : null));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const role: UserRole = user?.role || 'contributor';

  // Persist updated user state per role
  const updateAndPersistUser = (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem(`biznetwork_user_${updatedUser.role}`, JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string): Promise<UserRole | null> => {
    setIsLoading(true);
    try {
      // Attempt real Laravel API login
      const res = await authApi.login(email, password);
      if (res.success && res.data.user) {
        updateAndPersistUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem('biznetwork_active_role', res.data.user.role);
        setIsLoading(false);
        return res.data.user.role;
      }
    } catch {
      // Fallback to demo accounts for testing matching email
      const matched = DEMO_MODE && password === 'password123'
        ? Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase())
        : undefined;
      if (matched) {
        updateAndPersistUser(matched);
        setToken('demo_token');
        localStorage.setItem('biznetwork_active_role', matched.role);
        setIsLoading(false);
        return matched.role;
      }
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
        localStorage.setItem('biznetwork_active_role', res.data.user.role);
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
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!DEMO_MODE) {
      return;
    }
    const savedUser = localStorage.getItem(`biznetwork_user_${newRole}`);
    let selected = DEMO_USERS[newRole];
    if (savedUser) {
      try {
        selected = JSON.parse(savedUser);
      } catch {
        // fallback
      }
    }
    updateAndPersistUser(selected);
    localStorage.setItem('biznetwork_active_role', newRole);
  };

  const updateWalletBalance = (newBalanceCents: number) => {
    if (user && user.wallet) {
      const updated: User = {
        ...user,
        wallet: {
          ...user.wallet,
          available_balance_cents: newBalanceCents,
        },
      };
      updateAndPersistUser(updated);
    }
  };

  const creditWallet = (amountCents: number) => {
    if (user && user.wallet) {
      const updated: User = {
        ...user,
        profile: user.profile
          ? {
              ...user.profile,
              completed_tasks_count: (user.profile.completed_tasks_count || 0) + 1,
            }
          : undefined,
        wallet: {
          ...user.wallet,
          available_balance_cents: (user.wallet.available_balance_cents || 0) + amountCents,
          lifetime_earnings_cents: (user.wallet.lifetime_earnings_cents || 0) + amountCents,
        },
      };
      updateAndPersistUser(updated);
    }
  };

  const updateKycStatus = (status: 'unverified' | 'pending' | 'verified' | 'rejected') => {
    if (user) {
      const updated: User = {
        ...user,
        profile: user.profile
          ? {
              ...user.profile,
              kyc_status: status,
              kyc_verified_at: status === 'verified' ? new Date().toISOString() : undefined,
            }
          : undefined,
      };
      updateAndPersistUser(updated);
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
        switchRole,
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




