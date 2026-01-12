import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { ProfilePage } from '../../pages/ProfilePage';
import { Route, Routes } from 'react-router-dom';

const MOCK_SERVER_URL = 'http://localhost:3002';

/**
 * Set a scenario for a specific route on the mock server.
 */
const setScenario = async (route: string, scenario: string) => {
  await fetch(`${MOCK_SERVER_URL}/_scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, scenario }),
  });
};

const renderProfilePage = () => {
  return renderWithProviders(
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>,
    { initialEntries: ['/profile'] }
  );
};

describe('ThemeSwitcher Integration - Theme Application', () => {
  beforeEach(async () => {
    // Reset mock server state
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
    // Clear any existing theme class from document
    document.documentElement.classList.remove('dark', 'light');
  });

  afterEach(() => {
    // Clean up document classes
    document.documentElement.classList.remove('dark', 'light');
  });

  it('applies dark theme class to document when switching to dark mode', async () => {
    const user = userEvent.setup();

    // Start with light theme preference
    await setScenario('getPreferences', 'lightThemeScenario');
    // Set up what the server returns after saving
    await setScenario('updatePreferences', 'darkThemeScenario');

    renderProfilePage();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
    });

    // Set getPreferences to return dark after the mutation invalidates the query
    await setScenario('getPreferences', 'darkThemeScenario');

    // Find and click the Dark theme button
    const darkButton = screen.getByRole('radio', { name: 'Dark' });
    await user.click(darkButton);

    // Verify the document has the dark class applied
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('removes dark theme class when switching from dark to light mode', async () => {
    const user = userEvent.setup();

    // Start with dark theme preference
    await setScenario('getPreferences', 'darkThemeScenario');
    // Set up what the server returns after saving
    await setScenario('updatePreferences', 'lightThemeScenario');

    renderProfilePage();

    // Wait for page to load and dark theme to be applied
    await waitFor(() => {
      expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
    });

    // Verify dark is applied initially
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Set getPreferences to return light after the mutation invalidates the query
    await setScenario('getPreferences', 'lightThemeScenario');

    // Find and click the Light theme button
    const lightButton = screen.getByRole('radio', { name: 'Light' });
    await user.click(lightButton);

    // Verify the dark class is removed
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('applies light theme when system preference is light and system mode selected', async () => {
    const user = userEvent.setup();

    // Mock the system preference to be light
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;

    // Start with dark theme preference (so we can switch to system)
    await setScenario('getPreferences', 'darkThemeScenario');
    // Set up what the server returns after saving
    await setScenario('updatePreferences', 'systemThemeScenario');

    renderProfilePage();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
    });

    // Set getPreferences to return system after the mutation
    await setScenario('getPreferences', 'systemThemeScenario');

    // Find and click the System theme button
    const systemButton = screen.getByRole('radio', { name: 'System' });
    await user.click(systemButton);

    // Verify light mode is applied (dark class removed) since system prefers light
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('applies dark theme when system preference is dark and system mode selected', async () => {
    const user = userEvent.setup();

    // Mock the system preference to be dark
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;

    // Start with light theme preference (so we can switch to system)
    await setScenario('getPreferences', 'lightThemeScenario');
    // Set up what the server returns after saving
    await setScenario('updatePreferences', 'systemThemeScenario');

    renderProfilePage();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
    });

    // Set getPreferences to return system after the mutation
    await setScenario('getPreferences', 'systemThemeScenario');

    // Find and click the System theme button
    const systemButton = screen.getByRole('radio', { name: 'System' });
    await user.click(systemButton);

    // Verify dark mode is applied since system prefers dark
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
