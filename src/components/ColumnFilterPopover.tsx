import { useState, useCallback, useRef, useEffect } from 'react';
import { Position, PositionLabels, PlayerStatus, PlayerStatusLabels } from '../types/enums';
import type { NumericFilterValue } from '../utils/numericFilter';
import { parseFilterExpression, formatFilterExpression } from '../utils/numericFilter';

interface ColumnFilterPopoverProps {
  /** Column key for identification */
  columnKey: string;
  /** Filter type */
  type: 'numeric' | 'position' | 'status';
  /** Current numeric filter value (for numeric type) */
  numericFilter?: NumericFilterValue | null;
  /** Called when numeric filter changes */
  onNumericFilterChange?: (filter: NumericFilterValue | null) => void;
  /** Current position filter (for position type) */
  positionFilter?: Position[];
  /** Available positions to filter by */
  availablePositions?: Position[];
  /** Called when position filter changes */
  onPositionFilterChange?: (positions: Position[]) => void;
  /** Current status filter (for status type) */
  statusFilter?: PlayerStatus[];
  /** Available statuses to filter by */
  availableStatuses?: PlayerStatus[];
  /** Called when status filter changes */
  onStatusFilterChange?: (statuses: PlayerStatus[]) => void;
  /** Called when popover closes - use for persisting */
  onClose?: () => void;
}

/**
 * Filter icon with popover for column filtering
 * Supports numeric expressions, position multi-select, and status multi-select
 */
