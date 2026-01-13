import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const { mockNavigate, mockState } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockState: {
    useSeason: vi.fn(),
    useSeasonStandings: vi.fn(),
    useGenerateSchedule: vi.fn(),
    useAdvanceWeek: vi.fn(),
    useAdvanceByDays: vi.fn(),
    useProcessYearEnd: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

vi.mock('../../api/season', () => ({
  useSeason: () => mockState.useSeason(),
  useSeasonStandings: () => mockState.useSeasonStandings(),
  useGenerateSchedule: () => mockState.useGenerateSchedule(),
  useAdvanceWeek: () => mockState.useAdvanceWeek(),
  useAdvanceByDays: () => mockState.useAdvanceByDays(),
  useProcessYearEnd: () => mockState.useProcessYearEnd(),
}));

import SeasonDashboardPage from '../SeasonDashboardPage';

const mockSeason = {
  id: 1,
  leagueId: 1,
  year: 2024,
  currentWeek: 5,
  totalWeeks: 17,
  phase: 'regular',
  isComplete: false,
};

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
          ],
        },
      ],
    },
  ],
};

describe('SeasonDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.useSeason = vi.fn().mockReturnValue({
      data: mockSeason,
      isLoading: false,
      error: null,
    });
    mockState.useSeasonStandings = vi.fn().mockReturnValue({
      data: mockStandings,
      isLoading: false,
    });
    mockState.useGenerateSchedule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockState.useAdvanceWeek = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockState.useAdvanceByDays = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockState.useProcessYearEnd = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  function renderPage() {
    return render(
      <BrowserRouter>
        <SeasonDashboardPage />
      </BrowserRouter>
    );
  }

  it('should render loading state initially', () => {
    mockState.useSeason = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Loading season...')).toBeInTheDocument();
  });

  it('should render error state on error', () => {
    mockState.useSeason = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    });

    renderPage();
    expect(screen.getByText('Failed to load season data')).toBeInTheDocument();
  });

  it('should render season dashboard heading', async () => {
    renderPage();
    expect(screen.getByText('Season Dashboard')).toBeInTheDocument();
  });

  it('should display season year and phase', async () => {
    renderPage();
    expect(screen.getByText(/2024 Season/)).toBeInTheDocument();
    expect(screen.getByText(/Regular Season/)).toBeInTheDocument();
  });

  it('should display current week progress', async () => {
    renderPage();
    expect(screen.getByText('5 / 17')).toBeInTheDocument();
  });

  it('should display season status', async () => {
    renderPage();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display complete status when season is complete', async () => {
    mockState.useSeason = vi.fn().mockReturnValue({
      data: { ...mockSeason, isComplete: true },
      isLoading: false,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should display standings preview', async () => {
    renderPage();
    expect(screen.getByText('Standings Preview')).toBeInTheDocument();
    expect(screen.getByText('AFC')).toBeInTheDocument();
    expect(screen.getByText('New England Patriots')).toBeInTheDocument();
  });

  it('should show link to full standings', async () => {
    renderPage();
    expect(screen.getByText('View Full Standings →')).toBeInTheDocument();
  });

  it('should display quick links', async () => {
    renderPage();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Standings')).toBeInTheDocument();
  });

  it('should display Commissioner Controls', async () => {
    renderPage();
    expect(screen.getByText('Commissioner Controls')).toBeInTheDocument();
  });

  it('should show Advance Full Week button when in progress', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /Advance Full Week/i })).toBeInTheDocument();
  });

  it('should show back to league link', async () => {
    renderPage();
    expect(screen.getByText('← Back to League')).toBeInTheDocument();
  });

  it('should display progress bar', async () => {
    renderPage();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('29%')).toBeInTheDocument();
  });

  it('should show Not Started when no schedule', async () => {
    mockState.useSeason = vi.fn().mockReturnValue({
      data: { ...mockSeason, currentWeek: 0, totalWeeks: 0 },
      isLoading: false,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('should call generate schedule mutation', async () => {
    const user = userEvent.setup();
    const mutateFn = vi.fn();
    mockState.useSeason = vi.fn().mockReturnValue({
      data: { ...mockSeason, currentWeek: 0, totalWeeks: 0 },
      isLoading: false,
      error: null,
    });
    mockState.useGenerateSchedule = vi.fn().mockReturnValue({
      mutate: mutateFn,
      isPending: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: /Generate Schedule/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Generate/i }));

    expect(mutateFn).toHaveBeenCalledWith({ leagueId: 1 });
  });

  it('should call advance week mutation', async () => {
    const user = userEvent.setup();
    const mutateFn = vi.fn();
    mockState.useAdvanceWeek = vi.fn().mockReturnValue({
      mutate: mutateFn,
      isPending: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: /Advance Full Week/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Advance Week/i }));

    expect(mutateFn).toHaveBeenCalledWith(1);
  });
});
