import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Use vi.hoisted to ensure mocks are available before vi.mock runs
const { mockNavigate, mockState } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockState: {
    createLeagueFn: vi.fn(),
    getLeagueConstraintsFn: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/leagues', () => ({
  createLeague: (...args: unknown[]) => mockState.createLeagueFn(...args),
}));

vi.mock('../../api/leagueConstraints', () => ({
  getLeagueConstraints: (...args: unknown[]) => mockState.getLeagueConstraintsFn(...args),
}));

// Import component after mocks are set up
import CreateLeaguePage from '../CreateLeaguePage';

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
  totalTeams: 32,
  conferences: [],
};

describe('CreateLeaguePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset and set up default mock implementations
    mockState.getLeagueConstraintsFn = vi.fn().mockResolvedValue(mockConstraints);
    mockState.createLeagueFn = vi.fn().mockResolvedValue(mockLeague);
  });

  function renderPage() {
    return render(
      <BrowserRouter>
        <CreateLeaguePage />
      </BrowserRouter>
    );
  }

  it('should render loading state initially', () => {
    renderPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display form fields after loading', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create New League')).toBeInTheDocument();
    });

    // Check that form fields are displayed
    expect(screen.getByLabelText(/Number of Conferences/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Divisions per Conference/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teams per Division/)).toBeInTheDocument();
  });

  it('should display form with default values', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/League Name/);
    const conferencesSlider = screen.getByLabelText(/Number of Conferences/);
    const divisionsSlider = screen.getByLabelText(/Divisions per Conference/);
    const teamsSlider = screen.getByLabelText(/Teams per Division/);

    expect(nameInput).toHaveValue('');
    expect(conferencesSlider).toHaveValue('2');
    expect(divisionsSlider).toHaveValue('4');
    expect(teamsSlider).toHaveValue('4');
  });

  it('should calculate and display total teams', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create New League')).toBeInTheDocument();
    });

    // Default: 2 × 4 × 4 = 32
    expect(screen.getByText('32')).toBeInTheDocument();

    // Change to 1 × 2 × 4 = 8
    const conferencesInput = screen.getAllByDisplayValue('2')[1]; // Number input, not slider
    await user.clear(conferencesInput);
    await user.type(conferencesInput, '1');

    const divisionsInput = screen.getAllByDisplayValue('4')[1]; // Number input
    await user.clear(divisionsInput);
    await user.type(divisionsInput, '2');

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('should disable submit button when name is empty', async () => {
    const user = userEvent.setup();
    
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create New League')).toBeInTheDocument();
    });

    // Submit button should be disabled when name is empty
    const submitButton = screen.getByRole('button', { name: /Create League/i });
    expect(submitButton).toBeDisabled();

    // Type a name - button should become enabled
    const nameInput = screen.getByLabelText(/League Name/i);
    await user.type(nameInput, 'Test League');
    
    expect(submitButton).toBeEnabled();
  });

  it('should navigate to structure page on successful submission', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/League Name/);
    await user.type(nameInput, 'My Test League');

    const submitButton = screen.getByRole('button', { name: /Create League/ });
    await user.click(submitButton);

    // Test UI behavior: navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues/1/structure');
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    // Slow down the mock to verify loading state is visible
    mockState.createLeagueFn = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockLeague), 100))
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/League Name/);
    await user.type(nameInput, 'Test');

    const submitButton = screen.getByRole('button', { name: /Create League/ });
    await user.click(submitButton);

    // Test UI behavior: loading text and disabled button
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();
    // Replace the mock function entirely to ensure rejection
    mockState.createLeagueFn = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error('API Error'));
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/League Name/);
    await user.type(nameInput, 'Test League');

    const submitButton = screen.getByRole('button', { name: /Create League/ });

    await user.click(submitButton);

    // Test UI behavior: error message should be displayed
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    // Verify the form is still visible (not navigated away)
    expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create League/ })).toBeInTheDocument();
  });

  it('should navigate back to leagues on cancel', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create New League')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/leagues');
  });

  it('should navigate back on back button click', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('← Back to Leagues')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Leagues');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/leagues');
  });

  it('should update sliders when number inputs change', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/Number of Conferences/)).toBeInTheDocument();
    });

    const conferencesNumberInput = screen.getAllByDisplayValue('2')[1];
    await user.clear(conferencesNumberInput);
    await user.type(conferencesNumberInput, '3');

    await waitFor(() => {
      const slider = screen.getByLabelText(/Number of Conferences/);
      expect(slider).toHaveValue('3');
    });
  });

  it('should enforce min/max constraints on inputs', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/Number of Conferences/)).toBeInTheDocument();
    });

    const conferencesInput = screen.getAllByDisplayValue('2')[1];
    
    // Check that constraints are applied to the input
    expect(conferencesInput).toHaveAttribute('min', '1');
    expect(conferencesInput).toHaveAttribute('max', '4');
  });

  it('should display error with retry button if constraints fail to load', async () => {
    mockState.getLeagueConstraintsFn = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error('Network error'));
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load league constraints/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
  });

  describe('Playoff Configuration', () => {
    it('should display playoff configuration section', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Playoff Teams per Conference/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Division winners automatically qualify/)).toBeInTheDocument();
      expect(screen.getByLabelText(/First-round bye for top seed/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Head-to-head record/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Point differential/)).toBeInTheDocument();
    });

    it('should have correct default values for playoff settings', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const playoffTeamsSlider = screen.getByLabelText(/Playoff Teams per Conference/);
      expect(playoffTeamsSlider).toHaveValue('7');

      const divisionWinnersCheckbox = screen.getByLabelText(/Division winners automatically qualify/);
      expect(divisionWinnersCheckbox).toBeChecked();

      const byeWeekCheckbox = screen.getByLabelText(/First-round bye for top seed/);
      expect(byeWeekCheckbox).toBeChecked();

      const headToHeadCheckbox = screen.getByLabelText(/Head-to-head record/);
      expect(headToHeadCheckbox).toBeChecked();

      const pointDiffCheckbox = screen.getByLabelText(/Point differential/);
      expect(pointDiffCheckbox).toBeChecked();
    });

    it('should update playoff teams slider value', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const playoffTeamsNumberInput = screen.getAllByDisplayValue('7')[1];
      await user.clear(playoffTeamsNumberInput);
      await user.type(playoffTeamsNumberInput, '4');

      await waitFor(() => {
        const slider = screen.getByLabelText(/Playoff Teams per Conference/);
        expect(slider).toHaveValue('4');
      });
    });

    it('should toggle division winners auto qualify checkbox', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const checkbox = screen.getByLabelText(/Division winners automatically qualify/);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle bye week for top seed checkbox', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const checkbox = screen.getByLabelText(/First-round bye for top seed/);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle head-to-head tiebreaker checkbox', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const checkbox = screen.getByLabelText(/Head-to-head record/);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle point differential tiebreaker checkbox', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const checkbox = screen.getByLabelText(/Point differential/);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should limit max playoff teams to teams per conference', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const divisionsInput = screen.getAllByDisplayValue('4')[1];
      await user.clear(divisionsInput);
      await user.type(divisionsInput, '1');

      const teamsInput = screen.getAllByDisplayValue('4')[1];
      await user.clear(teamsInput);
      await user.type(teamsInput, '3');

      await waitFor(() => {
        const playoffSlider = screen.getByLabelText(/Playoff Teams per Conference/);
        expect(playoffSlider).toHaveAttribute('max', '3');
      });
    });

    it('should clamp playoff teams value when max decreases', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const playoffInput = screen.getAllByDisplayValue('7')[1];
      await user.clear(playoffInput);
      await user.type(playoffInput, '16');

      await waitFor(() => {
        const slider = screen.getByLabelText(/Playoff Teams per Conference/);
        expect(slider).toHaveValue('16');
      });

      const divisionsInput = screen.getAllByDisplayValue('4')[1];
      await user.clear(divisionsInput);
      await user.type(divisionsInput, '1');

      const teamsInput = screen.getAllByDisplayValue('4')[1];
      await user.clear(teamsInput);
      await user.type(teamsInput, '4');

      await waitFor(() => {
        const playoffSlider = screen.getByLabelText(/Playoff Teams per Conference/);
        expect(playoffSlider).toHaveValue('4');
      });
    });

    it('should display teams per conference in helper text', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      expect(screen.getByText(/16 teams per conference/)).toBeInTheDocument();
    });

    it('should include playoff config in form submission', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/League Name/);
      await user.type(nameInput, 'Playoff Test League');

      const divisionWinnersCheckbox = screen.getByLabelText(/Division winners automatically qualify/);
      await user.click(divisionWinnersCheckbox);

      const byeWeekCheckbox = screen.getByLabelText(/First-round bye for top seed/);
      await user.click(byeWeekCheckbox);

      const submitButton = screen.getByRole('button', { name: /Create League/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockState.createLeagueFn).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Playoff Test League',
            playoffTeamsPerConference: 7,
            divisionWinnersAutoQualify: false,
            byeWeekForTopSeed: false,
            useHeadToHeadTiebreaker: true,
            usePointDifferentialTiebreaker: true,
          })
        );
      });
    });

    it('should enforce minimum of 2 playoff teams', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Playoff Configuration')).toBeInTheDocument();
      });

      const playoffSlider = screen.getByLabelText(/Playoff Teams per Conference/);
      expect(playoffSlider).toHaveAttribute('min', '2');
    });
  });
});
