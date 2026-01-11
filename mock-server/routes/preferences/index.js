/**
 * User Preferences routes (stateful for E2E testing)
 *
 * - GET /api/users/me/preferences - Get current user's preferences
 * - PUT /api/users/me/preferences - Update current user's preferences
 *
 * This mock server maintains state within a session for E2E testing.
 * State is reset when the server restarts or when /_reset is called.
 */

const mocks = [];

// In-memory store for preferences (stateful)
let storedPreferences = {};

// Get user preferences
const getPreferences = {
  name: 'getPreferences',
  mockRoute: '/api/users/me/preferences',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        // Return stored preferences (stateful)
        return JSON.stringify({ preferences: storedPreferences });
      },
      emptyScenario: function () {
        return JSON.stringify({ preferences: {} });
      },
      fullPreferencesScenario: function () {
        return JSON.stringify({
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
              depthChart: {
                columns: ['name', 'position', 'rating'],
                sortColumn: 'position',
                sortDirection: 'asc',
              },
            },
          },
        });
      },
      lightThemeScenario: function () {
        return JSON.stringify({
          preferences: {
            ui: {
              theme: 'light',
            },
          },
        });
      },
      darkThemeScenario: function () {
        return JSON.stringify({
          preferences: {
            ui: {
              theme: 'dark',
            },
          },
        });
      },
      systemThemeScenario: function () {
        return JSON.stringify({
          preferences: {
            ui: {
              theme: 'system',
            },
          },
        });
      },
      customColumnsScenario: function () {
        return JSON.stringify({
          preferences: {
            grids: {
              rosterAll: {
                columns: ['name', 'position', 'overall', 'speed', 'strength'],
              },
              rosterOffense: {
                columns: ['name', 'position', 'passing', 'rushing', 'catching'],
              },
            },
          },
        });
      },
    },
    {
      // Error scenarios
      error: function () {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        };
      },
      unauthorized: function () {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Unauthorized' }),
        };
      },
    },
  ],
};

// Update user preferences - stores and returns the preferences (stateful)
const updatePreferences = {
  name: 'updatePreferences',
  mockRoute: '/api/users/me/preferences',
  method: 'PUT',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        // Store the preferences (stateful mock)
        const body = req.body;
        if (body && body.preferences) {
          storedPreferences = body.preferences;
          return JSON.stringify({ preferences: storedPreferences });
        }
        return JSON.stringify({ preferences: storedPreferences });
      },
    },
    {
      // Error scenarios
      error: function () {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to save preferences' }),
        };
      },
      validationError: function () {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid preferences format' }),
        };
      },
      unauthorized: function () {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Unauthorized' }),
        };
      },
    },
  ],
};

// Export a reset function that can be called to clear stored preferences
const resetPreferences = () => {
  storedPreferences = {};
};

mocks.push(getPreferences);
mocks.push(updatePreferences);

exports.mocks = mocks;
exports.resetPreferences = resetPreferences;
