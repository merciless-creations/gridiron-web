import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ActiveContextProvider } from '../ActiveContextProvider';
import { useActiveContext } from '../useActiveContext';

const STORAGE_KEY = 'gridiron-active-context';

// Mock data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  displayName: 'Test User',
  isGlobalAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-01T00:00:00Z',
  leagueRoles: [
    {
      id: 1,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Commissioner' as const,
      teamId: null,
      teamName: null,
      assignedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      leagueId: 2,
      leagueName: 'Another League',
      role: 'GeneralManager' as const,
      teamId: 5,
      teamName: 'Falcons',
      assignedAt: '2024-01-01T00:00:00Z',
    },
  ],
};

const mockTeams = [
  { teamId: 1, teamName: 'Eagles', leagueId: 1, leagueName: 'Test League', hasViewed: true },
  { teamId: 5, teamName: 'Falcons', leagueId: 2, leagueName: 'Another League', hasViewed: false },
];

// Mock state for hooks
const { mockState } = vi.hoisted(() => ({
  mockState: {
    useCurrentUser: vi.fn(),
    useMyTeams: vi.fn(),
  },
}));

vi.mock('../../api/users', () => ({
  useCurrentUser: () => mockState.useCurrentUser(),
}));

vi.mock('../../api/teamAssignments', () => ({
  useMyTeams: () => mockState.useMyTeams(),
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
        <ActiveContextProvider>{children}</ActiveContextProvider>
      </QueryClientProvider>
    );
  };
}

describe('ActiveContextProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Loading State', () => {
    it('returns isLoading true while data is loading', () => {
      mockState.useCurrentUser.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Auto-Selection', () => {
    it('does not auto-select when user has multiple leagues', async () => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockUser, // Has 2 leagues
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
      });

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should NOT auto-select - user must choose
      expect(result.current.leagueId).toBe(null);
      expect(result.current.teamId).toBe(null);
      expect(result.current.role).toBe(null);
    });

    it('auto-selects when user has exactly one league', async () => {
      const singleLeagueUser = {
        ...mockUser,
        leagueRoles: [mockUser.leagueRoles[0]], // Only one league (Commissioner)
      };
      const singleLeagueTeams = [mockTeams[0]]; // Only team in that league

      mockState.useCurrentUser.mockReturnValue({
        data: singleLeagueUser,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: singleLeagueTeams,
        isLoading: false,
      });

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.leagueId).toBe(1);
      expect(result.current.leagueName).toBe('Test League');
      expect(result.current.role).toBe('Commissioner');
    });

    it('auto-selects GM league with team when user has exactly one league', async () => {
      const gmOnlyUser = {
        ...mockUser,
        leagueRoles: [mockUser.leagueRoles[1]], // Only GM role in one league
      };
      const gmTeams = [mockTeams[1]]; // Only the team in league 2

      mockState.useCurrentUser.mockReturnValue({
        data: gmOnlyUser,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: gmTeams,
        isLoading: false,
      });

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.leagueId).toBe(2);
      expect(result.current.teamId).toBe(5);
      expect(result.current.role).toBe('GeneralManager');
    });
  });

  describe('localStorage Persistence', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockUser,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
      });
    });

    it('restores context from localStorage', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ leagueId: 2, teamId: 5 })
      );

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.leagueId).toBe(2);
      expect(result.current.teamId).toBe(5);
    });

    it('saves context to localStorage when changed', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setActiveLeague(2);
      });

      await waitFor(() => {
        expect(result.current.leagueId).toBe(2);
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.leagueId).toBe(2);
    });

    it('ignores invalid stored league', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ leagueId: 999, teamId: null }) // Invalid league
      );

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fall back to null (user has multiple leagues, no auto-select)
      expect(result.current.leagueId).toBe(null);
    });
  });

  describe('Context Actions', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockUser,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
      });
    });

    it('setActiveLeague changes league and clears team if not in league', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setActiveLeague(2);
      });

      await waitFor(() => {
        expect(result.current.leagueId).toBe(2);
        expect(result.current.leagueName).toBe('Another League');
        expect(result.current.teamId).toBe(5); // Auto-selects team in new league
      });
    });

    it('setActiveTeam changes team and league', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setActiveTeam(5);
      });

      await waitFor(() => {
        expect(result.current.teamId).toBe(5);
        expect(result.current.teamName).toBe('Falcons');
        expect(result.current.leagueId).toBe(2);
      });
    });

    it('clearContext resets all context', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.clearContext();
      });

      await waitFor(() => {
        expect(result.current.leagueId).toBe(null);
        expect(result.current.teamId).toBe(null);
        expect(result.current.role).toBe(null);
      });
    });
  });

  describe('Permission Helpers', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockUser,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
      });
    });

    it('isCommissionerOf returns true for commissioner leagues', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCommissionerOf(1)).toBe(true);
      expect(result.current.isCommissionerOf(2)).toBe(false);
    });

    it('isGmOf returns true for managed teams', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGmOf(1)).toBe(true);
      expect(result.current.isGmOf(5)).toBe(true);
      expect(result.current.isGmOf(999)).toBe(false);
    });

    it('getRoleForLeague returns correct role', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getRoleForLeague(1)).toBe('Commissioner');
      expect(result.current.getRoleForLeague(2)).toBe('GeneralManager');
      expect(result.current.getRoleForLeague(999)).toBe(null);
    });

    it('isCommissionerOf returns true for global admin', async () => {
      const adminUser = { ...mockUser, isGlobalAdmin: true };
      mockState.useCurrentUser.mockReturnValue({
        data: adminUser,
        isLoading: false,
      });

      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCommissionerOf(999)).toBe(true); // Any league
    });
  });

  describe('Available Leagues and Teams', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockUser,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
      });
    });

    it('provides list of available leagues', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.availableLeagues).toHaveLength(2);
      expect(result.current.availableLeagues[0]).toEqual({
        id: 1,
        name: 'Test League',
        role: 'Commissioner',
      });
    });

    it('provides list of available teams', async () => {
      const { result } = renderHook(() => useActiveContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.availableTeams).toHaveLength(2);
      expect(result.current.availableTeams[0].teamName).toBe('Eagles');
    });
  });

  describe('Error Handling', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useActiveContext());
      }).toThrow('useActiveContext must be used within an ActiveContextProvider');

      consoleSpy.mockRestore();
    });
  });
});
