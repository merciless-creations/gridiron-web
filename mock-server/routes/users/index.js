/**
 * User routes
 * - GET /api/users/me - Get current user
 * - GET /api/users/league/:leagueId - Get users in a league
 * - POST /api/users/:userId/league-roles - Add role to user
 * - DELETE /api/users/:userId/league-roles/:roleId - Remove role from user
 */
const { mockUser } = require('../../state');

// Mock league members with varying team control states
// controlState: 'HumanControlled' = actively managing, 'Pending' = invited but hasn't taken control
const mockLeagueUsers = [
  {
    id: 1,
    email: 'testuser@example.com',
    displayName: 'Test User',
    isGlobalAdmin: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-11-29T08:30:00Z',
    leagueRoles: [{
      id: 1,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Commissioner',
      teamId: 1,
      teamName: 'Falcons',
      controlState: 'HumanControlled',
      assignedAt: '2024-01-15T10:00:00Z',
    }],
  },
  {
    id: 2,
    email: 'john.smith@example.com',
    displayName: 'John Smith',
    isGlobalAdmin: false,
    createdAt: '2024-02-01T10:00:00Z',
    lastLoginAt: '2024-11-28T14:22:00Z',
    leagueRoles: [{
      id: 2,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Player',
      teamId: 2,
      teamName: 'Eagles',
      controlState: 'HumanControlled',
      assignedAt: '2024-02-01T10:00:00Z',
    }],
  },
  {
    id: 3,
    email: 'jane.doe@example.com',
    displayName: 'Jane Doe',
    isGlobalAdmin: false,
    createdAt: '2024-02-10T10:00:00Z',
    lastLoginAt: null,  // Never logged in yet
    leagueRoles: [{
      id: 3,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Player',
      teamId: 4,
      teamName: 'Packers',
      controlState: 'Pending',  // Invited but hasn't taken control
      assignedAt: '2024-02-10T10:00:00Z',
    }],
  },
  {
    id: 4,
    email: 'bob.wilson@example.com',
    displayName: 'Bob Wilson',
    isGlobalAdmin: false,
    createdAt: '2024-02-15T10:00:00Z',
    lastLoginAt: null,  // Never logged in yet
    leagueRoles: [{
      id: 4,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Player',
      teamId: 5,
      teamName: 'Cowboys',
      controlState: 'Pending',  // Invited but hasn't taken control
      assignedAt: '2024-02-15T10:00:00Z',
    }],
  },
  {
    id: 5,
    email: 'sarah.jones@example.com',
    displayName: 'Sarah Jones',
    isGlobalAdmin: false,
    createdAt: '2024-03-01T10:00:00Z',
    lastLoginAt: '2024-11-29T11:00:00Z',
    leagueRoles: [{
      id: 5,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Player',
      teamId: 3,
      teamName: 'Bears',
      controlState: 'HumanControlled',
      assignedAt: '2024-03-01T10:00:00Z',
    }],
  },
];

// Pending user scenario - user invited to team but hasn't taken control
const pendingUser = {
  id: 99,
  email: 'pending.user@example.com',
  displayName: 'Pending User',
  isGlobalAdmin: false,
  createdAt: '2024-02-20T10:00:00Z',
  lastLoginAt: new Date().toISOString(),
  leagueRoles: [
    {
      id: 99,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Player',
      teamId: 6,
      teamName: 'Giants',
      controlState: 'Pending',
      assignedAt: '2024-02-20T10:00:00Z',
    },
  ],
};

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
      pendingUserScenario: function () {
        return JSON.stringify(pendingUser);
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
        return JSON.stringify(mockLeagueUsers);
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
