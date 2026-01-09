import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ActiveContextProvider } from '../../contexts/ActiveContextProvider';
import { usePermissions } from '../usePermissions';

// Mock data
const mockCommissioner = {
  id: 1,
  email: 'commissioner@example.com',
  displayName: 'Commissioner User',
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
  ],
};

const mockGm = {
  id: 2,
  email: 'gm@example.com',
  displayName: 'GM User',
  isGlobalAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-01T00:00:00Z',
  leagueRoles: [
    {
      id: 2,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'GeneralManager' as const,
      teamId: 1,
      teamName: 'Falcons',
      assignedAt: '2024-01-01T00:00:00Z',
    },
  ],
};

const mockGlobalAdmin = {
  id: 3,
  email: 'admin@example.com',
  displayName: 'Global Admin',
  isGlobalAdmin: true,
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-01T00:00:00Z',
  leagueRoles: [],
};

const mockGmTeams = [
  { teamId: 1, teamName: 'Falcons', leagueId: 1, leagueName: 'Test League', hasViewed: true },
];

const mockCommissionerTeams = [
  { teamId: 1, teamName: 'Falcons', leagueId: 1, leagueName: 'Test League', hasViewed: true },
  { teamId: 2, teamName: 'Eagles', leagueId: 1, leagueName: 'Test League', hasViewed: true },
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

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Store active league in localStorage for tests
    localStorage.setItem(
      'gridiron-active-context',
      JSON.stringify({ leagueId: 1, teamId: null })
    );
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

      const { result } = renderHook(() => usePermissions(1, 1), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canView).toBe(false);
    });
  });

  describe('Commissioner Permissions', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockCommissioner,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockCommissionerTeams,
        isLoading: false,
      });
    });

    it('commissioner can edit any team in their league', async () => {
      const { result } = renderHook(() => usePermissions(1, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
      expect(result.current.isCommissioner).toBe(true);
      expect(result.current.isReadOnly).toBe(false);
      expect(result.current.role).toBe('Commissioner');
    });

    it('commissioner can edit any team even if not their own', async () => {
      const { result } = renderHook(() => usePermissions(2, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
      expect(result.current.isReadOnly).toBe(false);
    });

    it('commissioner can edit league settings', async () => {
      const { result } = renderHook(() => usePermissions(undefined, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
      expect(result.current.isReadOnly).toBe(false);
    });
  });

  describe('GM Permissions', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockGm,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockGmTeams,
        isLoading: false,
      });
    });

    it('GM can edit their own team', async () => {
      const { result } = renderHook(() => usePermissions(1, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
      expect(result.current.isGM).toBe(true);
      expect(result.current.isReadOnly).toBe(false);
      expect(result.current.role).toBe('GM');
    });

    it('GM can only view other teams in read-only mode', async () => {
      const { result } = renderHook(() => usePermissions(2, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canView).toBe(true);
      expect(result.current.isReadOnly).toBe(true);
      expect(result.current.role).toBe('GM');
    });

    it('GM can only view league settings in read-only mode', async () => {
      const { result } = renderHook(() => usePermissions(undefined, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canView).toBe(true);
      expect(result.current.isReadOnly).toBe(true);
    });
  });

  describe('Global Admin Permissions', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockGlobalAdmin,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: [],
        isLoading: false,
      });
    });

    it('global admin has commissioner access everywhere', async () => {
      const { result } = renderHook(() => usePermissions(1, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
      expect(result.current.isCommissioner).toBe(true);
      expect(result.current.isReadOnly).toBe(false);
      expect(result.current.role).toBe('Commissioner');
    });

    it('global admin can edit any team in any league', async () => {
      const { result } = renderHook(() => usePermissions(999, 999), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
      expect(result.current.isCommissioner).toBe(true);
    });
  });

  describe('No Role / No Access', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: {
          ...mockGm,
          leagueRoles: [], // No roles at all
        },
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: [],
        isLoading: false,
      });
    });

    it('user with no role has no access', async () => {
      localStorage.setItem(
        'gridiron-active-context',
        JSON.stringify({ leagueId: null, teamId: null })
      );

      const { result } = renderHook(() => usePermissions(1, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canView).toBe(false);
      expect(result.current.isCommissioner).toBe(false);
      expect(result.current.isGM).toBe(false);
      expect(result.current.role).toBe(null);
    });
  });

  describe('Default Context Fallback', () => {
    beforeEach(() => {
      mockState.useCurrentUser.mockReturnValue({
        data: mockGm,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockGmTeams,
        isLoading: false,
      });
    });

    it('uses active context leagueId when not provided', async () => {
      localStorage.setItem(
        'gridiron-active-context',
        JSON.stringify({ leagueId: 1, teamId: 1 })
      );

      const { result } = renderHook(() => usePermissions(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use leagueId from active context
      expect(result.current.canView).toBe(true);
      expect(result.current.canEdit).toBe(true); // Own team
    });
  });

  describe('Edge Cases', () => {
    it('returns no access when user is null', async () => {
      mockState.useCurrentUser.mockReturnValue({
        data: null,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: [],
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions(1, 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canView).toBe(false);
    });

    it('returns no access when leagueId is not available', async () => {
      localStorage.setItem(
        'gridiron-active-context',
        JSON.stringify({ leagueId: null, teamId: null })
      );

      // Use a user with multiple leagues so auto-selection doesn't happen
      const userWithMultipleLeagues = {
        ...mockGm,
        leagueRoles: [
          {
            id: 2,
            leagueId: 1,
            leagueName: 'Test League',
            role: 'GeneralManager' as const,
            teamId: 1,
            teamName: 'Falcons',
            assignedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 3,
            leagueId: 2,
            leagueName: 'Second League',
            role: 'GeneralManager' as const,
            teamId: 5,
            teamName: 'Eagles',
            assignedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockState.useCurrentUser.mockReturnValue({
        data: userWithMultipleLeagues,
        isLoading: false,
      });
      mockState.useMyTeams.mockReturnValue({
        data: mockGmTeams,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canView).toBe(false);
    });
  });
});
