import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { RosterPage } from '../RosterPage';
import { Route, Routes } from 'react-router-dom';

const MOCK_SERVER_URL = 'http://localhost:3002';

const setScenario = async (route: string, scope: string) => {
  await fetch(`${MOCK_SERVER_URL}/_scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, scope }),
  });
};

const renderRosterPage = (teamId: string = '1') => {
  return renderWithProviders(
    <Routes>
      <Route path="/teams/:teamId/roster" element={<RosterPage />} />
    </Routes>,
    { initialEntries: [`/teams/${teamId}/roster`] }
  );
};

describe('RosterPage', () => {
  beforeEach(async () => {
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
  });

  describe('Success States', () => {
    it('displays team name and roster header', async () => {
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Roster/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Atlanta/i)).toBeInTheDocument();
      expect(screen.getByText(/Falcons/i)).toBeInTheDocument();
    });

    it('displays player count', async () => {
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Players/i)).toBeInTheDocument();
      });
    });

    it('displays roster table with headers', async () => {
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByTestId('column-header-name')).toBeInTheDocument();
      });

      expect(screen.getByTestId('column-header-position')).toBeInTheDocument();
      expect(screen.getByTestId('column-header-overall')).toBeInTheDocument();
      expect(screen.getByTestId('column-header-age')).toBeInTheDocument();
    });

    it('displays position filter tabs', async () => {
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByTestId('roster-tab-all')).toBeInTheDocument();
      });

      expect(screen.getByTestId('roster-tab-offense')).toBeInTheDocument();
      expect(screen.getByTestId('roster-tab-defense')).toBeInTheDocument();
      expect(screen.getByTestId('roster-tab-specialTeams')).toBeInTheDocument();
    });

    it('displays back to team management link', async () => {
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Back to Team Management/i)).toBeInTheDocument();
      });

      const backLink = screen.getByRole('link', { name: /Back to Team Management/i });
      expect(backLink).toHaveAttribute('href', '/teams/1/manage');
    });

    it('displays search input', async () => {
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('filters players when clicking position tabs', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByTestId('roster-tab-offense')).toBeInTheDocument();
      });

      // Click offense filter
      await user.click(screen.getByTestId('roster-tab-offense'));

      // The offense button should be highlighted (has different styling)
      const offenseButton = screen.getByTestId('roster-tab-offense');
      expect(offenseButton).toHaveClass('bg-team-primary');
    });

    it('filters players by search query', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'QB');

      // Search input should have the value
      expect(searchInput).toHaveValue('QB');
    });
  });

  describe('Sorting', () => {
    it('allows sorting by clicking column headers', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Name/i)).toBeInTheDocument();
      });

      // Find and click the Name header to sort
      const nameHeader = screen.getByText(/Name/i);
      await user.click(nameHeader);

      // Should show sort indicator (the actual sorting is handled in component)
      // This test verifies the click handler works
      await waitFor(() => {
        expect(nameHeader.textContent).toContain('↑');
      });
    });
  });

  describe('Loading State', () => {
    it('displays loading indicator while fetching', () => {
      renderRosterPage('1');

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays not found message for 404 response', async () => {
      await setScenario('getTeam', 'notFound');

      renderRosterPage('999');

      await waitFor(() => {
        expect(screen.getByText(/Team Not Found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/doesn't exist or has been removed/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });
  });
});
