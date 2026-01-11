/**
 * User Preferences routes
 * - GET /api/users/me/preferences - Get current user's preferences
 * - PUT /api/users/me/preferences - Update current user's preferences
 */

// In-memory store for preferences (reset on server restart)
let userPreferences = {};

const mocks = [];

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
        return JSON.stringify({ preferences: userPreferences });
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
      systemThemeScenario: function () {
        return JSON.stringify({
          preferences: {
            ui: {
              theme: 'system',
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

// Update user preferences
const updatePreferences = {
  name: 'updatePreferences',
  mockRoute: '/api/users/me/preferences',
  method: 'PUT',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        if (body && body.preferences) {
          userPreferences = body.preferences;
          return JSON.stringify({ preferences: userPreferences });
        }
        return JSON.stringify({ preferences: userPreferences });
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

// Reset preferences (for testing)
const resetPreferences = () => {
  userPreferences = {};
};

mocks.push(getPreferences);
mocks.push(updatePreferences);

exports.mocks = mocks;
exports.resetPreferences = resetPreferences;
