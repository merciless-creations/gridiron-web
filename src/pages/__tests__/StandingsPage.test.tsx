import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    useSeasonStandings: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

vi.mock('../../api/season', () => ({
  useSeasonStandings: () => mockState.useSeasonStandings(),
}));

import StandingsPage from '../StandingsPage';

const mockStandings = {
  seasonId: 1,
  year: 2024,
  currentWeek: 5,
  conferences: [
    {
      conferenceId: 1,
      conferenceName: 'AFC',
      divisions: [
        {
          divisionId: 1,
          divisionName: 'East',
          conferenceId: 1,
          conferenceName: 'AFC',
          teams: [
            {
              teamId: 1,
              teamName: 'Patriots',
              teamCity: 'New England',
              divisionId: 1,
              divisionName: 'East',
              conferenceId: 1,
              conferenceName: 'AFC',
              wins: 4,
              losses: 1,
              ties: 0,
              winPercentage: 0.8,
              pointsFor: 120,
              pointsAgainst: 80,
              pointDifferential: 40,
              divisionWins: 2,
              divisionLosses: 0,
              conferenceWins: 3,
              conferenceLosses: 1,
              streak: 'W3',
              lastFive: '4-1',
            },
            {
              teamId: 2,
              teamName: 'Bills',
              teamCity: 'Buffalo',
              divisionId: 1,
              divisionName: 'East',
              conferenceId: 1,
              conferenceName: 'AFC',
              wins: 3,
              losses: 2,
              ties: 0,
              winPercentage: 0.6,
              pointsFor: 100,
              pointsAgainst: 90,
              pointDifferential: 10,
              divisionWins: 1,
              divisionLosses: 1,
              conferenceWins: 2,
              conferenceLosses: 1,
              streak: 'L1',
              lastFive: '3-2',
            },
          ],
        },
        {
          divisionId: 2,
          divisionName: 'West',
          conferenceId: 1,
          conferenceName: 'AFC',
          teams: [
            {
              teamId: 3,
              teamName: 'Chiefs',
              teamCity: 'Kansas City',
              divisionId: 2,
              divisionName: 'West',
              conferenceId: 1,
              conferenceName: 'AFC',
              wins: 5,
              losses: 0,
              ties: 0,
              winPercentage: 1.0,
              pointsFor: 150,
              pointsAgainst: 70,
              pointDifferential: 80,
              divisionWins: 2,
              divisionLosses: 0,
              conferenceWins: 4,
              conferenceLosses: 0,
              streak: 'W5',
              lastFive: '5-0',
            },
          ],
        },
      ],
    },
    {
      conferenceId: 2,
      conferenceName: 'NFC',
      divisions: [
        {
          divisionId: 3,
          divisionName: 'East',
          conferenceId: 2,
          conferenceName: 'NFC',
          teams: [
            {
              teamId: 4,
              teamName: 'Eagles',
              teamCity: 'Philadelphia',
              divisionId: 3,
              divisionName: 'East',
              conferenceId: 2,
              conferenceName: 'NFC',
              wins: 2,
              losses: 3,
              ties: 0,
              winPercentage: 0.4,
              pointsFor: 80,
              pointsAgainst: 100,
              pointDifferential: -20,
              divisionWins: 1,
              divisionLosses: 2,
              conferenceWins: 1,
              conferenceLosses: 2,
              streak: 'L2',
              lastFive: '2-3',
            },
          ],
        },
      ],
    },
  ],
};

