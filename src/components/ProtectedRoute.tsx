import { useAuth } from '../hooks/useAuth';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that ensures user is authenticated.
 * Uses the auth context which is provided by either MsalAuthProvider or MockAuthProvider.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Trigger login redirect
    login();
    return <Loading />;
  }

  return <>{children}</>;
};
