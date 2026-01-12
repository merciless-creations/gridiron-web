import { useEffect, useState, type ReactNode } from 'react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest, apiRequest } from '../config/authConfig';
import { setupAuthInterceptor } from '../api/client';
import { AuthContext, type AuthContextValue, type AuthUser } from './AuthContext';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Setup auth interceptor for API calls
setupAuthInterceptor(msalInstance);

/**
 * Inner provider that uses MSAL hooks (must be inside MsalProvider)
 */
function MsalAuthContextProvider({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const user: AuthUser | null = accounts[0]
    ? {
        name: accounts[0].name,
        username: accounts[0].username,
        email: accounts[0].username, // MSAL uses username for email
      }
    : null;

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await instance.logoutRedirect({
        account: accounts[0],
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string> => {
    if (!isAuthenticated || accounts.length === 0) {
      throw new Error('User is not authenticated');
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...apiRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      console.warn('Silent token acquisition failed, attempting interactive redirect:', error);
      await instance.acquireTokenRedirect(apiRequest);
      throw new Error('Redirecting for token acquisition');
    }
  };

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading: inProgress === InteractionStatus.Login || inProgress === InteractionStatus.Logout,
    user,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface MsalAuthProviderProps {
  children: ReactNode;
}

/**
 * MSAL Auth Provider - wraps app with real Azure AD authentication
 */
export function MsalAuthProvider({ children }: MsalAuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    msalInstance
      .initialize()
      .then(() => msalInstance.handleRedirectPromise())
      .catch((error) => {
        console.error('Error handling redirect:', error);
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <MsalProvider instance={msalInstance}>
      <MsalAuthContextProvider>{children}</MsalAuthContextProvider>
    </MsalProvider>
  );
}
