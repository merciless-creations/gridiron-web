import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LeagueStructurePage from '../LeagueStructurePage';
import * as leaguesApi from '../../api/leagues';
import * as constraintsApi from '../../api/leagueConstraints';
import * as structureApi from '../../api/leagueStructure';
import * as teamsApi from '../../api/teams';

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
            { id: 1, divisionId: 200, name: 'Ravens', city: 'Baltimore', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
            { id: 2, divisionId: 200, name: 'Steelers', city: 'Pittsburgh', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
          ],
        },
        {
          id: 201,
          name: 'South',
          teams: [
            { id: 3, divisionId: 201, name: 'Titans', city: 'Tennessee', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
            { id: 4, divisionId: 201, name: 'Colts', city: 'Indianapolis', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
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
            { id: 5, divisionId: 202, name: 'Cowboys', city: 'Dallas', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 95, chemistry: 90 },
            { id: 6, divisionId: 202, name: 'Eagles', city: 'Philadelphia', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
          ],
        },
        {
          id: 203,
          name: 'West',
          teams: [
            { id: 7, divisionId: 203, name: '49ers', city: 'San Francisco', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 90, chemistry: 85 },
            { id: 8, divisionId: 203, name: 'Seahawks', city: 'Seattle', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
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

  it('should display league name and structure after loading', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test League')).toBeInTheDocument();
    });

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

  it('should display teams with city names', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ravens')).toBeInTheDocument();
    });

    expect(screen.getByText('(Baltimore)')).toBeInTheDocument();
    expect(screen.getByText('Steelers')).toBeInTheDocument();
    expect(screen.getByText('(Pittsburgh)')).toBeInTheDocument();
  });

  it('should show new conference in UI after adding', async () => {
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

    // Test UI behavior: new conference appears
    await waitFor(() => {
      expect(screen.getByText('Conference 3')).toBeInTheDocument();
    });
  });

  it('should disable add conference button when max reached', async () => {
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

  it('should show new division in UI after adding', async () => {
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

    // Test UI behavior: new division appears
    await waitFor(() => {
      expect(screen.getByText('Division 3')).toBeInTheDocument();
    });
  });

  it('should show new team in UI after adding', async () => {
    const user = userEvent.setup();
    const newTeam = {
      id: 9,
      divisionId: 200,
      name: 'Team 9',
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

    // Test UI behavior: new team appears
    await waitFor(() => {
      expect(screen.getByText('Team 9')).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog when deleting conference', async () => {
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

    // Test UI behavior: confirmation dialog shown
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Delete AFC?')
    );

    confirmSpy.mockRestore();
  });

  it('should show last saved timestamp after changes', async () => {
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

    // Test UI behavior: saved indicator shown
    await waitFor(() => {
      expect(screen.getByText(/Saved just now/)).toBeInTheDocument();
    });
  });

  it('should navigate back to leagues list', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('← Back to Leagues')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Leagues');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/leagues');
  });

  it('should display error message if league fails to load', async () => {
    vi.spyOn(leaguesApi, 'getLeague').mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    expect(screen.getByText('Back to Leagues')).toBeInTheDocument();
  });

  it('should display help text for editing', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Click any name to edit/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Changes save automatically/)).toBeInTheDocument();
  });

  describe('Inline Editing', () => {
    describe('Conference name editing', () => {
      it('should enter edit mode when clicking conference name', async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() => {
          expect(screen.getByText('AFC')).toBeInTheDocument();
        });

        // Click on conference name to edit
        await user.click(screen.getByText('AFC'));

        // Input should appear with current value
        const input = screen.getByDisplayValue('AFC');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
      });

      it('should save conference name on Enter key', async () => {
        const user = userEvent.setup();
        const updateConferenceSpy = vi.spyOn(leaguesApi, 'updateConference').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('AFC')).toBeInTheDocument();
        });

        // Click to edit
        await user.click(screen.getByText('AFC'));

        // Clear and type new name
        const input = screen.getByDisplayValue('AFC');
        await user.clear(input);
        await user.type(input, 'American Conference{Enter}');

        // Verify API was called with correct params
        await waitFor(() => {
          expect(updateConferenceSpy).toHaveBeenCalledWith(100, { name: 'American Conference' });
        });
      });

      it('should cancel edit on Escape key without saving', async () => {
        const user = userEvent.setup();
        const updateConferenceSpy = vi.spyOn(leaguesApi, 'updateConference').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('AFC')).toBeInTheDocument();
        });

        // Click to edit
        await user.click(screen.getByText('AFC'));

        // Type new name then press Escape
        const input = screen.getByDisplayValue('AFC');
        await user.clear(input);
        await user.type(input, 'New Name{Escape}');

        // Should revert to original name and not call API
        await waitFor(() => {
          expect(screen.getByText('AFC')).toBeInTheDocument();
        });
        expect(updateConferenceSpy).not.toHaveBeenCalled();
      });
    });

    describe('Division name editing', () => {
      it('should enter edit mode when clicking division name', async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() => {
          expect(screen.getByText('North')).toBeInTheDocument();
        });

        // Click on division name to edit
        await user.click(screen.getByText('North'));

        // Input should appear with current value
        const input = screen.getByDisplayValue('North');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
      });

      it('should save division name on Enter key', async () => {
        const user = userEvent.setup();
        const updateDivisionSpy = vi.spyOn(leaguesApi, 'updateDivision').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('North')).toBeInTheDocument();
        });

        // Click to edit
        await user.click(screen.getByText('North'));

        // Clear and type new name
        const input = screen.getByDisplayValue('North');
        await user.clear(input);
        await user.type(input, 'Northern Division{Enter}');

        // Verify API was called with correct params
        await waitFor(() => {
          expect(updateDivisionSpy).toHaveBeenCalledWith(200, { name: 'Northern Division' });
        });
      });

      it('should cancel division edit on Escape key', async () => {
        const user = userEvent.setup();
        const updateDivisionSpy = vi.spyOn(leaguesApi, 'updateDivision').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('North')).toBeInTheDocument();
        });

        // Click to edit
        await user.click(screen.getByText('North'));

        // Type new name then press Escape
        const input = screen.getByDisplayValue('North');
        await user.clear(input);
        await user.type(input, 'New Division{Escape}');

        // Should revert to original name
        await waitFor(() => {
          expect(screen.getByText('North')).toBeInTheDocument();
        });
        expect(updateDivisionSpy).not.toHaveBeenCalled();
      });
    });

    describe('Team name editing', () => {
      it('should enter edit mode when clicking team name', async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() => {
          expect(screen.getByText('Ravens')).toBeInTheDocument();
        });

        // Click on team name to edit
        await user.click(screen.getByText('Ravens'));

        // Input should appear with current value
        const input = screen.getByDisplayValue('Ravens');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
      });

      it('should save team name on Enter key', async () => {
        const user = userEvent.setup();
        const updateTeamSpy = vi.spyOn(teamsApi, 'updateTeam').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('Ravens')).toBeInTheDocument();
        });

        // Click to edit
        await user.click(screen.getByText('Ravens'));

        // Clear and type new name
        const input = screen.getByDisplayValue('Ravens');
        await user.clear(input);
        await user.type(input, 'Crows{Enter}');

        // Verify API was called with correct params
        await waitFor(() => {
          expect(updateTeamSpy).toHaveBeenCalledWith(1, { name: 'Crows' });
        });
      });

      it('should cancel team name edit on Escape key', async () => {
        const user = userEvent.setup();
        const updateTeamSpy = vi.spyOn(teamsApi, 'updateTeam').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('Ravens')).toBeInTheDocument();
        });

        // Click to edit
        await user.click(screen.getByText('Ravens'));

        // Type new name then press Escape
        const input = screen.getByDisplayValue('Ravens');
        await user.clear(input);
        await user.type(input, 'New Team{Escape}');

        // Should revert to original name
        await waitFor(() => {
          expect(screen.getByText('Ravens')).toBeInTheDocument();
        });
        expect(updateTeamSpy).not.toHaveBeenCalled();
      });
    });

    describe('Team city editing', () => {
      it('should enter edit mode when clicking team city', async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() => {
          expect(screen.getByText('(Baltimore)')).toBeInTheDocument();
        });

        // Click on city to edit
        await user.click(screen.getByText('(Baltimore)'));

        // Input should appear with current value
        const input = screen.getByDisplayValue('Baltimore');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
      });

      it('should save team city on Enter key', async () => {
        const user = userEvent.setup();
        const updateTeamSpy = vi.spyOn(teamsApi, 'updateTeam').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('(Baltimore)')).toBeInTheDocument();
        });

        // Click to edit city
        await user.click(screen.getByText('(Baltimore)'));

        // Clear and type new city
        const input = screen.getByDisplayValue('Baltimore');
        await user.clear(input);
        await user.type(input, 'Maryland{Enter}');

        // Verify API was called with correct params
        await waitFor(() => {
          expect(updateTeamSpy).toHaveBeenCalledWith(1, { city: 'Maryland' });
        });
      });

      it('should cancel team city edit on Escape key', async () => {
        const user = userEvent.setup();
        const updateTeamSpy = vi.spyOn(teamsApi, 'updateTeam').mockResolvedValue(undefined);

        renderPage();

        await waitFor(() => {
          expect(screen.getByText('(Baltimore)')).toBeInTheDocument();
        });

        // Click to edit city
        await user.click(screen.getByText('(Baltimore)'));

        // Type new city then press Escape
        const input = screen.getByDisplayValue('Baltimore');
        await user.clear(input);
        await user.type(input, 'New City{Escape}');

        // Should revert to original city
        await waitFor(() => {
          expect(screen.getByText('(Baltimore)')).toBeInTheDocument();
        });
        expect(updateTeamSpy).not.toHaveBeenCalled();
      });
    });
  });
});
