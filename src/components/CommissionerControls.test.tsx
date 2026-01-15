import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommissionerControls } from './CommissionerControls';
import type { Season } from '../types/Season';

describe('CommissionerControls', () => {
  const mockSeason: Season = {
    id: 1,
    leagueId: 1,
    year: 2024,
    phase: 'regular',
    currentWeek: 5,
    totalWeeks: 18,
    isComplete: false,
    scheduleStatus: 'committed',
    regularSeasonWeeks: 17,
    byeWeeksPerTeam: 1,
    currentDayOfWeek: 0,
  };

  const defaultProps = {
    season: mockSeason,
    onGenerateSchedule: vi.fn(),
    onAdvanceWeek: vi.fn(),
    onAdvanceByDays: vi.fn(),
    onProcessYearEnd: vi.fn(),
    isGenerating: false,
    isAdvancing: false,
    isAdvancingByDays: false,
    isProcessingYearEnd: false,
    simulationInProgress: false,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Simulation Lock Display', () => {
    it('does not show simulation lock notice when not in progress', () => {
      render(<CommissionerControls {...defaultProps} />);

      expect(screen.queryByText(/Simulation in progress/i)).not.toBeInTheDocument();
    });

    it('shows simulation lock notice when simulation is in progress', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
        />
      );

      expect(screen.getByText(/Simulation in progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Controls are disabled until complete/i)).toBeInTheDocument();
    });
  });

  describe('Controls Disabled During Simulation', () => {
    it('disables all action buttons when simulation is in progress', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
        />
      );

      // Find the advance days button
      const advanceDaysButton = screen.getByTestId('advance-days-button');
      expect(advanceDaysButton).toBeDisabled();
    });

    it('disables buttons when any operation is loading', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          isAdvancingByDays={true}
        />
      );

      const advanceDaysButton = screen.getByTestId('advance-days-button');
      expect(advanceDaysButton).toBeDisabled();
    });

    it('disables quick day buttons during simulation', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
        />
      );

      const quickButton = screen.getByTestId('quick-days-1');
      expect(quickButton).toBeDisabled();
    });
  });

  describe('Standard Controls', () => {
    it('renders advance days controls when season has schedule', () => {
      render(<CommissionerControls {...defaultProps} />);

      expect(screen.getByTestId('advance-days-controls')).toBeInTheDocument();
      expect(screen.getByTestId('days-input')).toBeInTheDocument();
    });

    it('shows generate schedule button when no schedule exists', () => {
      const seasonWithoutSchedule = { ...mockSeason, totalWeeks: 0 };
      render(
        <CommissionerControls {...defaultProps} season={seasonWithoutSchedule} />
      );

      expect(screen.getByRole('button', { name: /Generate Schedule/i })).toBeInTheDocument();
    });

    it('shows process year end button when season is complete', () => {
      const completeSeason = { ...mockSeason, isComplete: true };
      render(<CommissionerControls {...defaultProps} season={completeSeason} />);

      expect(screen.getByRole('button', { name: /Process Year End/i })).toBeInTheDocument();
    });

    it('enables buttons when not simulating and not loading', () => {
      render(<CommissionerControls {...defaultProps} />);

      const advanceDaysButton = screen.getByTestId('advance-days-button');
      expect(advanceDaysButton).not.toBeDisabled();
    });
  });

  describe('Advance Days Functionality', () => {
    it('allows changing days to advance', () => {
      render(<CommissionerControls {...defaultProps} />);

      const daysInput = screen.getByTestId('days-input');
      fireEvent.change(daysInput, { target: { value: '14' } });

      expect(daysInput).toHaveValue(14);
    });

    it('calls onAdvanceByDays when confirmed', () => {
      const onAdvanceByDays = vi.fn();
      render(
        <CommissionerControls
          {...defaultProps}
          onAdvanceByDays={onAdvanceByDays}
        />
      );

      // Click to start confirmation
      fireEvent.click(screen.getByTestId('advance-days-button'));
      // Confirm
      fireEvent.click(screen.getByTestId('advance-days-confirm'));

      expect(onAdvanceByDays).toHaveBeenCalledWith(7); // Default is 7 days
    });
  });
});
