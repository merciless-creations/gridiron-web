import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { DepthChartPage } from '../DepthChartPage';
import { Route, Routes } from 'react-router-dom';

const MOCK_SERVER_URL = 'http://localhost:3002';

const setScenario = async (name: string, scope: string) => {
  await fetch(`${MOCK_SERVER_URL}/_scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, scope }),
  });
};

const renderDepthChartPage = (teamId: string = '1') => {
  return renderWithProviders(
    <Routes>
      <Route path="/teams/:teamId/depth-chart" element={<DepthChartPage />} />
    </Routes>,
    { initialEntries: [`/teams/${teamId}/depth-chart`] }
  );
};

describe('DepthChartPage', () => {
  beforeEach(async () => {
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
  });

  describe('Success States', () => {
    it('displays team name and depth chart header', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Depth Chart/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Atlanta/i)).toBeInTheDocument();
      expect(screen.getByText(/Falcons/i)).toBeInTheDocument();
    });

    it('displays all position groups', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByTestId('position-group-offense')).toBeInTheDocument();
      });

      expect(screen.getByTestId('position-group-defense')).toBeInTheDocument();
      expect(screen.getByTestId('position-group-special-teams')).toBeInTheDocument();
    });

    it('displays offense positions', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText('QB')).toBeInTheDocument();
      });

      expect(screen.getByText('RB')).toBeInTheDocument();
      expect(screen.getByText('WR')).toBeInTheDocument();
      expect(screen.getByText('TE')).toBeInTheDocument();
      expect(screen.getByText('OL')).toBeInTheDocument();
    });

    it('displays defense positions', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText('DL')).toBeInTheDocument();
      });

      expect(screen.getByText('LB')).toBeInTheDocument();
      expect(screen.getByText('CB')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('displays special teams positions', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText('K')).toBeInTheDocument();
      });

      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('displays player cards with ratings', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByTestId('player-card-1')).toBeInTheDocument();
      });

      // Check that starter badges are displayed
      const starterBadges = screen.getAllByText('STARTER');
      expect(starterBadges.length).toBeGreaterThan(0);
    });

    it('displays rating legend', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText('Elite')).toBeInTheDocument();
      });

      expect(screen.getByText('Star')).toBeInTheDocument();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Backup')).toBeInTheDocument();
    });

    it('displays drag and drop coming soon message', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Drag & drop coming soon/i)).toBeInTheDocument();
      });
    });

    it('displays back to team management link', async () => {
      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Back to Team Management/i)).toBeInTheDocument();
      });

      const backLink = screen.getByRole('link', { name: /Back to Team Management/i });
      expect(backLink).toHaveAttribute('href', '/teams/1/manage');
    });
  });

  describe('Loading State', () => {
    it('displays loading indicator while fetching', () => {
      renderDepthChartPage('1');

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays not found message for 404 response', async () => {
      await setScenario('getTeam', 'notFound');

      renderDepthChartPage('999');

      await waitFor(() => {
        expect(screen.getByText(/Team Not Found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/doesn't exist or has been removed/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });

    it('displays access denied message for 403 response', async () => {
      await setScenario('getTeam', 'forbidden');

      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });

    it('displays generic error message for 500 response', async () => {
      await setScenario('getTeam', 'error');

      renderDepthChartPage('1');

      await waitFor(() => {
        expect(screen.getByText(/Error Loading Team/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });
  });
});
