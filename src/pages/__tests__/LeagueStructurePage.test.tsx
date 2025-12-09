import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LeagueStructurePage from '../LeagueStructurePage';
import * as leaguesApi from '../../api/leagues';
import * as constraintsApi from '../../api/leagueConstraints';
import * as structureApi from '../../api/leagueStructure';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

const mockConstraints = {
  minConferences: 1,
  maxConferences: 4,
  minDivisionsPerConference: 1,
  maxDivisionsPerConference: 8,
  minTeamsPerDivision: 1,
  maxTeamsPerDivision: 8,
};

const mockLeague = {
  id: 1,
  name: 'Test League',
  season: 2024,
  isActive: true,
  totalConferences: 2,
  totalTeams: 8,
  conferences: [
    {
      id: 100,
      name: 'AFC',
      divisions: [
        {
          id: 200,
          name: 'North',
          teams: [
            { id: 1, name: 'Ravens', city: 'Baltimore', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
            { id: 2, name: 'Steelers', city: 'Pittsburgh', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
          ],
        },
        {
          id: 201,
          name: 'South',
          teams: [
            { id: 3, name: 'Titans', city: 'Tennessee', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
            { id: 4, name: 'Colts', city: 'Indianapolis', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
          ],
        },
      ],
    },
    {
      id: 101,
      name: 'NFC',
      divisions: [
        {
          id: 202,
          name: 'East',
          teams: [
            { id: 5, name: 'Cowboys', city: 'Dallas', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 95, chemistry: 90 },
            { id: 6, name: 'Eagles', city: 'Philadelphia', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
          ],
        },
        {
          id: 203,
          name: 'West',
          teams: [
            { id: 7, name: '49ers', city: 'San Francisco', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 90, chemistry: 85 },
            { id: 8, name: 'Seahawks', city: 'Seattle', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
          ],
        },
      ],
    },
  ],
};

describe('LeagueStructurePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(leaguesApi, 'getLeague').mockResolvedValue(mockLeague);
    vi.spyOn(constraintsApi, 'getLeagueConstraints').mockResolvedValue(mockConstraints);
  });

  function renderPage() {
    return render(
      <BrowserRouter>
        <LeagueStructurePage />
      </BrowserRouter>
    );
  }

  it('should render loading state initially', () => {
    renderPage();
    expect(screen.getByText('Loading league...')).toBeInTheDocument();
  });

  it('should fetch and display league structure', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test League')).toBeInTheDocument();
    });

    expect(leaguesApi.getLeague).toHaveBeenCalledWith(1);
    expect(constraintsApi.getLeagueConstraints).toHaveBeenCalled();

    // Check conferences are displayed
    expect(screen.getByText('AFC')).toBeInTheDocument();
    expect(screen.getByText('NFC')).toBeInTheDocument();
  });

  it('should display league stats in header', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Season 2024/)).toBeInTheDocument();
    });

    expect(screen.getByText(/8 Teams/)).toBeInTheDocument();
    expect(screen.getByText(/2 Conferences/)).toBeInTheDocument();
  });

  it('should expand and collapse conferences', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('AFC')).toBeInTheDocument();
    });

    // Find divisions (should be visible by default)
    expect(screen.getByText('North')).toBeInTheDocument();
    expect(screen.getByText('South')).toBeInTheDocument();

    // Find collapse button for AFC
    const afcSection = screen.getByText('AFC').closest('div');
    const collapseButton = afcSection?.querySelector('button');
    
    if (collapseButton) {
      await user.click(collapseButton);

      // Divisions should be hidden
      await waitFor(() => {
        expect(screen.queryByText('North')).not.toBeInTheDocument();
      });
    }
  });

  it('should display teams when division is expanded', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ravens')).toBeInTheDocument();
    });

    expect(screen.getByText('(Baltimore)')).toBeInTheDocument();
    expect(screen.getByText('Steelers')).toBeInTheDocument();
    expect(screen.getByText('(Pittsburgh)')).toBeInTheDocument();
  });

  it('should handle add conference', async () => {
    const user = userEvent.setup();
    const newConference = {
      id: 102,
      name: 'Conference 3',
      divisions: [],
    };

    vi.spyOn(structureApi, 'addConference').mockResolvedValue(newConference);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('+ Add Conference')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Conference');
    await user.click(addButton);

    await waitFor(() => {
      expect(structureApi.addConference).toHaveBeenCalledWith(1, {
        name: 'Conference 3',
        numberOfDivisions: 4,
        teamsPerDivision: 4,
      });
    });
  });

  it('should disable add conference when max reached', async () => {
    const fullLeague = {
      ...mockLeague,
      totalConferences: 4,
      conferences: [
        mockLeague.conferences[0],
        mockLeague.conferences[1],
        mockLeague.conferences[0],
        mockLeague.conferences[1],
      ],
    };

    vi.spyOn(leaguesApi, 'getLeague').mockResolvedValue(fullLeague);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Maximum conferences reached/)).toBeInTheDocument();
    });

    const addButton = screen.getByText(/Maximum conferences reached/);
    expect(addButton).toBeDisabled();
  });

  it('should handle add division to conference', async () => {
    const user = userEvent.setup();
    const newDivision = {
      id: 204,
      name: 'Division 3',
      teams: [],
    };

    vi.spyOn(structureApi, 'addDivision').mockResolvedValue(newDivision);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('AFC')).toBeInTheDocument();
    });

    // Find and click the + Division button
    const addDivButton = screen.getAllByText('+ Division')[0];
    await user.click(addDivButton);

    await waitFor(() => {
      expect(structureApi.addDivision).toHaveBeenCalledWith(100, {
        name: 'Division 3',
        numberOfTeams: 4,
      });
    });
  });

  it('should handle add team to division', async () => {
    const user = userEvent.setup();
    const newTeam = {
      id: 9,
      name: 'Team 3',
      city: 'City',
      budget: 100000000,
      championships: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      fanSupport: 50,
      chemistry: 50,
    };

    vi.spyOn(structureApi, 'addTeam').mockResolvedValue(newTeam);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('North')).toBeInTheDocument();
    });

    // Find and click + Team button
    const addTeamButtons = screen.getAllByText('+ Team');
    await user.click(addTeamButtons[0]);

    await waitFor(() => {
      expect(structureApi.addTeam).toHaveBeenCalledWith(200, {
        name: 'Team 3',
        city: 'City',
      });
    });
  });

  it('should handle delete conference with confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(structureApi, 'deleteConference').mockResolvedValue({
      success: true,
      totalEntitiesDeleted: 5,
      deletedByType: { Conference: 1, Division: 2, Team: 2 },
    });

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('AFC')).toBeInTheDocument();
    });

    // Find delete button for AFC (🗑️)
    const deleteButtons = screen.getAllByTitle('Delete conference');
    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Delete AFC?')
    );

    await waitFor(() => {
      expect(structureApi.deleteConference).toHaveBeenCalledWith(100);
    });

    confirmSpy.mockRestore();
  });

  it('should show last saved timestamp', async () => {
    const user = userEvent.setup();
    
    vi.spyOn(structureApi, 'addConference').mockResolvedValue({
      id: 102,
      name: 'Conference 3',
      divisions: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('+ Add Conference')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Conference');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Saved just now/)).toBeInTheDocument();
    });
  });

  it('should navigate back to leagues', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('← Back to Leagues')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Leagues');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/leagues');
  });

  it('should display error if league fails to load', async () => {
    vi.spyOn(leaguesApi, 'getLeague').mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    expect(screen.getByText('Back to Leagues')).toBeInTheDocument();
  });

  it('should display help text', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Click any name to edit/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Changes save automatically/)).toBeInTheDocument();
  });
});
