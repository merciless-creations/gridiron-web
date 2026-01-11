/**
 * User Preferences Types
 * Frontend owns the schema. Backend is dumb storage.
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type SortDirection = 'asc' | 'desc';

export interface TeamColorScheme {
  primary: string;
  secondary: string;
  accent?: string;
}

export interface GridPreferences {
  columns?: string[];
  columnWidths?: Record<string, number>;
  sortColumn?: string;
  sortDirection?: SortDirection;
}

export interface UIPreferences {
  theme?: ThemePreference;
  teamColorSchemes?: Record<number, TeamColorScheme>;
}

export interface GridsPreferences {
  roster?: GridPreferences;
  depthChart?: GridPreferences;
  standings?: GridPreferences;
}

export interface UserPreferences {
  ui?: UIPreferences;
  grids?: GridsPreferences;
}

export interface PreferencesResponse {
  preferences: UserPreferences;
}

/**
 * Default preferences to use when none are set
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  ui: {
    theme: 'system',
    teamColorSchemes: {},
  },
  grids: {
    roster: {
      columns: ['number', 'name', 'position', 'overall', 'age', 'exp', 'college', 'salary', 'contract', 'health'],
      columnWidths: {},
      sortColumn: 'position',
      sortDirection: 'asc',
    },
    depthChart: {
      columns: ['name', 'position', 'rating'],
      columnWidths: {},
      sortColumn: 'position',
      sortDirection: 'asc',
    },
    standings: {
      columns: ['team', 'wins', 'losses', 'pct', 'streak'],
      columnWidths: {},
      sortColumn: 'wins',
      sortDirection: 'desc',
    },
  },
};

/**
 * Merge user preferences with defaults, ensuring all required fields exist
 */
export function mergeWithDefaults(userPrefs: UserPreferences): UserPreferences {
  return {
    ui: {
      theme: userPrefs.ui?.theme ?? DEFAULT_PREFERENCES.ui?.theme ?? 'system',
      teamColorSchemes: {
        ...DEFAULT_PREFERENCES.ui?.teamColorSchemes,
        ...userPrefs.ui?.teamColorSchemes,
      },
    },
    grids: {
      roster: {
        ...DEFAULT_PREFERENCES.grids?.roster,
        ...userPrefs.grids?.roster,
      },
      depthChart: {
        ...DEFAULT_PREFERENCES.grids?.depthChart,
        ...userPrefs.grids?.depthChart,
      },
      standings: {
        ...DEFAULT_PREFERENCES.grids?.standings,
        ...userPrefs.grids?.standings,
      },
    },
  };
}
