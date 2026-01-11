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
  });
});
