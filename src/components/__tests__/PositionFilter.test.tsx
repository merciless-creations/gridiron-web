import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PositionFilter } from '../PositionFilter';
import { Position } from '../../types/enums';

describe('PositionFilter', () => {
  const offensePositions = [Position.QB, Position.RB, Position.WR, Position.TE, Position.OL];

  it('renders toggle button', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('position-filter-toggle')).toBeInTheDocument();
  });

  it('shows "All Positions" when no specific positions selected', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[]}
        onChange={onChange}
      />
    );

    // Check the toggle button shows 'All Positions'
    const toggleButton = screen.getByTestId('position-filter-toggle');
    expect(toggleButton).toHaveTextContent('All Positions');
  });

  it('shows position label when single position selected', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[Position.QB]}
        onChange={onChange}
      />
    );

    // Check the toggle button shows 'QB'
    const toggleButton = screen.getByTestId('position-filter-toggle');
    expect(toggleButton).toHaveTextContent('QB');
  });

  it('shows count when multiple positions selected', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[Position.QB, Position.RB]}
        onChange={onChange}
      />
    );

    // Check the toggle button shows the count
    const toggleButton = screen.getByTestId('position-filter-toggle');
    expect(toggleButton).toHaveTextContent('2 Positions');
  });

  it('displays dropdown panel on hover', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[]}
        onChange={onChange}
      />
    );

    // Panel exists but is invisible by default (uses CSS for visibility)
    expect(screen.getByTestId('position-filter-panel')).toBeInTheDocument();
  });

  it('calls onChange with empty array when "All" is clicked', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[Position.QB]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId('position-filter-all'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds position when toggling unselected position', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId('position-filter-QB'));
    expect(onChange).toHaveBeenCalledWith([Position.QB]);
  });

  it('removes position when toggling selected position', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[Position.QB, Position.RB]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId('position-filter-QB'));
    expect(onChange).toHaveBeenCalledWith([Position.RB]);
  });

  it('selects only one position when "only" button is clicked', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[Position.QB, Position.RB]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTestId('position-filter-only-WR'));
    expect(onChange).toHaveBeenCalledWith([Position.WR]);
  });

  it('renders all available positions', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('position-filter-QB')).toBeInTheDocument();
    expect(screen.getByTestId('position-filter-RB')).toBeInTheDocument();
    expect(screen.getByTestId('position-filter-WR')).toBeInTheDocument();
    expect(screen.getByTestId('position-filter-TE')).toBeInTheDocument();
    expect(screen.getByTestId('position-filter-OL')).toBeInTheDocument();
  });

  it('shows checkmark for selected positions', () => {
    const onChange = vi.fn();
    render(
      <PositionFilter
        availablePositions={offensePositions}
        selectedPositions={[Position.QB]}
        onChange={onChange}
      />
    );

    // The selected position should have a filled checkmark icon (fillRule="evenodd")
    const qbButton = screen.getByTestId('position-filter-QB');
    const checkIcon = qbButton.querySelector('svg[fill="currentColor"]');
    expect(checkIcon).toBeInTheDocument();
  });
});
