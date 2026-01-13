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
    onUnlockSimulation: vi.fn(),
    isGenerating: false,
    isAdvancing: false,
    isAdvancingByDays: false,
    isProcessingYearEnd: false,
    isUnlocking: false,
    simulationInProgress: false,
    simulationStartedAt: null,
    simulationStartedByUserName: null,
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
    it('does not show simulation lock section when not in progress', () => {
      render(<CommissionerControls {...defaultProps} />);

      expect(screen.queryByText(/Simulation in progress/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Force Unlock/i)).not.toBeInTheDocument();
    });

    it('shows simulation lock section when simulation is in progress', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:30:00Z"
          simulationStartedByUserName="Admin"
        />
      );

      expect(screen.getByText(/Simulation in progress/i)).toBeInTheDocument();
      expect(screen.getByText(/started by Admin/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Force Unlock/i })).toBeInTheDocument();
    });

    it('shows simulation duration when locked', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:30:00Z"
          simulationStartedByUserName="Admin"
        />
      );

      expect(screen.getByText(/Running for 30 minutes/i)).toBeInTheDocument();
    });

    it('shows explanation text for force unlock', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:00:00Z"
          simulationStartedByUserName="Admin"
        />
      );

      expect(
        screen.getByText(/If the simulation has crashed or stalled/i)
      ).toBeInTheDocument();
    });
  });

  describe('Force Unlock Button', () => {
    it('shows confirmation dialog when Force Unlock is clicked', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:00:00Z"
          simulationStartedByUserName="Admin"
        />
      );

      const unlockButton = screen.getByRole('button', { name: /Force Unlock/i });
      fireEvent.click(unlockButton);

      expect(screen.getByRole('button', { name: /Confirm Force Unlock/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('calls onUnlockSimulation when confirmed', () => {
      const onUnlock = vi.fn();
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:00:00Z"
          simulationStartedByUserName="Admin"
          onUnlockSimulation={onUnlock}
        />
      );

      // Click to show confirmation
      fireEvent.click(screen.getByRole('button', { name: /Force Unlock/i }));

      // Confirm the unlock
      fireEvent.click(screen.getByRole('button', { name: /Confirm Force Unlock/i }));

      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it('cancels unlock when Cancel is clicked', () => {
      const onUnlock = vi.fn();
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:00:00Z"
          simulationStartedByUserName="Admin"
          onUnlockSimulation={onUnlock}
        />
      );

      // Click to show confirmation
      fireEvent.click(screen.getByRole('button', { name: /Force Unlock/i }));

      // Cancel
      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onUnlock).not.toHaveBeenCalled();
      // Should be back to Force Unlock button
      expect(screen.getByRole('button', { name: /Force Unlock/i })).toBeInTheDocument();
    });

    it('disables buttons while unlocking', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:00:00Z"
          simulationStartedByUserName="Admin"
          isUnlocking={true}
        />
      );

      const unlockButton = screen.getByRole('button', { name: /Force Unlock/i });
      expect(unlockButton).toBeDisabled();
    });
  });

  describe('Controls Disabled During Simulation', () => {
    it('disables all action buttons when any operation is in progress', () => {
      render(
        <CommissionerControls
          {...defaultProps}
          simulationInProgress={true}
          simulationStartedAt="2024-06-15T11:00:00Z"
          simulationStartedByUserName="Admin"
          isAdvancingByDays={true}
        />
      );

      // Find the advance days button
      const advanceDaysButton = screen.getByTestId('advance-days-button');
      expect(advanceDaysButton).toBeDisabled();
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
  });
});
