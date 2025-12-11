/**
 * User routes
 * - GET /api/users/me - Get current user
 * - GET /api/users/league/:leagueId - Get users in a league
 * - POST /api/users/:userId/league-roles - Add role to user
 * - DELETE /api/users/:userId/league-roles/:roleId - Remove role from user
 */
const { mockUser } = require('../../state');

const mocks = [];

// Get current user
const getCurrentUser = {
  name: 'getCurrentUser',
  mockRoute: '/api/users/me',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(mockUser);
      },
    },
  ],
};

// Get league users
const getLeagueUsers = {
  name: 'getLeagueUsers',
  mockRoute: '/api/users/league/:leagueId',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify([mockUser]);
      },
    },
  ],
};

// Add league role
const addLeagueRole = {
  name: 'addLeagueRole',
  mockRoute: '/api/users/:userId/league-roles',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(mockUser);
      },
    },
  ],
};

// Remove league role
const removeLeagueRole = {
  name: 'removeLeagueRole',
  mockRoute: '/api/users/:userId/league-roles/:roleId',
  method: 'DELETE',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(mockUser);
      },
    },
  ],
};

mocks.push(getCurrentUser);
mocks.push(getLeagueUsers);
mocks.push(addLeagueRole);
mocks.push(removeLeagueRole);

exports.mocks = mocks;
