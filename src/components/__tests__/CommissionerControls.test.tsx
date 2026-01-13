import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommissionerControls } from '../CommissionerControls';
import type { Season } from '../../types/Season';

const mockSeason: Season = {
  id: 1,
  leagueId: 1,
  year: 2024,
  currentWeek: 5,
  totalWeeks: 17,
  phase: 'regular',
  isComplete: false,
};

const mockCompleteSeason: Season = {
  ...mockSeason,
  currentWeek: 17,
  isComplete: true,
};

const mockNoScheduleSeason: Season = {
  ...mockSeason,
  currentWeek: 0,
  totalWeeks: 0,
};

describe('CommissionerControls', () => {
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
  };

  it('should render Commissioner Controls heading', () => {
    render(<CommissionerControls {...defaultProps} />);
    expect(screen.getByText('Commissioner Controls')).toBeInTheDocument();
  });

  it('should show Generate Schedule button when no schedule exists', () => {
    render(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} />);
    expect(screen.getByRole('button', { name: /Generate Schedule/i })).toBeInTheDocument();
  });

  it('should show Advance Full Week button when schedule exists and season not complete', () => {
    render(<CommissionerControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Advance Full Week/i })).toBeInTheDocument();
  });

  it('should show Process Year End button when season is complete', () => {
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} />);
    expect(screen.getByRole('button', { name: /Process Year End/i })).toBeInTheDocument();
  });

  it('should not show Advance Full Week when season is complete', () => {
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} />);
    expect(screen.queryByRole('button', { name: /Advance Full Week/i })).not.toBeInTheDocument();
  });

  it('should require confirmation before generating schedule', async () => {
    const user = userEvent.setup();
    const onGenerateSchedule = vi.fn();
    render(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} onGenerateSchedule={onGenerateSchedule} />);

    const generateButton = screen.getByRole('button', { name: /Generate Schedule/i });
    await user.click(generateButton);

    expect(onGenerateSchedule).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Confirm Generate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('should call onGenerateSchedule on confirmation', async () => {
    const user = userEvent.setup();
    const onGenerateSchedule = vi.fn();
    render(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} onGenerateSchedule={onGenerateSchedule} />);

    await user.click(screen.getByRole('button', { name: /Generate Schedule/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Generate/i }));

    expect(onGenerateSchedule).toHaveBeenCalledTimes(1);
  });

  it('should cancel confirmation on Cancel click', async () => {
    const user = userEvent.setup();
    render(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} />);

    await user.click(screen.getByRole('button', { name: /Generate Schedule/i }));
    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(screen.getByRole('button', { name: /Generate Schedule/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirm Generate/i })).not.toBeInTheDocument();
  });

  it('should require confirmation before advancing week', async () => {
    const user = userEvent.setup();
    const onAdvanceWeek = vi.fn();
    render(<CommissionerControls {...defaultProps} onAdvanceWeek={onAdvanceWeek} />);

    await user.click(screen.getByRole('button', { name: /Advance Full Week/i }));

    expect(onAdvanceWeek).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Confirm Advance Week/i })).toBeInTheDocument();
  });

  it('should call onAdvanceWeek on confirmation', async () => {
    const user = userEvent.setup();
    const onAdvanceWeek = vi.fn();
    render(<CommissionerControls {...defaultProps} onAdvanceWeek={onAdvanceWeek} />);

    await user.click(screen.getByRole('button', { name: /Advance Full Week/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Advance Week/i }));

    expect(onAdvanceWeek).toHaveBeenCalledTimes(1);
  });

  it('should require confirmation before processing year end', async () => {
    const user = userEvent.setup();
    const onProcessYearEnd = vi.fn();
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} onProcessYearEnd={onProcessYearEnd} />);

    await user.click(screen.getByRole('button', { name: /Process Year End/i }));

    expect(onProcessYearEnd).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Confirm Year End/i })).toBeInTheDocument();
  });

  it('should call onProcessYearEnd on confirmation', async () => {
    const user = userEvent.setup();
    const onProcessYearEnd = vi.fn();
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} onProcessYearEnd={onProcessYearEnd} />);

    await user.click(screen.getByRole('button', { name: /Process Year End/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Year End/i }));

    expect(onProcessYearEnd).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when generating', () => {
    render(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} isGenerating={true} />);
    expect(screen.getByRole('button', { name: /Generate Schedule/i })).toBeDisabled();
  });

  it('should disable buttons when advancing', () => {
    render(<CommissionerControls {...defaultProps} isAdvancing={true} />);
    expect(screen.getByRole('button', { name: /Advance Full Week/i })).toBeDisabled();
  });

  it('should disable buttons when processing year end', () => {
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} isProcessingYearEnd={true} />);
    expect(screen.getByRole('button', { name: /Process Year End/i })).toBeDisabled();
  });

  it('should show loading text when generating in confirmation mode', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CommissionerControls {...defaultProps} season={mockNoScheduleSeason} isGenerating={false} />
    );

    await user.click(screen.getByRole('button', { name: /Generate Schedule/i }));
    
    rerender(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} isGenerating={true} />);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('should show loading text when advancing in confirmation mode', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CommissionerControls {...defaultProps} isAdvancing={false} />);

    await user.click(screen.getByRole('button', { name: /Advance Full Week/i }));

    rerender(<CommissionerControls {...defaultProps} isAdvancing={true} />);

    expect(screen.getByText('Simulating...')).toBeInTheDocument();
  });

  it('should handle null season', () => {
    render(<CommissionerControls {...defaultProps} season={null} />);
    expect(screen.getByText('Commissioner Controls')).toBeInTheDocument();
  });

  // Advance by Days tests
  describe('Advance by Days', () => {
    it('should render days input with default value of 7', () => {
      render(<CommissionerControls {...defaultProps} />);
      const input = screen.getByTestId('days-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('7');
    });

    it('should render quick-select buttons', () => {
      render(<CommissionerControls {...defaultProps} />);
      expect(screen.getByTestId('quick-days-1')).toBeInTheDocument();
      expect(screen.getByTestId('quick-days-3')).toBeInTheDocument();
      expect(screen.getByTestId('quick-days-7')).toBeInTheDocument();
    });

    it('should update days input when quick-select button is clicked', async () => {
      const user = userEvent.setup();
      render(<CommissionerControls {...defaultProps} />);

      await user.click(screen.getByTestId('quick-days-1'));
      const input = screen.getByTestId('days-input') as HTMLInputElement;
      expect(input.value).toBe('1');

      await user.click(screen.getByTestId('quick-days-3'));
      expect(input.value).toBe('3');
    });

    it('should require confirmation before advancing by days', async () => {
      const user = userEvent.setup();
      const onAdvanceByDays = vi.fn();
      render(<CommissionerControls {...defaultProps} onAdvanceByDays={onAdvanceByDays} />);

      await user.click(screen.getByTestId('advance-days-button'));

      expect(onAdvanceByDays).not.toHaveBeenCalled();
      expect(screen.getByTestId('advance-days-confirm')).toBeInTheDocument();
    });

    it('should call onAdvanceByDays with correct days on confirmation', async () => {
      const user = userEvent.setup();
      const onAdvanceByDays = vi.fn();
      render(<CommissionerControls {...defaultProps} onAdvanceByDays={onAdvanceByDays} />);

      // Change to 3 days
      await user.click(screen.getByTestId('quick-days-3'));

      // Click advance, then confirm
      await user.click(screen.getByTestId('advance-days-button'));
      await user.click(screen.getByTestId('advance-days-confirm'));

      expect(onAdvanceByDays).toHaveBeenCalledTimes(1);
      expect(onAdvanceByDays).toHaveBeenCalledWith(3);
    });

    it('should show correct button text based on days', async () => {
      const user = userEvent.setup();
      render(<CommissionerControls {...defaultProps} />);

      // Default 7 days
      expect(screen.getByTestId('advance-days-button')).toHaveTextContent('Advance 7 days');

      // Change to 1 day (singular)
      await user.click(screen.getByTestId('quick-days-1'));
      expect(screen.getByTestId('advance-days-button')).toHaveTextContent('Advance 1 day');
    });

    it('should disable days controls when advancing by days', () => {
      render(<CommissionerControls {...defaultProps} isAdvancingByDays={true} />);
      expect(screen.getByTestId('days-input')).toBeDisabled();
      expect(screen.getByTestId('advance-days-button')).toBeDisabled();
    });

    it('should show loading text when advancing by days in confirmation mode', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<CommissionerControls {...defaultProps} isAdvancingByDays={false} />);

      await user.click(screen.getByTestId('advance-days-button'));

      rerender(<CommissionerControls {...defaultProps} isAdvancingByDays={true} />);

      expect(screen.getByTestId('advance-days-confirm')).toHaveTextContent('Simulating...');
    });

    it('should not show advance controls when no schedule exists', () => {
      render(<CommissionerControls {...defaultProps} season={mockNoScheduleSeason} />);
      expect(screen.queryByTestId('advance-days-controls')).not.toBeInTheDocument();
    });

    it('should not show advance controls when season is complete', () => {
      render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} />);
      expect(screen.queryByTestId('advance-days-controls')).not.toBeInTheDocument();
    });
  });
});
