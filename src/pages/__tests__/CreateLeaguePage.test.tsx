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

  describe('Season Configuration', () => {
    it('should display season configuration section with heading', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Season Configuration')).toBeInTheDocument();
      });
    });

    it('should display regular season games with default value of 17', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('slider', { name: /Regular Season Games/i })).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider', { name: /Regular Season Games/i });
      expect(slider).toHaveValue('17');
    });

    it('should display bye weeks selector with default value of 1', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Bye Weeks per Team')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '1 week', pressed: true });
      expect(selectedButton).toBeInTheDocument();
    });

    it('should update regular season games when slider changes', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('slider', { name: /Regular Season Games/i })).toBeInTheDocument();
      });

      const numberInput = screen.getByRole('spinbutton', { name: /Regular Season Games Number Input/i });
      await user.clear(numberInput);
      await user.type(numberInput, '14');

      await waitFor(() => {
        const slider = screen.getByRole('slider', { name: /Regular Season Games/i });
        expect(slider).toHaveValue('14');
      });
    });

    it('should update bye weeks when clicking different options', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Bye Weeks per Team')).toBeInTheDocument();
      });

      const twoWeeksButton = screen.getByRole('button', { name: '2 weeks' });
      await user.click(twoWeeksButton);

      expect(twoWeeksButton).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: '1 week' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('should display 0 weeks option for bye weeks', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '0 weeks' })).toBeInTheDocument();
      });

      const zeroWeeksButton = screen.getByRole('button', { name: '0 weeks' });
      await user.click(zeroWeeksButton);

      expect(zeroWeeksButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should enforce min/max constraints on regular season games input', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('spinbutton', { name: /Regular Season Games Number Input/i })).toBeInTheDocument();
      });

      const numberInput = screen.getByRole('spinbutton', { name: /Regular Season Games Number Input/i });
      expect(numberInput).toHaveAttribute('min', '10');
      expect(numberInput).toHaveAttribute('max', '18');
    });

    it('should display helper text for regular season games', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Number of games each team plays during the regular season/)).toBeInTheDocument();
      });
    });

    it('should display helper text for bye weeks', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Number of rest weeks each team receives/)).toBeInTheDocument();
      });
    });

    it('should include season config values in form submission', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/League Name/);
      await user.type(nameInput, 'Test League');

      const gamesInput = screen.getByRole('spinbutton', { name: /Regular Season Games Number Input/i });
      await user.clear(gamesInput);
      await user.type(gamesInput, '16');

      const twoWeeksButton = screen.getByRole('button', { name: '2 weeks' });
      await user.click(twoWeeksButton);

      const submitButton = screen.getByRole('button', { name: /Create League/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockState.createLeagueFn).toHaveBeenCalledWith(
          expect.objectContaining({
            regularSeasonGames: 16,
            byeWeeksPerTeam: 2,
          })
        );
      });
    });

    it('should submit with default season config values if unchanged', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/League Name/);
      await user.type(nameInput, 'Test League');

      const submitButton = screen.getByRole('button', { name: /Create League/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockState.createLeagueFn).toHaveBeenCalledWith(
          expect.objectContaining({
            regularSeasonGames: 17,
            byeWeeksPerTeam: 1,
          })
        );
      });
    });

    it('should show all three bye week options', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '0 weeks' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '1 week' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '2 weeks' })).toBeInTheDocument();
      });
    });

    it('should visually highlight selected bye week option', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '1 week' })).toBeInTheDocument();
      });

      const oneWeekButton = screen.getByRole('button', { name: '1 week' });
      expect(oneWeekButton).toHaveClass('bg-emerald-600');

      const zeroWeeksButton = screen.getByRole('button', { name: '0 weeks' });
      expect(zeroWeeksButton).toHaveClass('bg-zinc-700');

      await user.click(zeroWeeksButton);

      expect(zeroWeeksButton).toHaveClass('bg-emerald-600');
      expect(oneWeekButton).toHaveClass('bg-zinc-700');
    });
  });
});
