import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    useSeasonSchedule: vi.fn(),
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
  useSeasonSchedule: () => mockState.useSeasonSchedule(),
}));

import SchedulePage from '../SchedulePage';

const mockSchedule = {
  seasonId: 1,
  year: 2024,
  currentWeek: 2,
  weeks: [
    {
      week: 1,
      isCurrent: false,
      isComplete: true,
      games: [
        {
          id: 1,
          week: 1,
          homeTeamId: 1,
          homeTeamName: 'Patriots',
          homeTeamCity: 'New England',
          awayTeamId: 2,
          awayTeamName: 'Bills',
          awayTeamCity: 'Buffalo',
          homeScore: 24,
          awayScore: 17,
          isComplete: true,
          isByeWeek: false,
        },
      ],
    },
    {
      week: 2,
      isCurrent: true,
      isComplete: false,
      games: [
        {
          id: 2,
          week: 2,
          homeTeamId: 1,
          homeTeamName: 'Patriots',
          homeTeamCity: 'New England',
          awayTeamId: 3,
          awayTeamName: 'Dolphins',
          awayTeamCity: 'Miami',
          homeScore: null,
          awayScore: null,
          isComplete: false,
          isByeWeek: false,
        },
        {
          id: 3,
          week: 2,
          homeTeamId: 4,
          homeTeamName: 'Jets',
          homeTeamCity: 'New York',
          awayTeamId: 4,
          awayTeamName: 'Jets',
          awayTeamCity: 'New York',
          homeScore: null,
          awayScore: null,
          isComplete: false,
          isByeWeek: true,
        },
      ],
    },
  ],
};

describe('SchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.useSeasonSchedule = vi.fn().mockReturnValue({
      data: mockSchedule,
      isLoading: false,
      error: null,
    });
  });

  function renderPage() {
    return render(
      <BrowserRouter>
        <SchedulePage />
      </BrowserRouter>
    );
  }

  it('should render loading state', () => {
    mockState.useSeasonSchedule = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockState.useSeasonSchedule = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    });

    renderPage();
    expect(screen.getByText('Failed to load schedule')).toBeInTheDocument();
  });

  it('should render empty state when no schedule', () => {
    mockState.useSeasonSchedule = vi.fn().mockReturnValue({
      data: { ...mockSchedule, weeks: [] },
      isLoading: false,
      error: null,
    });

    renderPage();
    expect(screen.getByText('No schedule has been generated yet.')).toBeInTheDocument();
  });

  it('should render schedule heading', () => {
    renderPage();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('should display season info', () => {
    renderPage();
    expect(screen.getByText(/2024 Season/)).toBeInTheDocument();
    expect(screen.getByText(/Week 2 of 2/)).toBeInTheDocument();
  });

  it('should display week selector', () => {
    renderPage();
    expect(screen.getByLabelText('Select Week')).toBeInTheDocument();
  });

  it('should default to current week', () => {
    renderPage();
    const select = screen.getByLabelText('Select Week') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('should display current week games', () => {
    renderPage();
    expect(screen.getByText('Miami Dolphins')).toBeInTheDocument();
    expect(screen.getByText('New England Patriots')).toBeInTheDocument();
  });

  it('should switch weeks on select change', async () => {
    const user = userEvent.setup();
    renderPage();

    const select = screen.getByLabelText('Select Week');
    await user.selectOptions(select, '1');

    expect(screen.getByText('Final Scores')).toBeInTheDocument();
    expect(screen.getByText('Buffalo Bills')).toBeInTheDocument();
  });

  it('should display completed game scores', async () => {
    const user = userEvent.setup();
    renderPage();

    const select = screen.getByLabelText('Select Week');
    await user.selectOptions(select, '1');

    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('should display upcoming games section', () => {
    renderPage();
    expect(screen.getByText('Upcoming Games')).toBeInTheDocument();
  });

  it('should display bye week teams', () => {
    renderPage();
    expect(screen.getByText('Bye Week')).toBeInTheDocument();
    expect(screen.getByText('New York Jets')).toBeInTheDocument();
  });

  it('should show Current Week badge for current week', () => {
    renderPage();
    expect(screen.getByText('Current Week')).toBeInTheDocument();
  });

  it('should show Complete badge for completed weeks', async () => {
    const user = userEvent.setup();
    renderPage();

    const select = screen.getByLabelText('Select Week');
    await user.selectOptions(select, '1');

    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should display back to season link', () => {
    renderPage();
    expect(screen.getByText('← Back to Season')).toBeInTheDocument();
  });

  it('should mark current week in selector', () => {
    renderPage();
    const select = screen.getByLabelText('Select Week') as HTMLSelectElement;
    const option = Array.from(select.options).find(o => o.value === '2');
    expect(option?.textContent).toContain('(Current)');
  });

  it('should mark completed weeks in selector', () => {
    renderPage();
    const select = screen.getByLabelText('Select Week') as HTMLSelectElement;
    const option = Array.from(select.options).find(o => o.value === '1');
    expect(option?.textContent).toContain('✓');
  });
});
