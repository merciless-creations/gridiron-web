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

// Get game plays (play-by-play data)
const getGamePlays = {
  name: 'getGamePlays',
  mockRoute: '/api/games/:id/plays',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        // Return a sample set of plays
        return JSON.stringify([
          {
            playType: 'Kickoff',
            possession: 'Home',
            down: 0,
            yardsToGo: 0,
            startFieldPosition: 0,
            endFieldPosition: 25,
            yardsGained: 25,
            startTime: 3600,
            stopTime: 3590,
            elapsedTime: 10,
            isTouchdown: false,
            isSafety: false,
            interception: false,
            possessionChange: false,
            penalties: [],
            fumbles: [],
            injuries: [],
            description: 'Kickoff received at the 25-yard line',
          },
          {
            playType: 'Run',
            possession: 'Home',
            down: 1,
            yardsToGo: 10,
            startFieldPosition: 25,
            endFieldPosition: 32,
            yardsGained: 7,
            startTime: 3590,
            stopTime: 3555,
            elapsedTime: 35,
            isTouchdown: false,
            isSafety: false,
            interception: false,
            possessionChange: false,
            penalties: [],
            fumbles: [],
            injuries: [],
            description: 'Run up the middle for 7 yards',
          },
          {
            playType: 'Pass',
            possession: 'Home',
            down: 2,
            yardsToGo: 3,
            startFieldPosition: 32,
            endFieldPosition: 45,
            yardsGained: 13,
            startTime: 3555,
            stopTime: 3530,
            elapsedTime: 25,
            isTouchdown: false,
            isSafety: false,
            interception: false,
            possessionChange: false,
            penalties: [],
            fumbles: [],
            injuries: [],
            description: 'Pass complete to the receiver for 13 yards. First down!',
          },
          {
            playType: 'Run',
            possession: 'Home',
            down: 1,
            yardsToGo: 10,
            startFieldPosition: 45,
            endFieldPosition: 100,
            yardsGained: 55,
            startTime: 3530,
            stopTime: 3490,
            elapsedTime: 40,
            isTouchdown: true,
            isSafety: false,
            interception: false,
            possessionChange: false,
            penalties: [],
            fumbles: [],
            injuries: [],
            description: 'Breakaway run for a 55-yard TOUCHDOWN!',
          },
        ]);
      },
      emptyPlays: function () {
        return JSON.stringify([]);
      },
      withPenalties: function () {
        return JSON.stringify([
          {
            playType: 'Run',
            possession: 'Home',
            down: 1,
            yardsToGo: 10,
            startFieldPosition: 25,
            endFieldPosition: 15,
            yardsGained: -10,
            startTime: 3590,
            stopTime: 3555,
            elapsedTime: 35,
            isTouchdown: false,
            isSafety: false,
            interception: false,
            possessionChange: false,
            penalties: ['Holding - 10 yards'],
            fumbles: [],
            injuries: [],
            description: 'Run nullified by holding penalty',
          },
        ]);
      },
      withTurnover: function () {
        return JSON.stringify([
          {
            playType: 'Pass',
            possession: 'Home',
            down: 2,
            yardsToGo: 8,
            startFieldPosition: 35,
            endFieldPosition: 35,
            yardsGained: 0,
            startTime: 3500,
            stopTime: 3480,
            elapsedTime: 20,
            isTouchdown: false,
            isSafety: false,
            interception: true,
            possessionChange: true,
            penalties: [],
            fumbles: [],
            injuries: [],
            description: 'Pass INTERCEPTED by the defense!',
          },
        ]);
      },
    },
  ],
};

mocks.push(listGames);
mocks.push(simulateGame);
mocks.push(getGamePlays);

exports.mocks = mocks;
