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

// Teams data for four-team scenarios (matches team assignments data)
const fourTeamsData = [
  { id: 1, divisionId: 1, name: 'Eagles', city: 'Philadelphia', budget: 210000000, championships: 1, wins: 12, losses: 4, ties: 0, fanSupport: 85, chemistry: 90 },
  { id: 2, divisionId: 1, name: 'Cowboys', city: 'Dallas', budget: 225000000, championships: 5, wins: 9, losses: 7, ties: 0, fanSupport: 95, chemistry: 70 },
  { id: 3, divisionId: 2, name: 'Giants', city: 'New York', budget: 210000000, championships: 4, wins: 6, losses: 10, ties: 0, fanSupport: 80, chemistry: 65 },
  { id: 4, divisionId: 2, name: 'Bears', city: 'Chicago', budget: 200000000, championships: 1, wins: 8, losses: 8, ties: 0, fanSupport: 80, chemistry: 75 },
];

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
      // Teams for four-team scenarios (allAiControlled, manyPending, allActive)
      fourTeams: function () {
        return JSON.stringify(fourTeamsData);
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
