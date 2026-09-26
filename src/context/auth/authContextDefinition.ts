import { createContext } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Creates the account and signs in immediately (email verification is disabled for now). */
  signup: (email: string, password: string, displayName: string) => Promise<AuthUser>;
  verifyEmail: (token: string) => Promise<AuthUser>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
