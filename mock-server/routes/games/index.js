/**
 * Game routes
 * - GET /api/games - List all games
 * - POST /api/games/simulate - Simulate a game
 */
const { mockGame } = require('../../state');

const mocks = [];

// List all games
const listGames = {
  name: 'listGames',
  mockRoute: '/api/games',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify([mockGame]);
      },
    },
  ],
};

// Simulate a game
const simulateGame = {
  name: 'simulateGame',
  mockRoute: '/api/games/simulate',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        return JSON.stringify({
          id: 1,
          homeTeamId: body.homeTeamId,
          awayTeamId: body.awayTeamId,
          homeScore: 24,
          awayScore: 17,
          message: 'Game simulated successfully',
        });
      },
    },
  ],
};

mocks.push(listGames);
mocks.push(simulateGame);

exports.mocks = mocks;
