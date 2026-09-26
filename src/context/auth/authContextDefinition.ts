import { createContext } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SignupResult {
  email: string;
  /**
   * Present only when the deployment has no email sender configured yet
   * (e.g. RESEND_API_KEY unset) — the API hands back the verification link
   * directly so signup still works end-to-end without it.
   */
  verifyUrl?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Creates the account but does not sign in — the email must be verified first. */
  signup: (email: string, password: string, displayName: string) => Promise<SignupResult>;
  verifyEmail: (token: string) => Promise<AuthUser>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
