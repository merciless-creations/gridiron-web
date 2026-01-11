import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnFilterPopover } from '../ColumnFilterPopover';
import { Position } from '../../types/enums';

describe('ColumnFilterPopover', () => {
  describe('Filter icon button', () => {
    it('renders filter icon button', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('column-filter-age')).toBeInTheDocument();
    });

    it('shows inactive state when no filter applied', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      const button = screen.getByTestId('column-filter-age');
      expect(button).toHaveClass('text-gridiron-text-muted');
    });

    it('shows active state when filter is applied (numeric)', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={{ operator: '>', value: 25 }}
          onNumericFilterChange={vi.fn()}
        />
      );

      const button = screen.getByTestId('column-filter-age');
      expect(button).toHaveClass('text-gridiron-accent');
    });

    it('shows indicator dot when filter is active', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={{ operator: '>', value: 25 }}
          onNumericFilterChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('column-filter-active-age')).toBeInTheDocument();
    });

    it('does not show indicator dot when no filter applied', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      expect(screen.queryByTestId('column-filter-active-age')).not.toBeInTheDocument();
    });

    it('shows active state when filter is applied (position)', () => {
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[Position.QB]}
          availablePositions={[Position.QB, Position.RB, Position.WR]}
          onPositionFilterChange={vi.fn()}
        />
      );

      const button = screen.getByTestId('column-filter-position');
      expect(button).toHaveClass('text-gridiron-accent');
    });

    it('toggles popover on click', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      const button = screen.getByTestId('column-filter-age');

      // Initially closed
      expect(screen.queryByTestId('column-filter-popover-age')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(button);
      expect(screen.getByTestId('column-filter-popover-age')).toBeInTheDocument();

      // Click to close
      fireEvent.click(button);
      expect(screen.queryByTestId('column-filter-popover-age')).not.toBeInTheDocument();
    });
  });

  describe('Numeric filter popover', () => {
    it('renders input field', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      expect(screen.getByTestId('column-filter-input-age')).toBeInTheDocument();
    });

    it('shows help text with examples', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      expect(screen.getByText(/e\.g\./i)).toBeInTheDocument();
    });

    it('does not call onNumericFilterChange while typing (deferred)', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      const input = screen.getByTestId('column-filter-input-age');
      fireEvent.change(input, { target: { value: '>25' } });

      // Should NOT be called while typing - only on Enter or blur
      expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onNumericFilterChange on Enter key', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      const input = screen.getByTestId('column-filter-input-age');
      fireEvent.change(input, { target: { value: '>25' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith({ operator: '>', value: 25 });
    });

    it('calls onNumericFilterChange on blur', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      const input = screen.getByTestId('column-filter-input-age');
      fireEvent.change(input, { target: { value: '<30' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith({ operator: '<', value: 30 });
    });

    it('shows clear button when filter is active', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={{ operator: '>', value: 25 }}
          onNumericFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      expect(screen.getByTestId('column-filter-clear-age')).toBeInTheDocument();
    });

    it('clears filter and closes popover when clear button clicked', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={{ operator: '>', value: 25 }}
          onNumericFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      fireEvent.click(screen.getByTestId('column-filter-clear-age'));

      expect(onChange).toHaveBeenCalledWith(null);
      expect(screen.queryByTestId('column-filter-popover-age')).not.toBeInTheDocument();
    });
  });

  describe('Position filter popover', () => {
    const positions = [Position.QB, Position.RB, Position.WR, Position.TE, Position.OL];

    it('renders all available positions', () => {
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[]}
          availablePositions={positions}
          onPositionFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-position'));

      expect(screen.getByTestId('column-filter-pos-QB')).toBeInTheDocument();
      expect(screen.getByTestId('column-filter-pos-RB')).toBeInTheDocument();
      expect(screen.getByTestId('column-filter-pos-WR')).toBeInTheDocument();
    });

    it('shows "All" option', () => {
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[]}
          availablePositions={positions}
          onPositionFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-position'));
      expect(screen.getByTestId('column-filter-all-position')).toBeInTheDocument();
    });

    it('toggles position when clicked', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[]}
          availablePositions={positions}
          onPositionFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-position'));
      fireEvent.click(screen.getByTestId('column-filter-pos-QB'));

      expect(onChange).toHaveBeenCalledWith([Position.QB]);
    });

    it('removes position when clicking selected position', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[Position.QB, Position.RB]}
          availablePositions={positions}
          onPositionFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-position'));
      fireEvent.click(screen.getByTestId('column-filter-pos-QB'));

      expect(onChange).toHaveBeenCalledWith([Position.RB]);
    });

    it('clears all positions when "All" is clicked', () => {
      const onChange = vi.fn();
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[Position.QB]}
          availablePositions={positions}
          onPositionFilterChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-position'));
      fireEvent.click(screen.getByTestId('column-filter-all-position'));

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('shows clear button when filter is active', () => {
      render(
        <ColumnFilterPopover
          columnKey="position"
          type="position"
          positionFilter={[Position.QB]}
          availablePositions={positions}
          onPositionFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-position'));
      expect(screen.getByTestId('column-filter-clear-position')).toBeInTheDocument();
    });
  });

  describe('Keyboard and click-outside handling', () => {
    it('closes popover on Escape key', () => {
      render(
        <ColumnFilterPopover
          columnKey="age"
          type="numeric"
          numericFilter={null}
          onNumericFilterChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('column-filter-age'));
      expect(screen.getByTestId('column-filter-popover-age')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('column-filter-popover-age')).not.toBeInTheDocument();
    });
  });
});
