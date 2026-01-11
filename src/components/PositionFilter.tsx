import { useCallback } from 'react';
import { Position, PositionLabels } from '../types/enums';

interface PositionFilterProps {
  /** Available positions to filter by */
  availablePositions: Position[];
  /** Currently selected positions (empty = all) */
  selectedPositions: Position[];
  /** Called when selection changes */
  onChange: (positions: Position[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Dropdown filter for selecting positions
 * Supports multi-select with "All" option
 */
export function PositionFilter({
  availablePositions,
  selectedPositions,
  onChange,
  className = '',
}: PositionFilterProps) {
  const allSelected = selectedPositions.length === 0;

  const handleSelectAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleTogglePosition = useCallback((position: Position) => {
    if (selectedPositions.includes(position)) {
      // Remove position
      const newSelection = selectedPositions.filter(p => p !== position);
      onChange(newSelection);
    } else {
      // Add position
      onChange([...selectedPositions, position]);
    }
  }, [selectedPositions, onChange]);

  const handleSelectOnly = useCallback((position: Position) => {
    onChange([position]);
  }, [onChange]);

  // Get display text for the button
  const getButtonText = () => {
    if (allSelected) return 'All Positions';
    if (selectedPositions.length === 1) {
      return PositionLabels[selectedPositions[0]];
    }
    return `${selectedPositions.length} Positions`;
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary bg-gridiron-bg-tertiary hover:bg-gridiron-border-emphasis rounded-lg transition-colors"
        data-testid="position-filter-toggle"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>{getButtonText()}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel - shows on hover */}
      <div
        className="absolute left-0 mt-1 w-48 bg-gridiron-bg-card border border-gridiron-border-subtle rounded-lg shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
        data-testid="position-filter-panel"
      >
        <div className="p-2">
          {/* All option */}
          <button
            onClick={handleSelectAll}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              allSelected
                ? 'bg-gridiron-accent/20 text-gridiron-accent'
                : 'hover:bg-gridiron-bg-tertiary text-gridiron-text-secondary hover:text-gridiron-text-primary'
            }`}
            data-testid="position-filter-all"
          >
            {allSelected ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
              </svg>
            )}
            <span>All Positions</span>
          </button>

          <div className="my-1 border-t border-gridiron-border-subtle" />

          {/* Position options */}
          {availablePositions.map(position => {
            const isSelected = selectedPositions.includes(position);
            return (
              <div
                key={position}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isSelected
                    ? 'bg-gridiron-accent/20 text-gridiron-accent'
                    : 'hover:bg-gridiron-bg-tertiary text-gridiron-text-secondary hover:text-gridiron-text-primary'
                }`}
              >
                <button
                  onClick={() => handleTogglePosition(position)}
                  className="flex items-center gap-2 flex-1"
                  data-testid={`position-filter-${PositionLabels[position]}`}
                >
                  {isSelected ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    </svg>
                  )}
                  <span>{PositionLabels[position]}</span>
                </button>
                <button
                  onClick={() => handleSelectOnly(position)}
                  className="text-xs text-gridiron-text-muted hover:text-gridiron-accent px-1"
                  title={`Show only ${PositionLabels[position]}`}
                  data-testid={`position-filter-only-${PositionLabels[position]}`}
                >
                  only
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PositionFilter;
