import { InteractionType } from '@azure/msal-browser';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that ensures user is authenticated
 * Uses MSAL's built-in authentication template to handle login flow
 * Authentication is bypassed when using mock API server
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Skip authentication when using mock API server
  // This flag should ONLY be set in test/dev environments, never in production
  const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';

  if (isMockAuth) {
    return <>{children}</>;
  }

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={loginRequest}
      loadingComponent={Loading}
    >
      {children}
    </MsalAuthenticationTemplate>
  );
};
