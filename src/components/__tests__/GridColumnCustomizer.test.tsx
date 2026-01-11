import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GridColumnCustomizer } from '../GridColumnCustomizer';

// Mock the usePreferences hook
const mockSetGridPreferences = vi.fn();
const mockPreferences = {
  grids: {
    roster: {
      columns: ['name', 'position', 'overall'],
      sortColumn: 'overall',
      sortDirection: 'desc' as const,
    },
  },
};

vi.mock('../../contexts', () => ({
  usePreferences: () => ({
    preferences: mockPreferences,
    setGridPreferences: mockSetGridPreferences,
    isSaving: false,
  }),
}));

const testColumns = [
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'position', label: 'Position', defaultVisible: true },
  { key: 'overall', label: 'Overall', defaultVisible: true },
  { key: 'age', label: 'Age', defaultVisible: false },
  { key: 'salary', label: 'Salary', defaultVisible: true },
];

describe('GridColumnCustomizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreferences.grids.roster.columns = ['name', 'position', 'overall'];
  });

  describe('Toggle Button', () => {
    it('renders toggle button', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      expect(screen.getByTestId('column-customizer-toggle')).toBeInTheDocument();
      expect(screen.getByText('Columns')).toBeInTheDocument();
    });

    it('opens panel when clicked', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      const toggle = screen.getByTestId('column-customizer-toggle');
      fireEvent.click(toggle);

      expect(screen.getByTestId('column-customizer-panel')).toBeInTheDocument();
    });

    it('closes panel when backdrop is clicked', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      // Open panel
      fireEvent.click(screen.getByTestId('column-customizer-toggle'));
      expect(screen.getByTestId('column-customizer-panel')).toBeInTheDocument();

      // Click backdrop (fixed element that covers the screen)
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Panel should be closed
      expect(screen.queryByTestId('column-customizer-panel')).not.toBeInTheDocument();
    });
  });

  describe('Column List', () => {
    it('shows all columns in the panel', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      testColumns.forEach(column => {
        expect(screen.getByTestId(`column-item-${column.key}`)).toBeInTheDocument();
        expect(screen.getByText(column.label)).toBeInTheDocument();
      });
    });

    it('shows visible columns with checkmarks', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Visible columns should have a toggle button
      expect(screen.getByTestId('column-toggle-name')).toBeInTheDocument();
      expect(screen.getByTestId('column-toggle-position')).toBeInTheDocument();
      expect(screen.getByTestId('column-toggle-overall')).toBeInTheDocument();
    });
  });

  describe('Column Toggle', () => {
    it('toggles column visibility', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Toggle off the 'name' column
      fireEvent.click(screen.getByTestId('column-toggle-name'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('roster', {
          columns: ['position', 'overall'],
        });
      });

      expect(onChange).toHaveBeenCalledWith(['position', 'overall']);
    });

    it('adds hidden column when toggled', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Toggle on the 'age' column (currently hidden)
      fireEvent.click(screen.getByTestId('column-toggle-age'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('roster', {
          columns: ['name', 'position', 'overall', 'age'],
        });
      });

      expect(onChange).toHaveBeenCalledWith(['name', 'position', 'overall', 'age']);
    });
  });

  describe('Column Reorder', () => {
    it('moves column up', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Move 'position' up (it's at index 1)
      fireEvent.click(screen.getByTestId('column-up-position'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('roster', {
          columns: ['position', 'name', 'overall'],
        });
      });

      expect(onChange).toHaveBeenCalledWith(['position', 'name', 'overall']);
    });

    it('moves column down', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Move 'position' down (it's at index 1)
      fireEvent.click(screen.getByTestId('column-down-position'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('roster', {
          columns: ['name', 'overall', 'position'],
        });
      });

      expect(onChange).toHaveBeenCalledWith(['name', 'overall', 'position']);
    });

    it('disables up button for first column', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // First column's up button should be disabled
      const upButton = screen.getByTestId('column-up-name');
      expect(upButton).toBeDisabled();
    });

    it('disables down button for last column', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Last column's down button should be disabled
      const downButton = screen.getByTestId('column-down-overall');
      expect(downButton).toBeDisabled();
    });
  });

  describe('Reset to Defaults', () => {
    it('resets columns to defaults', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Click reset button
      fireEvent.click(screen.getByTestId('reset-columns'));

      // Should reset to columns with defaultVisible: true
      const defaultColumns = testColumns
        .filter(c => c.defaultVisible !== false)
        .map(c => c.key);

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('roster', {
          columns: defaultColumns,
        });
      });

      expect(onChange).toHaveBeenCalledWith(defaultColumns);
    });
  });

  describe('Different Grid Keys', () => {
    it('works with depthChart grid', async () => {
      mockPreferences.grids = {
        ...mockPreferences.grids,
        depthChart: {
          columns: ['name', 'rating'],
        },
      } as typeof mockPreferences.grids;

      render(
        <GridColumnCustomizer
          gridKey="depthChart"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'rating', label: 'Rating' },
          ]}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Toggle name column
      fireEvent.click(screen.getByTestId('column-toggle-name'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('depthChart', {
          columns: ['rating'],
        });
      });
    });

    it('works with rosterAll grid', async () => {
      mockPreferences.grids = {
        ...mockPreferences.grids,
        rosterAll: {
          columns: ['name', 'position', 'speed'],
        },
      } as typeof mockPreferences.grids;

      render(
        <GridColumnCustomizer
          gridKey="rosterAll"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'position', label: 'Position' },
            { key: 'speed', label: 'Speed' },
          ]}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Toggle position column
      fireEvent.click(screen.getByTestId('column-toggle-position'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledWith('rosterAll', {
          columns: ['name', 'speed'],
        });
      });
    });

    it('works with rosterOffense grid', async () => {
      mockPreferences.grids = {
        ...mockPreferences.grids,
        rosterOffense: {
          columns: ['name', 'passing', 'catching'],
        },
      } as typeof mockPreferences.grids;

      render(
        <GridColumnCustomizer
          gridKey="rosterOffense"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'passing', label: 'Passing' },
            { key: 'catching', label: 'Catching' },
          ]}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      expect(screen.getByTestId('column-item-passing')).toBeInTheDocument();
      expect(screen.getByTestId('column-item-catching')).toBeInTheDocument();
    });

    it('works with rosterDefense grid', async () => {
      mockPreferences.grids = {
        ...mockPreferences.grids,
        rosterDefense: {
          columns: ['name', 'tackling', 'coverage'],
        },
      } as typeof mockPreferences.grids;

      render(
        <GridColumnCustomizer
          gridKey="rosterDefense"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'tackling', label: 'Tackling' },
            { key: 'coverage', label: 'Coverage' },
          ]}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      expect(screen.getByTestId('column-item-tackling')).toBeInTheDocument();
      expect(screen.getByTestId('column-item-coverage')).toBeInTheDocument();
    });

    it('works with rosterSpecialTeams grid', async () => {
      mockPreferences.grids = {
        ...mockPreferences.grids,
        rosterSpecialTeams: {
          columns: ['name', 'kicking'],
        },
      } as typeof mockPreferences.grids;

      render(
        <GridColumnCustomizer
          gridKey="rosterSpecialTeams"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'kicking', label: 'Kicking' },
          ]}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      expect(screen.getByTestId('column-item-kicking')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('column items are draggable when visible', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const visibleColumn = screen.getByTestId('column-item-name');
      expect(visibleColumn).toHaveAttribute('draggable', 'true');
    });

    it('hidden column items are not draggable', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const hiddenColumn = screen.getByTestId('column-item-age');
      expect(hiddenColumn).toHaveAttribute('draggable', 'false');
    });

    it('drag start sets data transfer', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const column = screen.getByTestId('column-item-name');
      const dataTransfer = {
        effectAllowed: '',
        setData: vi.fn(),
      };

      fireEvent.dragStart(column, { dataTransfer });

      expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'name');
      expect(dataTransfer.effectAllowed).toBe('move');
    });

    it('reorders columns on drop', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const sourceColumn = screen.getByTestId('column-item-name');
      const targetColumn = screen.getByTestId('column-item-overall');

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: vi.fn(),
        getData: vi.fn(() => 'name'),
      };

      fireEvent.dragStart(sourceColumn, { dataTransfer });
      fireEvent.dragEnter(targetColumn, { dataTransfer });
      fireEvent.dragOver(targetColumn, { dataTransfer });
      fireEvent.drop(targetColumn, { dataTransfer });
      fireEvent.dragEnd(sourceColumn, { dataTransfer });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('ignores drop on hidden columns', async () => {
      const onChange = vi.fn();
      render(
        <GridColumnCustomizer
          gridKey="roster"
          columns={testColumns}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const sourceColumn = screen.getByTestId('column-item-name');
      const hiddenColumn = screen.getByTestId('column-item-age');

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: vi.fn(),
        getData: vi.fn(() => 'name'),
      };

      fireEvent.dragStart(sourceColumn, { dataTransfer });
      fireEvent.dragEnter(hiddenColumn, { dataTransfer });
      fireEvent.dragOver(hiddenColumn, { dataTransfer });
      fireEvent.drop(hiddenColumn, { dataTransfer });

      // onChange should not be called for drops on hidden columns
      await waitFor(() => {
        // The drop should be ignored, so setGridPreferences shouldn't be called
        // with a reorder (only toggles would call it)
        const calls = mockSetGridPreferences.mock.calls;
        // No reorder calls expected
        expect(calls.filter((call: [string, { columns: string[] }]) =>
          call[0] === 'roster' && call[1].columns?.length === 3
        )).toHaveLength(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('toggle button has correct aria attributes', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      const toggle = screen.getByTestId('column-customizer-toggle');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('toggle button shows expanded state when open', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      const toggle = screen.getByTestId('column-customizer-toggle');
      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('panel has dialog role', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const panel = screen.getByTestId('column-customizer-panel');
      expect(panel).toHaveAttribute('role', 'dialog');
      expect(panel).toHaveAttribute('aria-label', 'Column settings');
    });

    it('toggle buttons have aria-labels', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const toggle = screen.getByTestId('column-toggle-name');
      expect(toggle).toHaveAttribute('aria-label', 'Hide Name column');
    });

    it('move buttons have aria-labels', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const upButton = screen.getByTestId('column-up-position');
      const downButton = screen.getByTestId('column-down-position');
      expect(upButton).toHaveAttribute('aria-label', 'Move Position up');
      expect(downButton).toHaveAttribute('aria-label', 'Move Position down');
    });
  });

  describe('API Call Efficiency', () => {
    it('makes only one API call when toggling a column', async () => {
      mockSetGridPreferences.mockClear();

      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Toggle a column
      fireEvent.click(screen.getByTestId('column-toggle-name'));

      await waitFor(() => {
        // Should only be called once, not twice
        expect(mockSetGridPreferences).toHaveBeenCalledTimes(1);
      });
    });

    it('makes only one API call when moving a column up', async () => {
      mockSetGridPreferences.mockClear();

      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Move position column up
      fireEvent.click(screen.getByTestId('column-up-position'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledTimes(1);
      });
    });

    it('makes only one API call when moving a column down', async () => {
      mockSetGridPreferences.mockClear();

      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Move position column down
      fireEvent.click(screen.getByTestId('column-down-position'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledTimes(1);
      });
    });

    it('makes only one API call when resetting to defaults', async () => {
      mockSetGridPreferences.mockClear();

      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      // Reset to defaults
      fireEvent.click(screen.getByTestId('reset-columns'));

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledTimes(1);
      });
    });

    it('makes only one API call when drag-and-drop reordering', async () => {
      mockSetGridPreferences.mockClear();

      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const sourceColumn = screen.getByTestId('column-item-name');
      const targetColumn = screen.getByTestId('column-item-overall');

      const dataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: vi.fn(),
        getData: vi.fn(() => 'name'),
      };

      fireEvent.dragStart(sourceColumn, { dataTransfer });
      fireEvent.drop(targetColumn, { dataTransfer });

      await waitFor(() => {
        expect(mockSetGridPreferences).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Column Ordering', () => {
    it('visible columns appear before hidden columns', () => {
      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const items = screen.getAllByTestId(/^column-item-/);
      const keys = items.map(item => item.getAttribute('data-testid')?.replace('column-item-', ''));

      // Visible columns (name, position, overall) should come before hidden ones (age)
      const visibleCols = ['name', 'position', 'overall'];
      const hiddenCols = ['age'];

      const lastVisibleIndex = Math.max(...visibleCols.map(k => keys.indexOf(k)));
      const firstHiddenIndex = Math.min(...hiddenCols.map(k => keys.indexOf(k)));

      expect(lastVisibleIndex).toBeLessThan(firstHiddenIndex);
    });

    it('preserves custom column order', () => {
      mockPreferences.grids.roster.columns = ['overall', 'name', 'position'];

      render(<GridColumnCustomizer gridKey="roster" columns={testColumns} />);

      fireEvent.click(screen.getByTestId('column-customizer-toggle'));

      const items = screen.getAllByTestId(/^column-item-/);
      const visibleKeys = items
        .map(item => item.getAttribute('data-testid')?.replace('column-item-', ''))
        .filter(key => ['overall', 'name', 'position'].includes(key!));

      // Order should match preferences
      expect(visibleKeys).toEqual(['overall', 'name', 'position']);
    });
  });
});
