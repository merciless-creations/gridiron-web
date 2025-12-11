/**
 * Team routes
 * - GET /api/teams - List all teams
 * - GET /api/teams/:id - Get single team
 */
const { mockTeams } = require('../../state');

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
    },
  ],
};

mocks.push(listTeams);
mocks.push(getTeam);

exports.mocks = mocks;
