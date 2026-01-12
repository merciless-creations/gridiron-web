import { createContext, useContext } from 'react';

/**
 * Auth user representation - minimal info needed by the UI
 * This abstracts away MSAL's AccountInfo vs our mock user
 */
export interface AuthUser {
  name?: string;
  username?: string;
  email?: string;
}

/**
 * Auth context interface - the contract both providers must implement
 */
export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

/**
 * Auth context with undefined default to ensure provider is used
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook to access auth context - throws if used outside provider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
