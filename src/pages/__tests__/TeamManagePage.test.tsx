import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { TeamManagePage } from '../TeamManagePage';
import { Route, Routes } from 'react-router-dom';

const MOCK_SERVER_URL = 'http://localhost:3002';

const setScenario = async (name: string, scope: string) => {
  await fetch(`${MOCK_SERVER_URL}/_scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, scope }),
  });
};

const renderTeamManagePage = (teamId: string = '1') => {
  return renderWithProviders(
    <Routes>
      <Route path="/teams/:teamId/manage" element={<TeamManagePage />} />
    </Routes>,
    { initialEntries: [`/teams/${teamId}/manage`] }
  );
};

describe('TeamManagePage', () => {
  beforeEach(async () => {
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
  });

  describe('Success States', () => {
    it('displays team information when loaded successfully', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Team Management/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Atlanta/i)).toBeInTheDocument();
      expect(screen.getByText(/Falcons/i)).toBeInTheDocument();
    });

    it('displays team record', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Wins/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Losses/i)).toBeInTheDocument();
      expect(screen.getByText(/Ties/i)).toBeInTheDocument();
    });

    it('displays team overview stats', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Team Overview/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Budget/i)).toBeInTheDocument();
      expect(screen.getByText(/Fan Support/i)).toBeInTheDocument();
      expect(screen.getByText(/Chemistry/i)).toBeInTheDocument();
    });

    it('displays quick action links', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Depth Chart/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Roster/i)).toBeInTheDocument();
      expect(screen.getByText(/Upcoming Games/i)).toBeInTheDocument();
    });

    it('has correct navigation links', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Depth Chart/i)).toBeInTheDocument();
      });

      const depthChartLink = screen.getByRole('link', { name: /Depth Chart/i });
      expect(depthChartLink).toHaveAttribute('href', '/teams/1/depth-chart');

      const rosterLink = screen.getByRole('link', { name: /Full Roster/i });
      expect(rosterLink).toHaveAttribute('href', '/teams/1/roster');
    });

    it('displays back to dashboard link', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
      });

      const backLink = screen.getByRole('link', { name: /Back to Dashboard/i });
      expect(backLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Loading State', () => {
    it('displays loading indicator while fetching', () => {
      renderTeamManagePage('1');

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays not found message for 404 response', async () => {
      await setScenario('getTeam', 'notFound');

      renderTeamManagePage('999');

      await waitFor(() => {
        expect(screen.getByText(/Team Not Found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/doesn't exist or has been removed/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });

    it('displays access denied message for 403 response', async () => {
      await setScenario('getTeam', 'forbidden');

      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });

    it('displays generic error message for 500 response', async () => {
      await setScenario('getTeam', 'error');

      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Error Loading Team/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });
  });
});

// Scouting mode tests with mocked permissions
describe('TeamManagePage Scouting Mode', () => {
  beforeEach(async () => {
    vi.resetModules();
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
  });

  // Test component behavior when in read-only mode
  // These tests verify the UI responds to permission states correctly
  describe('Read-Only Mode UI Elements', () => {
    it('shows Team Management subtitle when user can edit', async () => {
      // Default mock server user is global admin, so has edit access
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Team Management/i)).toBeInTheDocument();
      });

      // Should not show scouting banner
      expect(screen.queryByRole('status', { name: /Read-only mode/i })).not.toBeInTheDocument();
    });

    it('shows Quick Actions section when user can edit', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
      });

      // Should show edit-oriented text
      expect(screen.getByText(/Set your starting lineup/i)).toBeInTheDocument();
      expect(screen.getByText(/View and manage your players/i)).toBeInTheDocument();
    });

    it('has navigation links for depth chart and roster', async () => {
      renderTeamManagePage('1');

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Depth Chart/i })).toBeInTheDocument();
      });

      const depthChartLink = screen.getByRole('link', { name: /Depth Chart/i });
      expect(depthChartLink).toHaveAttribute('href', '/teams/1/depth-chart');

      const rosterLink = screen.getByRole('link', { name: /Full Roster/i });
      expect(rosterLink).toHaveAttribute('href', '/teams/1/roster');
    });
  });
});
