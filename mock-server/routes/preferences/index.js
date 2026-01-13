/**
 * User Preferences routes
 *
 * - GET /api/users/me/preferences - Get current user's preferences
 * - PUT /api/users/me/preferences - Update current user's preferences
 *
 * The default scenario returns empty preferences.
 * Tests can override with specific scenarios for canned responses.
 */

const mocks = [];

// Canned preference responses for different scenarios
const CANNED_RESPONSES = {
  empty: {
    preferences: {},
  },
  withRedTeamColors: {
    preferences: {
      ui: {
        theme: 'system',
        teamColorSchemes: {
          1: { primary: '#ff0000', secondary: '#1a1a24' },
        },
      },
    },
  },
  withBlueTeamColors: {
    preferences: {
      ui: {
        theme: 'system',
        teamColorSchemes: {
          1: { primary: '#0000ff', secondary: '#1a1a24' },
        },
      },
    },
  },
  fullPreferences: {
    preferences: {
      ui: {
        theme: 'dark',
        teamColorSchemes: {
          1: { primary: '#C8102E', secondary: '#FFB612', accent: '#FFFFFF' },
          2: { primary: '#004C54', secondary: '#A5ACAF' },
        },
      },
      grids: {
        roster: {
          columns: ['number', 'name', 'position', 'overall', 'age', 'salary'],
          columnWidths: { name: 200, salary: 100 },
          sortColumn: 'overall',
          sortDirection: 'desc',
        },
      },
    },
  },
  lightTheme: {
    preferences: {
      ui: { theme: 'light' },
    },
  },
  darkTheme: {
    preferences: {
      ui: { theme: 'dark' },
    },
  },
  systemTheme: {
    preferences: {
      ui: { theme: 'system' },
    },
  },
};

// Get user preferences
const getPreferences = {
  name: 'getPreferences',
  mockRoute: '/api/users/me/preferences',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      // Default: return empty preferences
      defaultScenario: () => JSON.stringify({
        preferences: {},
        lastUpdated: new Date().toISOString(),
      }),
      emptyScenario: () => JSON.stringify(CANNED_RESPONSES.empty),
      withRedTeamColors: () => JSON.stringify(CANNED_RESPONSES.withRedTeamColors),
      withBlueTeamColors: () => JSON.stringify(CANNED_RESPONSES.withBlueTeamColors),
      fullPreferencesScenario: () => JSON.stringify(CANNED_RESPONSES.fullPreferences),
      lightThemeScenario: () => JSON.stringify(CANNED_RESPONSES.lightTheme),
      darkThemeScenario: () => JSON.stringify(CANNED_RESPONSES.darkTheme),
      systemThemeScenario: () => JSON.stringify(CANNED_RESPONSES.systemTheme),
    },
    {
      // Error scenarios
      error: () => ({
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      }),
      unauthorized: () => ({
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }),
    },
  ],
};

// Update user preferences - echoes back what was sent
const updatePreferences = {
  name: 'updatePreferences',
  mockRoute: '/api/users/me/preferences',
  method: 'PUT',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      // Default: echo back what was sent
      defaultScenario: (req) => {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        return JSON.stringify({
          preferences: body.preferences || {},
          lastUpdated: new Date().toISOString(),
        });
      },
      // Return empty preferences
      emptyScenario: () => JSON.stringify(CANNED_RESPONSES.empty),
      // Return specific saved colors (tests should set this scenario before saving)
      withRedTeamColors: () => JSON.stringify(CANNED_RESPONSES.withRedTeamColors),
      withBlueTeamColors: () => JSON.stringify(CANNED_RESPONSES.withBlueTeamColors),
      fullPreferencesScenario: () => JSON.stringify(CANNED_RESPONSES.fullPreferences),
      // Theme scenarios
      lightThemeScenario: () => JSON.stringify(CANNED_RESPONSES.lightTheme),
      darkThemeScenario: () => JSON.stringify(CANNED_RESPONSES.darkTheme),
      systemThemeScenario: () => JSON.stringify(CANNED_RESPONSES.systemTheme),
    },
    {
      // Error scenarios
      error: () => ({
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save preferences' }),
      }),
      validationError: () => ({
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid preferences format' }),
      }),
      unauthorized: () => ({
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      }),
    },
  ],
};

mocks.push(getPreferences);
mocks.push(updatePreferences);

exports.mocks = mocks;
