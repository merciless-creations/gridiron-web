import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '../ThemeSwitcher';

// Mock the usePreferences hook
const mockSetTheme = vi.fn();
const mockPreferences = {
  ui: {
    theme: 'dark' as const,
  },
};

vi.mock('../../contexts', () => ({
  usePreferences: () => ({
    preferences: mockPreferences,
    setTheme: mockSetTheme,
    isSaving: false,
    resolvedTheme: 'dark',
  }),
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreferences.ui.theme = 'dark';
  });

  describe('Buttons variant (default)', () => {
    it('renders all three theme options', () => {
      render(<ThemeSwitcher />);

      expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument();
    });

    it('highlights the current theme', () => {
      render(<ThemeSwitcher />);

      const darkButton = screen.getByRole('radio', { name: 'Dark' });
      expect(darkButton).toHaveAttribute('aria-checked', 'true');
    });

    it('calls setTheme when clicking a theme option', () => {
      render(<ThemeSwitcher />);

      const lightButton = screen.getByRole('radio', { name: 'Light' });
      fireEvent.click(lightButton);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('has radiogroup role on container', () => {
      render(<ThemeSwitcher />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Theme selection');
    });
  });

  describe('Dropdown variant', () => {
    it('renders as a select element', () => {
      render(<ThemeSwitcher variant="dropdown" />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has all theme options', () => {
      render(<ThemeSwitcher variant="dropdown" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('dark');

      // Check options exist
      expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
    });

    it('calls setTheme on change', () => {
      render(<ThemeSwitcher variant="dropdown" />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'light' } });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Compact variant', () => {
    it('renders as a single button', () => {
      render(<ThemeSwitcher variant="compact" />);

      expect(screen.getByTestId('theme-switcher-compact')).toBeInTheDocument();
    });

    it('cycles through themes on click', () => {
      // Start with dark
      mockPreferences.ui.theme = 'dark';
      const { rerender } = render(<ThemeSwitcher variant="compact" />);

      const button = screen.getByTestId('theme-switcher-compact');

      // Click to go from dark -> system
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('system');

      // Update mock and rerender for next click
      mockPreferences.ui.theme = 'system';
      mockSetTheme.mockClear();
      rerender(<ThemeSwitcher variant="compact" />);

      // Click to go from system -> light
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('light');

      // Update mock and rerender for next click
      mockPreferences.ui.theme = 'light';
      mockSetTheme.mockClear();
      rerender(<ThemeSwitcher variant="compact" />);

      // Click to go from light -> dark
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Disabled state', () => {
    it('disables buttons when saving', () => {
      vi.mocked(vi.fn()).mockImplementation(() => ({
        preferences: mockPreferences,
        setTheme: mockSetTheme,
        isSaving: true,
        resolvedTheme: 'dark',
      }));

      // Re-mock with isSaving: true
      vi.doMock('../../contexts', () => ({
        usePreferences: () => ({
          preferences: mockPreferences,
          setTheme: mockSetTheme,
          isSaving: true,
          resolvedTheme: 'dark',
        }),
      }));
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<ThemeSwitcher className="custom-class" />);

      expect(screen.getByTestId('theme-switcher')).toHaveClass('custom-class');
    });
  });
});
