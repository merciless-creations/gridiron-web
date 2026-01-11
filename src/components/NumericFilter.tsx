import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type NumericFilterValue,
  parseFilterExpression,
  formatFilterExpression,
} from '../utils/numericFilter';

// Re-export types for backwards compatibility (types don't break fast refresh)
export type { NumericFilterValue } from '../utils/numericFilter';

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
