import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NumericFilter, parseFilterExpression, formatFilterExpression, passesFilter } from '../NumericFilter';
import type { NumericFilterValue } from '../NumericFilter';

describe('NumericFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('parseFilterExpression', () => {
    it('parses greater than expressions', () => {
      expect(parseFilterExpression('>80')).toEqual({ operator: '>', value: 80 });
      expect(parseFilterExpression('> 80')).toEqual({ operator: '>', value: 80 });
    });

    it('parses less than expressions', () => {
      expect(parseFilterExpression('<70')).toEqual({ operator: '<', value: 70 });
      expect(parseFilterExpression('< 70')).toEqual({ operator: '<', value: 70 });
    });

    it('parses greater than or equal expressions', () => {
      expect(parseFilterExpression('>=75')).toEqual({ operator: '>=', value: 75 });
      expect(parseFilterExpression('>= 75')).toEqual({ operator: '>=', value: 75 });
    });

    it('parses less than or equal expressions', () => {
      expect(parseFilterExpression('<=60')).toEqual({ operator: '<=', value: 60 });
      expect(parseFilterExpression('<= 60')).toEqual({ operator: '<=', value: 60 });
    });

    it('parses equality expressions', () => {
      expect(parseFilterExpression('=50')).toEqual({ operator: '=', value: 50 });
      expect(parseFilterExpression('= 50')).toEqual({ operator: '=', value: 50 });
    });

    it('parses not equal expressions', () => {
      expect(parseFilterExpression('<>30')).toEqual({ operator: '<>', value: 30 });
      expect(parseFilterExpression('<> 30')).toEqual({ operator: '<>', value: 30 });
    });

    it('defaults to equality for plain numbers', () => {
      expect(parseFilterExpression('50')).toEqual({ operator: '=', value: 50 });
      expect(parseFilterExpression(' 50 ')).toEqual({ operator: '=', value: 50 });
    });

    it('handles negative numbers', () => {
      expect(parseFilterExpression('>-10')).toEqual({ operator: '>', value: -10 });
      expect(parseFilterExpression('<=-5')).toEqual({ operator: '<=', value: -5 });
    });

    it('handles decimal numbers', () => {
      expect(parseFilterExpression('>80.5')).toEqual({ operator: '>', value: 80.5 });
      expect(parseFilterExpression('<=3.14')).toEqual({ operator: '<=', value: 3.14 });
    });

    it('returns null for invalid expressions', () => {
      expect(parseFilterExpression('')).toBeNull();
      expect(parseFilterExpression('  ')).toBeNull();
      expect(parseFilterExpression('abc')).toBeNull();
      expect(parseFilterExpression('>>50')).toBeNull();
      expect(parseFilterExpression('!50')).toBeNull();
    });
  });

  describe('formatFilterExpression', () => {
    it('formats filter values to strings', () => {
      expect(formatFilterExpression({ operator: '>', value: 80 })).toBe('>80');
      expect(formatFilterExpression({ operator: '<', value: 70 })).toBe('<70');
      expect(formatFilterExpression({ operator: '>=', value: 75 })).toBe('>=75');
      expect(formatFilterExpression({ operator: '<=', value: 60 })).toBe('<=60');
      expect(formatFilterExpression({ operator: '<>', value: 30 })).toBe('<>30');
    });

    it('omits = operator for equality', () => {
      expect(formatFilterExpression({ operator: '=', value: 50 })).toBe('50');
    });

    it('returns empty string for null', () => {
      expect(formatFilterExpression(null)).toBe('');
    });
  });

  describe('passesFilter', () => {
    it('passes all values when filter is null', () => {
      expect(passesFilter(50, null)).toBe(true);
      expect(passesFilter(0, null)).toBe(true);
      expect(passesFilter(null, null)).toBe(true);
    });

    it('handles greater than comparisons', () => {
      const filter: NumericFilterValue = { operator: '>', value: 80 };
      expect(passesFilter(85, filter)).toBe(true);
      expect(passesFilter(80, filter)).toBe(false);
      expect(passesFilter(75, filter)).toBe(false);
    });

    it('handles less than comparisons', () => {
      const filter: NumericFilterValue = { operator: '<', value: 70 };
      expect(passesFilter(65, filter)).toBe(true);
      expect(passesFilter(70, filter)).toBe(false);
      expect(passesFilter(75, filter)).toBe(false);
    });

    it('handles greater than or equal comparisons', () => {
      const filter: NumericFilterValue = { operator: '>=', value: 75 };
      expect(passesFilter(80, filter)).toBe(true);
      expect(passesFilter(75, filter)).toBe(true);
      expect(passesFilter(70, filter)).toBe(false);
    });

    it('handles less than or equal comparisons', () => {
      const filter: NumericFilterValue = { operator: '<=', value: 60 };
      expect(passesFilter(55, filter)).toBe(true);
      expect(passesFilter(60, filter)).toBe(true);
      expect(passesFilter(65, filter)).toBe(false);
    });

    it('handles equality comparisons', () => {
      const filter: NumericFilterValue = { operator: '=', value: 50 };
      expect(passesFilter(50, filter)).toBe(true);
      expect(passesFilter(49, filter)).toBe(false);
      expect(passesFilter(51, filter)).toBe(false);
    });

    it('handles not equal comparisons', () => {
      const filter: NumericFilterValue = { operator: '<>', value: 30 };
      expect(passesFilter(30, filter)).toBe(false);
      expect(passesFilter(29, filter)).toBe(true);
      expect(passesFilter(31, filter)).toBe(true);
    });

    it('returns false for null/undefined values when filter is set', () => {
      const filter: NumericFilterValue = { operator: '>', value: 0 };
      expect(passesFilter(null, filter)).toBe(false);
      expect(passesFilter(undefined, filter)).toBe(false);
    });
  });

  describe('NumericFilter component', () => {
    it('renders with placeholder', () => {
      const onChange = vi.fn();
      render(<NumericFilter filter={null} onChange={onChange} placeholder="Filter..." />);

      const input = screen.getByTestId('numeric-filter-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Filter...');
    });

    it('displays current filter value', () => {
      const onChange = vi.fn();
      render(
        <NumericFilter
          filter={{ operator: '>', value: 80 }}
          onChange={onChange}
        />
      );

      const input = screen.getByTestId('numeric-filter-input');
      expect(input).toHaveValue('>80');
    });

    it('calls onChange after debounce when typing valid expression', async () => {
      const onChange = vi.fn();
      render(<NumericFilter filter={null} onChange={onChange} />);

      const input = screen.getByTestId('numeric-filter-input');
      fireEvent.change(input, { target: { value: '>80' } });

      // Should not call immediately
      expect(onChange).not.toHaveBeenCalled();

      // Fast forward debounce timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onChange).toHaveBeenCalledWith({ operator: '>', value: 80 });
    });

    it('shows clear button when input has value', () => {
      const onChange = vi.fn();
      render(
        <NumericFilter
          filter={{ operator: '>', value: 80 }}
          onChange={onChange}
        />
      );

      expect(screen.getByTestId('numeric-filter-clear')).toBeInTheDocument();
    });

    it('hides clear button when input is empty', () => {
      const onChange = vi.fn();
      render(<NumericFilter filter={null} onChange={onChange} />);

      expect(screen.queryByTestId('numeric-filter-clear')).not.toBeInTheDocument();
    });

    it('clears filter when clear button is clicked', () => {
      const onChange = vi.fn();
      render(
        <NumericFilter
          filter={{ operator: '>', value: 80 }}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('numeric-filter-clear'));

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('clears filter when Escape is pressed', () => {
      const onChange = vi.fn();
      render(
        <NumericFilter
          filter={{ operator: '>', value: 80 }}
          onChange={onChange}
        />
      );

      const input = screen.getByTestId('numeric-filter-input');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('shows error state for invalid expression', () => {
      const onChange = vi.fn();
      render(<NumericFilter filter={null} onChange={onChange} />);

      const input = screen.getByTestId('numeric-filter-input');
      fireEvent.change(input, { target: { value: 'invalid' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('calls onChange with null when input is cleared by typing', () => {
      const onChange = vi.fn();
      render(
        <NumericFilter
          filter={{ operator: '>', value: 80 }}
          onChange={onChange}
        />
      );

      const input = screen.getByTestId('numeric-filter-input');
      fireEvent.change(input, { target: { value: '' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});
