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
    onProcessYearEnd: vi.fn(),
    isGenerating: false,
    isAdvancing: false,
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

  it('should show Advance Week button when schedule exists and season not complete', () => {
    render(<CommissionerControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Advance Week/i })).toBeInTheDocument();
  });

  it('should show Process Year End button when season is complete', () => {
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} />);
    expect(screen.getByRole('button', { name: /Process Year End/i })).toBeInTheDocument();
  });

  it('should not show Advance Week when season is complete', () => {
    render(<CommissionerControls {...defaultProps} season={mockCompleteSeason} />);
    expect(screen.queryByRole('button', { name: /Advance Week/i })).not.toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: /Advance Week/i }));

    expect(onAdvanceWeek).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Confirm Advance/i })).toBeInTheDocument();
  });

  it('should call onAdvanceWeek on confirmation', async () => {
    const user = userEvent.setup();
    const onAdvanceWeek = vi.fn();
    render(<CommissionerControls {...defaultProps} onAdvanceWeek={onAdvanceWeek} />);

    await user.click(screen.getByRole('button', { name: /Advance Week/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Advance/i }));

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
    expect(screen.getByRole('button', { name: /Advance Week/i })).toBeDisabled();
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

    await user.click(screen.getByRole('button', { name: /Advance Week/i }));
    
    rerender(<CommissionerControls {...defaultProps} isAdvancing={true} />);

    expect(screen.getByText('Simulating...')).toBeInTheDocument();
  });

  it('should handle null season', () => {
    render(<CommissionerControls {...defaultProps} season={null} />);
    expect(screen.getByText('Commissioner Controls')).toBeInTheDocument();
  });
});
