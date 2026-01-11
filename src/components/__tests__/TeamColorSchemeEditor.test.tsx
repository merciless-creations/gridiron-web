import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamColorSchemeEditor } from '../TeamColorSchemeEditor';

// Mock the usePreferences hook
const mockSetTeamColorScheme = vi.fn();
const mockRemoveTeamColorScheme = vi.fn();
const mockGetTeamColorScheme = vi.fn();

vi.mock('../../contexts', () => ({
  usePreferences: () => ({
    getTeamColorScheme: mockGetTeamColorScheme,
    setTeamColorScheme: mockSetTeamColorScheme,
    removeTeamColorScheme: mockRemoveTeamColorScheme,
    isSaving: false,
  }),
}));

describe('TeamColorSchemeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTeamColorScheme.mockReturnValue(undefined);
  });

  describe('Initial Display', () => {
    it('renders team color editor card', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      expect(screen.getByTestId('team-color-editor')).toBeInTheDocument();
      expect(screen.getByText('Team Colors')).toBeInTheDocument();
    });

    it('shows customize button when not editing', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      expect(screen.getByTestId('edit-colors-button')).toBeInTheDocument();
      expect(screen.getByText('Customize')).toBeInTheDocument();
    });

    it('shows color preview with team initials', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      expect(screen.getByTestId('color-preview')).toHaveTextContent('AT');
    });

    it('uses default colors when no custom colors set', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
          defaultColors={{ primary: '#C8102E', secondary: '#000000' }}
        />
      );

      expect(screen.getByTestId('color-preview')).toHaveStyle({
        backgroundColor: '#C8102E',
        color: '#000000',
      });
    });

    it('uses custom colors when set', () => {
      mockGetTeamColorScheme.mockReturnValue({
        primary: '#FFB612',
        secondary: '#FFFFFF',
      });

      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      expect(screen.getByTestId('color-preview')).toHaveStyle({
        backgroundColor: '#FFB612',
        color: '#FFFFFF',
      });
    });
  });

  describe('Edit Mode', () => {
    it('shows color inputs when editing', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      // Click customize button
      fireEvent.click(screen.getByTestId('edit-colors-button'));

      // Should show color inputs
      expect(screen.getByTestId('primary-color-hex')).toBeInTheDocument();
      expect(screen.getByTestId('secondary-color-hex')).toBeInTheDocument();
      expect(screen.getByTestId('accent-color-hex')).toBeInTheDocument();
    });

    it('shows save and cancel buttons when editing', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      expect(screen.getByTestId('save-colors-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-colors-button')).toBeInTheDocument();
    });

    it('hides customize button when editing', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      expect(screen.queryByTestId('edit-colors-button')).not.toBeInTheDocument();
    });
  });

  describe('Color Editing', () => {
    it('updates primary color via hex input', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      const primaryInput = screen.getByTestId('primary-color-hex');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      expect(primaryInput).toHaveValue('#FF0000');
    });

    it('updates secondary color via hex input', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      const secondaryInput = screen.getByTestId('secondary-color-hex');
      fireEvent.change(secondaryInput, { target: { value: '#0000FF' } });

      expect(secondaryInput).toHaveValue('#0000FF');
    });

    it('updates accent color via hex input', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      const accentInput = screen.getByTestId('accent-color-hex');
      fireEvent.change(accentInput, { target: { value: '#00FF00' } });

      expect(accentInput).toHaveValue('#00FF00');
    });
  });

  describe('Saving Colors', () => {
    it('saves colors when save button clicked', async () => {
      const onSave = vi.fn();
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
          defaultColors={{ primary: '#00d4aa', secondary: '#1a1a24' }}
          onSave={onSave}
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      // Change colors
      const primaryInput = screen.getByTestId('primary-color-hex');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      const secondaryInput = screen.getByTestId('secondary-color-hex');
      fireEvent.change(secondaryInput, { target: { value: '#0000FF' } });

      // Save
      fireEvent.click(screen.getByTestId('save-colors-button'));

      await waitFor(() => {
        expect(mockSetTeamColorScheme).toHaveBeenCalledWith(1, {
          primary: '#FF0000',
          secondary: '#0000FF',
          // accent is undefined unless explicitly set by user
        });
      });

      expect(onSave).toHaveBeenCalled();
    });

    it('exits edit mode after saving', async () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));
      fireEvent.click(screen.getByTestId('save-colors-button'));

      await waitFor(() => {
        expect(screen.getByTestId('edit-colors-button')).toBeInTheDocument();
      });
    });
  });

  describe('Canceling Edit', () => {
    it('cancels editing when cancel button clicked', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      // Make some changes
      const primaryInput = screen.getByTestId('primary-color-hex');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      // Cancel
      fireEvent.click(screen.getByTestId('cancel-colors-button'));

      // Should exit edit mode without saving
      expect(screen.getByTestId('edit-colors-button')).toBeInTheDocument();
      expect(mockSetTeamColorScheme).not.toHaveBeenCalled();
    });
  });

  describe('Reset to Defaults', () => {
    it('removes custom color scheme when reset clicked', async () => {
      mockGetTeamColorScheme.mockReturnValue({
        primary: '#FFB612',
        secondary: '#FFFFFF',
      });

      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));
      fireEvent.click(screen.getByTestId('reset-colors-button'));

      await waitFor(() => {
        expect(mockRemoveTeamColorScheme).toHaveBeenCalledWith(1);
      });
    });

    it('exits edit mode after reset', async () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));
      fireEvent.click(screen.getByTestId('reset-colors-button'));

      await waitFor(() => {
        expect(screen.getByTestId('edit-colors-button')).toBeInTheDocument();
      });
    });
  });

  describe('Color Preview Updates', () => {
    it('preview updates in real-time while editing', () => {
      render(
        <TeamColorSchemeEditor
          teamId={1}
          teamName="Atlanta Falcons"
          defaultColors={{ primary: '#00d4aa', secondary: '#1a1a24' }}
        />
      );

      fireEvent.click(screen.getByTestId('edit-colors-button'));

      // Change primary color
      const primaryInput = screen.getByTestId('primary-color-hex');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      // Preview should update
      expect(screen.getByTestId('color-preview')).toHaveStyle({
        backgroundColor: '#FF0000',
      });
    });
  });
});
