import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreateLeaguePage from '../CreateLeaguePage';
import * as leaguesApi from '../../api/leagues';
import * as constraintsApi from '../../api/leagueConstraints';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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
  totalTeams: 32,
  conferences: [],
};

describe('CreateLeaguePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(constraintsApi, 'getLeagueConstraints').mockResolvedValue(mockConstraints);
    vi.spyOn(leaguesApi, 'createLeague').mockResolvedValue(mockLeague);
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

  it('should fetch and display constraints', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create New League')).toBeInTheDocument();
    });

    expect(constraintsApi.getLeagueConstraints).toHaveBeenCalled();
    
    // Check that min/max values are displayed
    expect(screen.getByText(/Min: 1, Max: 4/)).toBeInTheDocument(); // Conferences
    expect(screen.getByText(/Min: 1, Max: 8/)).toBeInTheDocument(); // Divisions
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

  it('should validate required league name', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create League')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Create League/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('League name is required')).toBeInTheDocument();
    });

    expect(leaguesApi.createLeague).not.toHaveBeenCalled();
  });

  it('should submit form and navigate on success', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/League Name/);
    await user.type(nameInput, 'My Test League');

    const submitButton = screen.getByRole('button', { name: /Create League/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(leaguesApi.createLeague).toHaveBeenCalledWith({
        name: 'My Test League',
        numberOfConferences: 2,
        divisionsPerConference: 4,
        teamsPerDivision: 4,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/leagues/1/structure');
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(leaguesApi, 'createLeague').mockImplementation(() => 
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

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should display error on submission failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(leaguesApi, 'createLeague').mockRejectedValue(new Error('API Error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/League Name/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/League Name/);
    await user.type(nameInput, 'Test League');

    const submitButton = screen.getByRole('button', { name: /Create League/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
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

  it('should enforce min/max constraints', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/Number of Conferences/)).toBeInTheDocument();
    });

    const conferencesInput = screen.getAllByDisplayValue('2')[1];
    
    // Check min attribute
    expect(conferencesInput).toHaveAttribute('min', '1');
    // Check max attribute
    expect(conferencesInput).toHaveAttribute('max', '4');
  });

  it('should display error if constraints fail to load', async () => {
    vi.spyOn(constraintsApi, 'getLeagueConstraints').mockRejectedValue(new Error('Network error'));
    
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load constraints/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
  });
});
