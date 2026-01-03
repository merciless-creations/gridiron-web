import { Component, type ReactNode } from 'react';
import { AuthError } from '@azure/msal-browser';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth error caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleLogin = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isAuthError = error instanceof AuthError;
      
      let title = 'Something went wrong';
      let message = 'An unexpected error occurred. Please try again.';
      
      if (isAuthError) {
        switch (error.errorCode) {
          case 'user_cancelled':
            title = 'Sign in cancelled';
            message = 'You cancelled the sign in process. Click below to try again.';
            break;
          case 'consent_required':
          case 'interaction_required':
            title = 'Additional verification required';
            message = 'Please sign in again to continue.';
            break;
          case 'token_expired':
            title = 'Session expired';
            message = 'Your session has expired. Please sign in again.';
            break;
          case 'network_error':
            title = 'Connection error';
            message = 'Unable to connect. Please check your internet connection and try again.';
            break;
          default:
            title = 'Authentication error';
            message = error.message || 'An error occurred during authentication.';
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleLogin}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
