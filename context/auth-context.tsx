'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthUser,
  loginUser,
  logoutUser,
  refreshSession,
  signUpUser,
  type LoginPayload,
  type SignupPayload,
} from '@/lib/auth-client';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const hasRefreshToken = document.cookie.includes('refreshToken=');

    if (!hasRefreshToken) {
      setStatus('unauthenticated');
      return;
    }

    refreshSession()
      .then((result) => {
        setUser(result.user);
        setToken(result.token);
        setStatus('authenticated');
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        setStatus('unauthenticated');
      });
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await loginUser(payload);
    setUser(result.user);
    setToken(result.token);
    setStatus('authenticated');
    router.push('/dashboard');
  };

  const signup = async (payload: SignupPayload) => {
    const result = await signUpUser(payload);
    setUser(result.user);
    setToken(result.token);
    setStatus('authenticated');
    router.push('/dashboard');
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    setStatus('unauthenticated');
    router.push('/login');
  };

  const value = useMemo(
    () => ({ user, token, status, login, signup, logout }),
    [user, token, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
