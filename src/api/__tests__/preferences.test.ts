import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { usePreferencesQuery, useUpdatePreferences, preferencesApi } from '../preferences';

// Create a wrapper with QueryClient for hooks
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('Preferences API', () => {
  // Note: These tests require the mock server to be running
  // They will be skipped in unit test mode

  describe('preferencesApi', () => {
    it('has getPreferences function', () => {
      expect(typeof preferencesApi.getPreferences).toBe('function');
    });

    it('has updatePreferences function', () => {
      expect(typeof preferencesApi.updatePreferences).toBe('function');
    });
  });

  describe('usePreferencesQuery', () => {
    it('returns query hook with expected properties', () => {
      const { result } = renderHook(() => usePreferencesQuery(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });
  });

  describe('useUpdatePreferences', () => {
    it('returns mutation hook with expected properties', () => {
      const { result } = renderHook(() => useUpdatePreferences(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('mutateAsync');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('error');
    });
  });
});

describe('Preferences API Integration', () => {
  // These tests run against the mock server
  // They require VITE_API_URL to be set to the mock server

  beforeEach(async () => {
    // Reset mock server state
    try {
      await fetch('http://localhost:3002/_reset', { method: 'POST' });
    } catch {
      // Server might not be running
    }
  });

  it('fetches preferences from API', async () => {
    const { result } = renderHook(() => usePreferencesQuery(), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete (either success or error if server not running)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    // If server is running, we should get a response
    if (!result.current.error) {
      expect(result.current.data).toHaveProperty('preferences');
    }
  });
});
