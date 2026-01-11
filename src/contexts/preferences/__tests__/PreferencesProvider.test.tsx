import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { PreferencesProvider } from '../PreferencesProvider';
import { usePreferences } from '../usePreferences';
import type { UserPreferences } from '../../../types/Preferences';

// Mock the API hooks
const mockPreferencesData = {
  preferences: {
    ui: {
      theme: 'dark' as const,
      teamColorSchemes: {
        1: { primary: '#C8102E', secondary: '#FFB612' },
      },
    },
    grids: {
      roster: {
        columns: ['name', 'position', 'overall'],
        sortColumn: 'overall',
        sortDirection: 'desc' as const,
      },
    },
  },
};

const { mockState } = vi.hoisted(() => ({
  mockState: {
    usePreferencesQuery: vi.fn(),
    useUpdatePreferences: vi.fn(),
  },
}));

vi.mock('../../../api/preferences', () => ({
  usePreferencesQuery: () => mockState.usePreferencesQuery(),
  useUpdatePreferences: () => mockState.useUpdatePreferences(),
  PREFERENCES_QUERY_KEY: ['users', 'me', 'preferences'],
}));

// Test wrapper
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
        <PreferencesProvider>{children}</PreferencesProvider>
      </QueryClientProvider>
    );
  };
}

describe('PreferencesProvider', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockState.usePreferencesQuery.mockReturnValue({
      data: mockPreferencesData,
      isLoading: false,
      error: null,
    });

    mockState.useUpdatePreferences.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    });
  });

  describe('Loading State', () => {
    it('returns isLoading true while preferences are loading', () => {
      mockState.usePreferencesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('returns isLoading false when preferences are loaded', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Default Preferences', () => {
    it('merges user preferences with defaults', async () => {
      mockState.usePreferencesQuery.mockReturnValue({
        data: { preferences: { ui: { theme: 'dark' } } },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // User preference is preserved
      expect(result.current.preferences.ui?.theme).toBe('dark');

      // Default grids are merged in
      expect(result.current.preferences.grids?.roster).toBeDefined();
    });

    it('uses defaults when preferences are empty', async () => {
      mockState.usePreferencesQuery.mockReturnValue({
        data: { preferences: {} },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have default theme
      expect(result.current.preferences.ui?.theme).toBe('system');

      // Should have default grid preferences
      expect(result.current.preferences.grids?.roster?.columns).toBeDefined();
    });
  });

  describe('Theme Management', () => {
    it('resolves dark theme correctly', async () => {
      mockState.usePreferencesQuery.mockReturnValue({
        data: { preferences: { ui: { theme: 'dark' } } },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('dark');
      });
    });

    it('resolves light theme correctly', async () => {
      mockState.usePreferencesQuery.mockReturnValue({
        data: { preferences: { ui: { theme: 'light' } } },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('light');
      });
    });

    it('setTheme updates preferences', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setTheme('light');
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            theme: 'light',
          }),
        })
      );
    });
  });

  describe('Grid Preferences', () => {
    it('returns current grid preferences', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.grids?.roster?.columns).toEqual(['name', 'position', 'overall']);
      expect(result.current.preferences.grids?.roster?.sortColumn).toBe('overall');
    });

    it('setGridPreferences updates grid preferences', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setGridPreferences('roster', {
          columns: ['name', 'overall'],
          sortColumn: 'name',
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          grids: expect.objectContaining({
            roster: expect.objectContaining({
              columns: ['name', 'overall'],
              sortColumn: 'name',
            }),
          }),
        })
      );
    });
  });

  describe('Team Color Schemes', () => {
    it('getTeamColorScheme returns color scheme for team', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const colors = result.current.getTeamColorScheme(1);
      expect(colors).toEqual({ primary: '#C8102E', secondary: '#FFB612' });
    });

    it('getTeamColorScheme returns undefined for unknown team', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const colors = result.current.getTeamColorScheme(999);
      expect(colors).toBeUndefined();
    });

    it('setTeamColorScheme adds new color scheme', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setTeamColorScheme(2, {
          primary: '#002244',
          secondary: '#C60C30',
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            teamColorSchemes: expect.objectContaining({
              2: { primary: '#002244', secondary: '#C60C30' },
            }),
          }),
        })
      );
    });

    it('removeTeamColorScheme removes color scheme', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.removeTeamColorScheme(1);
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            teamColorSchemes: {},
          }),
        })
      );
    });
  });

  describe('Reset Preferences', () => {
    it('resetPreferences resets to defaults', async () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetPreferences();
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            theme: 'system',
          }),
        })
      );
    });
  });

  describe('Saving State', () => {
    it('returns isSaving true when mutation is pending', async () => {
      mockState.useUpdatePreferences.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSaving).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePreferences());
      }).toThrow('usePreferences must be used within a PreferencesProvider');

      consoleSpy.mockRestore();
    });

    it('exposes query error', async () => {
      const testError = new Error('Failed to load preferences');
      mockState.usePreferencesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: testError,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe(testError);
      });
    });
  });
});
