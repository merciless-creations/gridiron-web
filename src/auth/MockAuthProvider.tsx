import { type ReactNode } from 'react';
import { AuthContext, type AuthContextValue, type AuthUser } from './AuthContext';

/**
 * Mock user data - matches what getCurrentUser returns from mock server
 */
const MOCK_USER: AuthUser = {
  name: 'Test User',
  username: 'testuser@example.com',
  email: 'testuser@example.com',
};

interface MockAuthProviderProps {
  children: ReactNode;
}

/**
 * Mock Auth Provider - provides fake authenticated state for development/testing
 *
 * This provider completely replaces MSAL when VITE_MOCK_AUTH=true.
 * No Azure AD code is loaded or executed.
 */
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const value: AuthContextValue = {
    isAuthenticated: true,
    isLoading: false,
    user: MOCK_USER,
    login: async () => {
      console.log('[MockAuth] Login called - already authenticated in mock mode');
    },
    logout: async () => {
      console.log('[MockAuth] Logout called - redirecting to home');
      window.location.href = '/';
    },
    getAccessToken: async () => {
      // Return a fake token - mock server doesn't validate tokens
      return 'mock-access-token';
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
