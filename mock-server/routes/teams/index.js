/**
 * Team routes
 * - GET /api/teams - List all teams
 * - GET /api/teams/:id - Get single team
 */
const { mockTeams } = require('../../state');

// Pending user only sees their invited team
const pendingUserTeam = {
  id: 6,
  divisionId: 3,
  name: 'Giants',
  city: 'New York',
  budget: 210000000,
  championships: 4,
  wins: 6,
  losses: 10,
  ties: 0,
  fanSupport: 80,
  chemistry: 65,
};

const mocks = [];

// List all teams
const listTeams = {
  name: 'listTeams',
  mockRoute: new RegExp(`^/api/teams$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(mockTeams);
      },
      pendingUserScenario: function () {
        return JSON.stringify([pendingUserTeam]);
      },
    },
  ],
};

// Get single team
const getTeam = {
  name: 'getTeam',
  mockRoute: '/api/teams/:id',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const team = mockTeams.find(t => t.id === Number(req.params.id));
        if (!team) {
          return JSON.stringify({ error: 'Team not found' });
        }
        return JSON.stringify(team);
      },
      notFoundScenario: function (req, res) {
        res.status(404);
        return JSON.stringify({ error: 'Team not found', status: 404 });
      },
      errorScenario: function (req, res) {
        res.status(500);
        return JSON.stringify({ error: 'Internal server error', status: 500 });
      },
      unauthorizedScenario: function (req, res) {
        res.status(401);
        return JSON.stringify({ error: 'Unauthorized', status: 401 });
      },
      forbiddenScenario: function (req, res) {
        res.status(403);
        return JSON.stringify({ error: 'Forbidden - not your team', status: 403 });
      },
    },
  ],
};

mocks.push(listTeams);
mocks.push(getTeam);

exports.mocks = mocks;
