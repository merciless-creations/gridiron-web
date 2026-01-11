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

export interface NumericFilter {
  operator: '>' | '<' | '>=' | '<=' | '=' | '<>';
  value: number;
}

export interface GridPreferences {
  columns?: string[];
  columnWidths?: Record<string, number>;
  sortColumn?: string;
  sortDirection?: SortDirection;
  /** Numeric column filters (e.g., age: { operator: '>', value: 25 }) */
  numericFilters?: Record<string, NumericFilter>;
  /** Position filter (array of Position enum values) */
  positionFilter?: number[];
  /** Status filter (array of PlayerStatus enum values) */
  statusFilter?: number[];
}

export interface UIPreferences {
  theme?: ThemePreference;
  teamColorSchemes?: Record<number, TeamColorScheme>;
}

export interface GridsPreferences {
  roster?: GridPreferences;
  rosterAll?: GridPreferences;
  rosterOffense?: GridPreferences;
  rosterDefense?: GridPreferences;
  rosterSpecialTeams?: GridPreferences;
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
// Base columns for all roster grids
const BASE_ROSTER_COLUMNS = ['number', 'name', 'position', 'status', 'overall', 'age'];

export const DEFAULT_PREFERENCES: UserPreferences = {
  ui: {
    theme: 'system',
    teamColorSchemes: {},
  },
  grids: {
    roster: {
      columns: ['number', 'name', 'position', 'status', 'overall', 'age', 'exp', 'college', 'salary', 'contract', 'health'],
      columnWidths: {},
      sortColumn: 'position',
      sortDirection: 'asc',
    },
    rosterAll: {
      columns: [...BASE_ROSTER_COLUMNS, 'speed', 'strength', 'agility', 'awareness'],
      columnWidths: {},
      sortColumn: 'position',
      sortDirection: 'asc',
    },
    rosterOffense: {
      columns: [...BASE_ROSTER_COLUMNS, 'speed', 'agility', 'passing', 'catching', 'rushing', 'blocking'],
      columnWidths: {},
      sortColumn: 'position',
      sortDirection: 'asc',
    },
    rosterDefense: {
      columns: [...BASE_ROSTER_COLUMNS, 'speed', 'strength', 'tackling', 'coverage', 'awareness'],
      columnWidths: {},
      sortColumn: 'position',
      sortDirection: 'asc',
    },
    rosterSpecialTeams: {
      columns: [...BASE_ROSTER_COLUMNS, 'kicking', 'awareness'],
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
      rosterAll: {
        ...DEFAULT_PREFERENCES.grids?.rosterAll,
        ...userPrefs.grids?.rosterAll,
      },
      rosterOffense: {
        ...DEFAULT_PREFERENCES.grids?.rosterOffense,
        ...userPrefs.grids?.rosterOffense,
      },
      rosterDefense: {
        ...DEFAULT_PREFERENCES.grids?.rosterDefense,
        ...userPrefs.grids?.rosterDefense,
      },
      rosterSpecialTeams: {
        ...DEFAULT_PREFERENCES.grids?.rosterSpecialTeams,
        ...userPrefs.grids?.rosterSpecialTeams,
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
