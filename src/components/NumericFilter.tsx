import { useState, useCallback, useRef, useEffect } from 'react';

export interface NumericFilterValue {
  operator: '>' | '<' | '>=' | '<=' | '=' | '<>';
  value: number;
}

interface NumericFilterProps {
  /** Current filter value */
  filter: NumericFilterValue | null;
  /** Called when filter changes */
  onChange: (filter: NumericFilterValue | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Parse a filter expression string into operator and value
 * Supports: >80, <70, >=75, <=60, =50, <>50 (not equal)
 */
export function parseFilterExpression(expression: string): NumericFilterValue | null {
  const trimmed = expression.trim();
  if (!trimmed) return null;

  // Match operators: <>, >=, <=, >, <, =
  const match = trimmed.match(/^(<>|>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const [, op, numStr] = match;
  const value = parseFloat(numStr);
  if (isNaN(value)) return null;

  // Default to = if no operator specified
  const operator = (op || '=') as NumericFilterValue['operator'];

  return { operator, value };
}

/**
 * Format a filter value back to expression string
 */
export function formatFilterExpression(filter: NumericFilterValue | null): string {
  if (!filter) return '';
  // Don't show = prefix for equality
  if (filter.operator === '=') return String(filter.value);
  return `${filter.operator}${filter.value}`;
}

/**
 * Check if a numeric value passes a filter
 */
export function passesFilter(value: number | null | undefined, filter: NumericFilterValue | null): boolean {
  if (!filter) return true;
  if (value === null || value === undefined) return false;

  switch (filter.operator) {
    case '>':
      return value > filter.value;
    case '<':
      return value < filter.value;
    case '>=':
      return value >= filter.value;
    case '<=':
      return value <= filter.value;
    case '=':
      return value === filter.value;
    case '<>':
      return value !== filter.value;
    default:
      return true;
  }
}

/**
 * Inline numeric filter input for grid columns
 */
export function NumericFilter({
  filter,
  onChange,
  placeholder = 'Filter...',
  className = '',
}: NumericFilterProps) {
  const [inputValue, setInputValue] = useState(formatFilterExpression(filter));
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  // Sync input value when filter prop changes externally
  useEffect(() => {
    setInputValue(formatFilterExpression(filter));
  }, [filter]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear previous debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    // Debounce filter updates
    debounceRef.current = window.setTimeout(() => {
      if (!value.trim()) {
        setIsValid(true);
        onChange(null);
        return;
      }

      const parsed = parseFilterExpression(value);
      if (parsed) {
        setIsValid(true);
        onChange(parsed);
      } else {
        setIsValid(false);
      }
    }, 300);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setIsValid(true);
    onChange(null);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full px-2 py-1 text-xs
          bg-gridiron-bg-tertiary border rounded
          focus:outline-none focus:ring-1
          ${isValid
            ? 'border-gridiron-border-subtle focus:ring-gridiron-accent focus:border-gridiron-accent'
            : 'border-red-500 focus:ring-red-500 focus:border-red-500'
          }
          text-gridiron-text-primary placeholder-gridiron-text-muted
        `}
        data-testid="numeric-filter-input"
        aria-label={placeholder}
        aria-invalid={!isValid}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-1 p-0.5 text-gridiron-text-muted hover:text-gridiron-text-primary"
          aria-label="Clear filter"
          data-testid="numeric-filter-clear"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default NumericFilter;
