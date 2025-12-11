/**
 * League CRUD routes
 * - GET /api/leagues-management - List all leagues
 * - POST /api/leagues-management - Create league
 * - GET /api/leagues-management/:id - Get single league
 * - PUT /api/leagues-management/:id - Update league
 */
const state = require('../../state');

const mocks = [];

// List all leagues
const listLeagues = {
  name: 'listLeagues',
  mockRoute: new RegExp(`^/api/leagues-management$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(Array.from(state.getLeagues().values()));
      },
    },
  ],
};

// Create a new league
const createLeague = {
  name: 'createLeague',
  mockRoute: '/api/leagues-management',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        const newLeague = {
          id: state.getNextLeagueId(),
          name: body.name,
          season: new Date().getFullYear(),
          totalTeams: 0,
          totalConferences: 0,
          isActive: true,
          conferences: [],
        };
        state.setLeague(newLeague.id, newLeague);
        return JSON.stringify(newLeague);
      },
    },
  ],
};

// Get a single league by ID
const getLeague = {
  name: 'getLeague',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)/);
        const id = match ? Number(match[1]) : null;
        const league = id ? state.getLeague(id) : null;
        if (!league) {
          return JSON.stringify({ error: 'League not found' });
        }
        return JSON.stringify(league);
      },
    },
  ],
};

// Update a league
const updateLeague = {
  name: 'updateLeague',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)$`).source,
  method: 'PUT',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)/);
        const id = match ? Number(match[1]) : null;
        const league = id ? state.getLeague(id) : null;
        if (!league) {
          return JSON.stringify({ error: 'League not found' });
        }
        const updates = req.body;
        const updatedLeague = { ...league, ...updates };
        state.setLeague(id, updatedLeague);
        return JSON.stringify(updatedLeague);
      },
    },
  ],
};

mocks.push(listLeagues);
mocks.push(createLeague);
mocks.push(getLeague);
mocks.push(updateLeague);

exports.mocks = mocks;
