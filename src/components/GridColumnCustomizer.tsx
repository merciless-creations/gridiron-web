import { useState, useCallback, useEffect } from 'react';
import { usePreferences } from '../contexts';

interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible?: boolean;
}

interface GridColumnCustomizerProps {
  /** Which grid these settings apply to */
  gridKey: 'roster' | 'depthChart' | 'standings';
  /** Available column definitions */
  columns: ColumnDefinition[];
  /** Callback when columns change (for immediate UI updates) */
  onChange?: (columns: string[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for customizing which columns are visible in a grid
 */
export function GridColumnCustomizer({
  gridKey,
  columns,
  onChange,
  className = '',
}: GridColumnCustomizerProps) {
  const { preferences, setGridPreferences, isSaving } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);

  // Get current column visibility from preferences
  const gridPrefs = preferences.grids?.[gridKey];
  const visibleColumns = gridPrefs?.columns ?? columns.filter(c => c.defaultVisible !== false).map(c => c.key);

  // Track local state for optimistic updates
  const [localColumns, setLocalColumns] = useState<string[]>(visibleColumns);

  // Sync local state when preferences change
  useEffect(() => {
    setLocalColumns(visibleColumns);
  }, [visibleColumns.join(',')]);

  const toggleColumn = useCallback((columnKey: string) => {
    setLocalColumns(prev => {
      const isVisible = prev.includes(columnKey);
      const newColumns = isVisible
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey];

      // Call onChange for immediate UI feedback
      onChange?.(newColumns);

      // Persist to preferences
      setGridPreferences(gridKey, { columns: newColumns });

      return newColumns;
    });
  }, [gridKey, onChange, setGridPreferences]);

  const moveColumn = useCallback((columnKey: string, direction: 'up' | 'down') => {
    setLocalColumns(prev => {
      const index = prev.indexOf(columnKey);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newColumns = [...prev];
      [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];

      // Call onChange for immediate UI feedback
      onChange?.(newColumns);

      // Persist to preferences
      setGridPreferences(gridKey, { columns: newColumns });

      return newColumns;
    });
  }, [gridKey, onChange, setGridPreferences]);

  const resetToDefaults = useCallback(() => {
    const defaultColumns = columns.filter(c => c.defaultVisible !== false).map(c => c.key);
    setLocalColumns(defaultColumns);
    onChange?.(defaultColumns);
    setGridPreferences(gridKey, { columns: defaultColumns });
  }, [columns, gridKey, onChange, setGridPreferences]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary bg-gridiron-bg-tertiary hover:bg-gridiron-border-emphasis rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid="column-customizer-toggle"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span>Columns</span>
        {isSaving && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown panel */}
          <div
            className="absolute right-0 mt-2 w-72 bg-gridiron-bg-card border border-gridiron-border-subtle rounded-lg shadow-xl z-20"
            role="dialog"
            aria-label="Column settings"
            data-testid="column-customizer-panel"
          >
            <div className="p-3 border-b border-gridiron-border-subtle">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gridiron-text-primary">Visible Columns</h3>
                <button
                  onClick={resetToDefaults}
                  className="text-xs text-gridiron-accent hover:underline"
                  data-testid="reset-columns"
                >
                  Reset to defaults
                </button>
              </div>
              <p className="text-xs text-gridiron-text-muted mt-1">
                Drag to reorder, click to toggle visibility
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {columns.map((column) => {
                const isVisible = localColumns.includes(column.key);
                const visibleIndex = localColumns.indexOf(column.key);

                return (
                  <div
                    key={column.key}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md
                      ${isVisible ? 'bg-gridiron-bg-tertiary' : 'opacity-50'}
                    `}
                    data-testid={`column-item-${column.key}`}
                  >
                    {/* Visibility toggle */}
                    <button
                      onClick={() => toggleColumn(column.key)}
                      className="flex-shrink-0"
                      aria-label={`${isVisible ? 'Hide' : 'Show'} ${column.label} column`}
                      data-testid={`column-toggle-${column.key}`}
                    >
                      {isVisible ? (
                        <svg className="w-5 h-5 text-gridiron-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gridiron-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        </svg>
                      )}
                    </button>

                    {/* Column label */}
                    <span className="flex-1 text-sm text-gridiron-text-primary">
                      {column.label}
                    </span>

                    {/* Reorder buttons (only for visible columns) */}
                    {isVisible && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveColumn(column.key, 'up')}
                          disabled={visibleIndex === 0}
                          className="p-1 text-gridiron-text-muted hover:text-gridiron-text-primary disabled:opacity-30"
                          aria-label={`Move ${column.label} up`}
                          data-testid={`column-up-${column.key}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveColumn(column.key, 'down')}
                          disabled={visibleIndex === localColumns.length - 1}
                          className="p-1 text-gridiron-text-muted hover:text-gridiron-text-primary disabled:opacity-30"
                          aria-label={`Move ${column.label} down`}
                          data-testid={`column-down-${column.key}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GridColumnCustomizer;