export function ColumnFilterPopover({
  columnKey,
  type,
  numericFilter,
  onNumericFilterChange,
  positionFilter = [],
  availablePositions = [],
  onPositionFilterChange,
  statusFilter = [],
  availableStatuses = [],
  onStatusFilterChange,
  onClose,
}: ColumnFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatFilterExpression(numericFilter ?? null));
  const [isValid, setIsValid] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if filter is active
  const isActive = type === 'numeric'
    ? numericFilter !== null && numericFilter !== undefined
    : type === 'position'
    ? positionFilter.length > 0
    : statusFilter.length > 0;

  // Sync input value when filter prop changes externally (e.g., clear all filters button)
  // This is a valid use case for setting state in an effect - syncing state from props
  useEffect(() => {
    if (type === 'numeric') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(formatFilterExpression(numericFilter ?? null));
    }
  }, [numericFilter, type]);

  // Helper to close popover and notify parent
  const closePopover = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && type === 'numeric' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, type]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closePopover]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopover();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePopover]);

  // Update input value locally without applying filter
  const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Validate but don't apply yet
    if (!value.trim()) {
      setIsValid(true);
    } else {
      const parsed = parseFilterExpression(value);
      setIsValid(parsed !== null);
    }
  }, []);

  // Apply filter on Enter or blur
  const applyNumericFilter = useCallback(() => {
    if (!inputValue.trim()) {
      onNumericFilterChange?.(null);
      return;
    }

    const parsed = parseFilterExpression(inputValue);
    if (parsed) {
      onNumericFilterChange?.(parsed);
    }
  }, [inputValue, onNumericFilterChange]);

  const handleNumericKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyNumericFilter();
    }
  }, [applyNumericFilter]);

  const handleNumericBlur = useCallback(() => {
    applyNumericFilter();
  }, [applyNumericFilter]);

  const handleClearNumeric = useCallback(() => {
    setInputValue('');
    setIsValid(true);
    onNumericFilterChange?.(null);
    closePopover();
  }, [onNumericFilterChange, closePopover]);

  const handleTogglePosition = useCallback((position: Position) => {
    if (positionFilter.includes(position)) {
      onPositionFilterChange?.(positionFilter.filter(p => p !== position));
    } else {
      onPositionFilterChange?.([...positionFilter, position]);
    }
  }, [positionFilter, onPositionFilterChange]);

  const handleClearPositions = useCallback(() => {
    onPositionFilterChange?.([]);
    closePopover();
  }, [onPositionFilterChange, closePopover]);

  const handleSelectAllPositions = useCallback(() => {
    onPositionFilterChange?.([]);
  }, [onPositionFilterChange]);

  const handleToggleStatus = useCallback((status: PlayerStatus) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange?.(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange?.([...statusFilter, status]);
    }
  }, [statusFilter, onStatusFilterChange]);

  const handleClearStatuses = useCallback(() => {
    onStatusFilterChange?.([]);
    closePopover();
  }, [onStatusFilterChange, closePopover]);

  const handleSelectAllStatuses = useCallback(() => {
    onStatusFilterChange?.([]);
  }, [onStatusFilterChange]);

  return (
    <div className="relative inline-flex" ref={popoverRef}>
      {/* Filter icon button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`relative p-0.5 rounded transition-colors ${
          isActive
            ? 'text-gridiron-accent'
            : 'text-gridiron-text-muted hover:text-gridiron-text-secondary'
        }`}
        aria-label={`Filter ${columnKey}${isActive ? ' (active)' : ''}`}
        aria-expanded={isOpen}
        data-testid={`column-filter-${columnKey}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {/* Active filter indicator dot */}
        {isActive && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gridiron-accent rounded-full border border-gridiron-bg-card"
            data-testid={`column-filter-active-${columnKey}`}
          />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-30 bg-gridiron-bg-card border border-gridiron-border-subtle rounded-lg shadow-xl min-w-[160px]"
          data-testid={`column-filter-popover-${columnKey}`}
        >
          {type === 'numeric' && (
            <div className="p-2">
              <div className="text-xs text-gridiron-text-muted mb-2">
                e.g. &gt;80, &lt;70, &gt;=75, &lt;&gt;50
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleNumericChange}
                onKeyDown={handleNumericKeyDown}
                onBlur={handleNumericBlur}
                placeholder="Enter filter..."
                className={`w-full px-2 py-1.5 text-sm bg-gridiron-bg-tertiary border rounded focus:outline-none focus:ring-1 ${
                  isValid
                    ? 'border-gridiron-border-subtle focus:ring-gridiron-accent focus:border-gridiron-accent'
                    : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                } text-gridiron-text-primary placeholder-gridiron-text-muted`}
                data-testid={`column-filter-input-${columnKey}`}
              />
              {isActive && (
                <button
                  onClick={handleClearNumeric}
                  className="mt-2 w-full px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  data-testid={`column-filter-clear-${columnKey}`}
                >
                  Clear filter
                </button>
              )}
            </div>
          )}

          {type === 'position' && (
            <div className="p-2 max-h-64 overflow-y-auto">
              {/* Select All / Clear */}
              <button
                onClick={handleSelectAllPositions}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  positionFilter.length === 0
                    ? 'bg-gridiron-accent/20 text-gridiron-accent'
                    : 'hover:bg-gridiron-bg-tertiary text-gridiron-text-secondary hover:text-gridiron-text-primary'
                }`}
                data-testid={`column-filter-all-${columnKey}`}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {positionFilter.length === 0 && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                All
              </button>

              <div className="my-1 border-t border-gridiron-border-subtle" />

              {/* Position options */}
              {availablePositions.map(position => {
                const isSelected = positionFilter.includes(position);
                return (
                  <button
                    key={position}
                    onClick={() => handleTogglePosition(position)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                      isSelected
                        ? 'bg-gridiron-accent/20 text-gridiron-accent'
                        : 'hover:bg-gridiron-bg-tertiary text-gridiron-text-secondary hover:text-gridiron-text-primary'
                    }`}
                    data-testid={`column-filter-pos-${PositionLabels[position]}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {isSelected && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    {PositionLabels[position]}
                  </button>
                );
              })}

              {isActive && (
                <>
                  <div className="my-1 border-t border-gridiron-border-subtle" />
                  <button
                    onClick={handleClearPositions}
                    className="w-full px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    data-testid={`column-filter-clear-${columnKey}`}
                  >
                    Clear filter
                  </button>
                </>
              )}
            </div>
          )}

          {type === 'status' && (
            <div className="p-2 max-h-64 overflow-y-auto">
              {/* Select All / Clear */}
              <button
                onClick={handleSelectAllStatuses}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  statusFilter.length === 0
                    ? 'bg-gridiron-accent/20 text-gridiron-accent'
                    : 'hover:bg-gridiron-bg-tertiary text-gridiron-text-secondary hover:text-gridiron-text-primary'
                }`}
                data-testid={`column-filter-all-${columnKey}`}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {statusFilter.length === 0 && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                All
              </button>

              <div className="my-1 border-t border-gridiron-border-subtle" />

              {/* Status options */}
              {availableStatuses.map(status => {
                const isSelected = statusFilter.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => handleToggleStatus(status)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                      isSelected
                        ? 'bg-gridiron-accent/20 text-gridiron-accent'
                        : 'hover:bg-gridiron-bg-tertiary text-gridiron-text-secondary hover:text-gridiron-text-primary'
                    }`}
                    data-testid={`column-filter-status-${PlayerStatusLabels[status]}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {isSelected && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    {PlayerStatusLabels[status]}
                  </button>
                );
              })}

              {isActive && (
                <>
                  <div className="my-1 border-t border-gridiron-border-subtle" />
                  <button
                    onClick={handleClearStatuses}
                    className="w-full px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    data-testid={`column-filter-clear-${columnKey}`}
                  >
                    Clear filter
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ColumnFilterPopover;
