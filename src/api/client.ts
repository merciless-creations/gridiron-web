import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  type PublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { apiRequest, loginRequest } from '../config/authConfig';

// API base URL - uses Vite proxy in development, can be overridden with env var
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Store MSAL instance for use in response interceptor
let msalInstance: PublicClientApplication | null = null;

// Track requests that are being retried to prevent infinite loops
const RETRY_FLAG = '_retry';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  [RETRY_FLAG]?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for game simulations
});

/**
 * Attempts to refresh the access token silently.
 * If silent refresh fails due to interaction required, redirects to login.
 * Returns the new access token or null if refresh failed.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (!msalInstance) {
    console.error('MSAL instance not initialized');
    return null;
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    console.warn('No accounts found, redirecting to login');
    await msalInstance.loginRedirect(loginRequest);
    return null;
  }

  try {
    // Force refresh by setting forceRefresh: true
    const response = await msalInstance.acquireTokenSilent({
      ...apiRequest,
      account: accounts[0],
      forceRefresh: true,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Token refresh requires user interaction, redirect to login
      console.warn('Token refresh requires interaction, redirecting to login');
      await msalInstance.acquireTokenRedirect({
        ...apiRequest,
        account: accounts[0],
      });
      return null;
    }
    console.error('Failed to refresh token:', error);
    // Redirect to login on any other error
    await msalInstance.loginRedirect(loginRequest);
    return null;
  }
}

/**
 * Sets up authentication interceptor for API client
 * This should be called once after MSAL is initialized
 */
export const setupAuthInterceptor = (instance: PublicClientApplication) => {
  // Store instance for response interceptor
  msalInstance = instance;

  // Request interceptor to add auth token
  apiClient.interceptors.request.use(
    async (config) => {
      // Skip authentication when using mock API server
      const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';
      if (isMockAuth) {
        return config;
      }

      const accounts = instance.getAllAccounts();

      if (accounts.length > 0) {
        try {
          const response = await instance.acquireTokenSilent({
            ...apiRequest,
            account: accounts[0],
          });
          config.headers.Authorization = `Bearer ${response.accessToken}`;
        } catch (error) {
          console.warn('Failed to acquire token silently:', error);
          // Continue without token - response interceptor will handle 401
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for 401 handling and error logging
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      // Handle 401 Unauthorized errors
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest[RETRY_FLAG]
      ) {
        // Skip retry logic when using mock API server
        const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';
        if (isMockAuth) {
          return Promise.reject(error);
        }

        // Mark request as retried to prevent infinite loop
        originalRequest[RETRY_FLAG] = true;

        try {
          const newToken = await refreshAccessToken();

          if (newToken) {
            // Update the authorization header and retry
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Refresh failed, reject with original error
          return Promise.reject(error);
        }

        // If we get here, redirect is happening, reject the original request
        return Promise.reject(error);
      }

      // Log other errors
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request made but no response
        console.error('Network Error: No response from server');
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }

      return Promise.reject(error);
    }
  );
};
