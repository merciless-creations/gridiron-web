import type {
  UserPreferences,
  ThemePreference,
  GridPreferences,
  TeamColorScheme,
} from '../../types/Preferences';

export interface PreferencesState {
  /** The merged preferences (user prefs + defaults) */
  preferences: UserPreferences;
  /** Whether preferences are still loading */
  isLoading: boolean;
  /** Whether preferences are currently being saved */
  isSaving: boolean;
  /** Any error from loading/saving */
  error: Error | null;
  /** The resolved theme (accounts for 'system' preference) */
  resolvedTheme: 'light' | 'dark';
}

/** All grid keys that can be customized */
export type GridKey =
  | 'roster'
  | 'rosterAll'
  | 'rosterOffense'
  | 'rosterDefense'
  | 'rosterSpecialTeams'
  | 'depthChart'
  | 'standings';

export interface PreferencesActions {
  /** Update the entire preferences object */
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  /** Set the theme preference */
  setTheme: (theme: ThemePreference) => Promise<void>;
  /** Update grid preferences for a specific grid */
  setGridPreferences: (gridKey: GridKey, prefs: Partial<GridPreferences>) => Promise<void>;
  /** Set a team color scheme */
  setTeamColorScheme: (teamId: number, colors: TeamColorScheme) => Promise<void>;
  /** Remove a team color scheme */
  removeTeamColorScheme: (teamId: number) => Promise<void>;
  /** Get the color scheme for a team (returns undefined if not set) */
  getTeamColorScheme: (teamId: number) => TeamColorScheme | undefined;
  /** Reset all preferences to defaults */
  resetPreferences: () => Promise<void>;
}

export interface PreferencesContextValue extends PreferencesState, PreferencesActions {}