describe('StandingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.useSeasonStandings = vi.fn().mockReturnValue({
      data: mockStandings,
      isLoading: false,
      error: null,
    });
  });

  function renderPage() {
    return render(
      <BrowserRouter>
        <StandingsPage />
      </BrowserRouter>
    );
  }

  it('should render loading state', () => {
    mockState.useSeasonStandings = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Loading standings...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockState.useSeasonStandings = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    });

    renderPage();
    expect(screen.getByText('Failed to load standings')).toBeInTheDocument();
  });

  it('should render empty state when no standings', () => {
    mockState.useSeasonStandings = vi.fn().mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    renderPage();
    expect(screen.getByText('No standings data available.')).toBeInTheDocument();
  });

  it('should render standings heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Standings & Leaders' })).toBeInTheDocument();
  });

  it('should display season info', () => {
    renderPage();
    expect(screen.getByText(/2024 Season/)).toBeInTheDocument();
    expect(screen.getByText(/Week 5/)).toBeInTheDocument();
  });

  it('should display view mode buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'By Division' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'By Conference' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'League-wide' })).toBeInTheDocument();
  });

  it('should default to division view', () => {
    renderPage();
    const divisionButton = screen.getByRole('button', { name: 'By Division' });
    expect(divisionButton).toHaveClass('bg-emerald-600');
  });

  it('should display conferences in division view', () => {
    renderPage();
    expect(screen.getByText('AFC')).toBeInTheDocument();
    expect(screen.getByText('NFC')).toBeInTheDocument();
  });

  it('should display divisions in division view', () => {
    renderPage();
    expect(screen.getAllByText('East').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('West')).toBeInTheDocument();
  });

  it('should display team names', () => {
    renderPage();
    expect(screen.getByText('New England Patriots')).toBeInTheDocument();
    expect(screen.getByText('Buffalo Bills')).toBeInTheDocument();
    expect(screen.getByText('Kansas City Chiefs')).toBeInTheDocument();
  });

  it('should display win-loss records', () => {
    renderPage();
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('should switch to conference view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'By Conference' }));

    const conferenceButton = screen.getByRole('button', { name: 'By Conference' });
    expect(conferenceButton).toHaveClass('bg-emerald-600');
  });

  it('should switch to league view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'League-wide' }));

    expect(screen.getByText('League Standings')).toBeInTheDocument();
  });

  it('should display win percentage', () => {
    renderPage();
    expect(screen.getByText('.800')).toBeInTheDocument();
  });

  it('should display back to season link', () => {
    renderPage();
    expect(screen.getByText('← Back to Season')).toBeInTheDocument();
  });

  it('should sort teams by win percentage in conference view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'By Conference' }));

    const rows = screen.getAllByRole('row');
    const teamNames = rows.slice(1).map(row => row.textContent);
    expect(teamNames[0]).toContain('Kansas City Chiefs');
  });

  it('should sort teams by win percentage in league view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'League-wide' }));

    const rows = screen.getAllByRole('row');
    const teamNames = rows.slice(1).map(row => row.textContent);
    expect(teamNames[0]).toContain('Kansas City Chiefs');
  });

  it('should display point differential with color in league view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'League-wide' }));

    const positiveDiff = screen.getByText('+80');
    expect(positiveDiff).toHaveClass('text-emerald-400');
  });

  it('should show negative point differential in red in league view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'League-wide' }));

    const negativeDiff = screen.getByText('-20');
    expect(negativeDiff).toHaveClass('text-red-400');
  });

  it('should display column headers', () => {
    renderPage();
    expect(screen.getAllByText('W').length).toBeGreaterThan(0);
    expect(screen.getAllByText('L').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PCT').length).toBeGreaterThan(0);
  });

  // League Leaders tests
  describe('League Leaders', () => {
    it('should display league leaders section', () => {
      renderPage();
      expect(screen.getByText('League Leaders')).toBeInTheDocument();
    });

    it('should display show/hide leaders button', () => {
      renderPage();
      expect(screen.getByRole('button', { name: 'Hide Leaders' })).toBeInTheDocument();
    });

    it('should toggle leaders visibility', async () => {
      const user = userEvent.setup();
      renderPage();

      // Leaders should be visible by default
      expect(screen.getByText('League Leaders')).toBeInTheDocument();

      // Click to hide
      await user.click(screen.getByRole('button', { name: 'Hide Leaders' }));
      expect(screen.queryByText('League Leaders')).not.toBeInTheDocument();

      // Click to show again
      await user.click(screen.getByRole('button', { name: 'Show Leaders' }));
      expect(screen.getByText('League Leaders')).toBeInTheDocument();
    });

    it('should display category tabs for leaders', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /passing/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /rushing/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /receiving/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /defense/i })).toBeInTheDocument();
    });

    it('should display passing leaders by default', () => {
      renderPage();
      expect(screen.getByText('Passing Yards')).toBeInTheDocument();
      expect(screen.getByText('Passing TDs')).toBeInTheDocument();
      expect(screen.getByText('Passer Rating')).toBeInTheDocument();
    });

    it('should switch to rushing leaders', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /rushing/i }));

      expect(screen.getByText('Rushing Yards')).toBeInTheDocument();
      expect(screen.getByText('Rushing TDs')).toBeInTheDocument();
      expect(screen.getByText('Yards Per Carry')).toBeInTheDocument();
    });

    it('should switch to receiving leaders', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /receiving/i }));

      expect(screen.getByText('Receiving Yards')).toBeInTheDocument();
      expect(screen.getByText('Receiving TDs')).toBeInTheDocument();
      expect(screen.getByText('Receptions')).toBeInTheDocument();
    });

    it('should switch to defense leaders', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /defense/i }));

      expect(screen.getByText('Sacks')).toBeInTheDocument();
      expect(screen.getByText('Interceptions')).toBeInTheDocument();
    });

    it('should display placeholder data notice', () => {
      renderPage();
      expect(screen.getByText(/placeholder data/i)).toBeInTheDocument();
    });

    it('should display leader player names', () => {
      renderPage();
      expect(screen.getByText('Patrick Mahomes')).toBeInTheDocument();
    });
  });
});
