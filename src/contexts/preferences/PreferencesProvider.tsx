import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { usePreferencesQuery, useUpdatePreferences } from '../../api/preferences';
import {
  type UserPreferences,
  type ThemePreference,
  type GridPreferences,
  type TeamColorScheme,
  mergeWithDefaults,
  DEFAULT_PREFERENCES,
} from '../../types/Preferences';
import { PreferencesContext } from './PreferencesContext';
import type { PreferencesContextValue } from './types';

interface PreferencesProviderProps {
  children: ReactNode;
}

/**
 * Detects the system color scheme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark'; // Default to dark for Gridiron
}

/**
 * Applies the theme to the document
 */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { data, isLoading, error: queryError } = usePreferencesQuery();
  const updateMutation = useUpdatePreferences();

  // Track the resolved theme for system theme changes
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Merge fetched preferences with defaults
  const preferences = useMemo(() => {
    const userPrefs = data?.preferences ?? {};
    return mergeWithDefaults(userPrefs);
  }, [data]);

  // Resolve the actual theme to use
  const resolvedTheme = useMemo(() => {
    const pref = preferences.ui?.theme;
    if (pref === 'system' || !pref) {
      return systemTheme;
    }
    return pref;
  }, [preferences.ui?.theme, systemTheme]);

  // Apply theme to document when it changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Update preferences on the server
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const newPrefs: UserPreferences = {
      ...preferences,
      ...updates,
      ui: {
        ...preferences.ui,
        ...updates.ui,
      },
      grids: {
        ...preferences.grids,
        ...updates.grids,
      },
    };
    await updateMutation.mutateAsync(newPrefs);
  }, [preferences, updateMutation]);

  // Set theme
  const setTheme = useCallback(async (theme: ThemePreference) => {
    await updatePreferences({
      ui: {
        ...preferences.ui,
        theme,
      },
    });
  }, [updatePreferences, preferences.ui]);

  // Set grid preferences
  const setGridPreferences = useCallback(async (
    gridKey: 'roster' | 'depthChart' | 'standings',
    prefs: Partial<GridPreferences>
  ) => {
    await updatePreferences({
      grids: {
        ...preferences.grids,
        [gridKey]: {
          ...preferences.grids?.[gridKey],
          ...prefs,
        },
      },
    });
  }, [updatePreferences, preferences.grids]);

  // Set team color scheme
  const setTeamColorScheme = useCallback(async (teamId: number, colors: TeamColorScheme) => {
    await updatePreferences({
      ui: {
        ...preferences.ui,
        teamColorSchemes: {
          ...preferences.ui?.teamColorSchemes,
          [teamId]: colors,
        },
      },
    });
  }, [updatePreferences, preferences.ui]);

  // Remove team color scheme
  const removeTeamColorScheme = useCallback(async (teamId: number) => {
    const { [teamId]: removed, ...rest } = preferences.ui?.teamColorSchemes ?? {};
    await updatePreferences({
      ui: {
        ...preferences.ui,
        teamColorSchemes: rest,
      },
    });
  }, [updatePreferences, preferences.ui]);

  // Get team color scheme
  const getTeamColorScheme = useCallback((teamId: number): TeamColorScheme | undefined => {
    return preferences.ui?.teamColorSchemes?.[teamId];
  }, [preferences.ui?.teamColorSchemes]);

  // Reset preferences
  const resetPreferences = useCallback(async () => {
    await updateMutation.mutateAsync(DEFAULT_PREFERENCES);
  }, [updateMutation]);

  const value = useMemo((): PreferencesContextValue => ({
    preferences,
    isLoading,
    isSaving: updateMutation.isPending,
    error: queryError instanceof Error ? queryError : updateMutation.error instanceof Error ? updateMutation.error : null,
    resolvedTheme,
    updatePreferences,
    setTheme,
    setGridPreferences,
    setTeamColorScheme,
    removeTeamColorScheme,
    getTeamColorScheme,
    resetPreferences,
  }), [
    preferences,
    isLoading,
    updateMutation.isPending,
    queryError,
    updateMutation.error,
    resolvedTheme,
    updatePreferences,
    setTheme,
    setGridPreferences,
    setTeamColorScheme,
    removeTeamColorScheme,
    getTeamColorScheme,
    resetPreferences,
  ]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
