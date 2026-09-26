// Separate from AppDataContext on purpose: this loads once at app boot and
// survives independently of any engagement-scoped data, so folding it into
// AppDataContext would force every page to deal with auth-loading states
// it doesn't care about.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../../services/apiClient';
import { AuthContext, type AuthStatus, type AuthUser } from './authContextDefinition';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: AuthUser }>('/api/auth/session')
      .then(({ user: sessionUser }) => {
        if (cancelled) return;
        setUser(sessionUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus('unauthenticated');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await apiFetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(loggedInUser);
    setStatus('authenticated');
    return loggedInUser;
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    // Email verification is disabled for now: signup signs the user in
    // immediately, same as login.
    const { user: signedUpUser } = await apiFetch<{ user: AuthUser }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setUser(signedUpUser);
    setStatus('authenticated');
    return signedUpUser;
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const { user: verifiedUser } = await apiFetch<{ user: AuthUser }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    setUser(verifiedUser);
    setStatus('authenticated');
    return verifiedUser;
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, signup, verifyEmail, resendVerification, logout }),
    [user, status, login, signup, verifyEmail, resendVerification, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
