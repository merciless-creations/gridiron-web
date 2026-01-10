/**
 * Depth Chart routes
 * - GET /api/teams/:teamId/depth-chart - Get team depth chart
 */

// Position enum matching frontend
const Position = {
  QB: 0,
  RB: 1,
  WR: 2,
  TE: 3,
  OL: 4,
  DL: 5,
  LB: 6,
  CB: 7,
  S: 8,
  K: 9,
  P: 10,
};

// Generate a mock player for depth chart
function createMockPlayer(id, firstName, lastName, position, number, overallRating, teamId) {
  const baseRating = overallRating;
  const variance = () => Math.floor(Math.random() * 20) - 10;

  return {
    id,
    teamId,
    position,
    number,
    firstName,
    lastName,
    age: 25 + Math.floor(Math.random() * 10),
    exp: Math.floor(Math.random() * 12),
    height: `${Math.floor(Math.random() * 12) + 68}"`,
    college: ['Alabama', 'Ohio State', 'Georgia', 'Clemson', 'LSU', 'Michigan'][Math.floor(Math.random() * 6)],
    speed: Math.min(99, Math.max(50, baseRating + variance())),
    strength: Math.min(99, Math.max(50, baseRating + variance())),
    agility: Math.min(99, Math.max(50, baseRating + variance())),
    awareness: baseRating,
    fragility: 50 + Math.floor(Math.random() * 30),
    morale: 70 + Math.floor(Math.random() * 25),
    discipline: 70 + Math.floor(Math.random() * 25),
    passing: position === Position.QB ? baseRating : 30,
    catching: [Position.WR, Position.TE, Position.RB].includes(position) ? baseRating : 30,
    rushing: [Position.RB, Position.QB].includes(position) ? baseRating : 30,
    blocking: [Position.OL, Position.TE].includes(position) ? baseRating : 30,
    tackling: [Position.DL, Position.LB, Position.CB, Position.S].includes(position) ? baseRating : 30,
    coverage: [Position.CB, Position.S, Position.LB].includes(position) ? baseRating : 30,
    kicking: [Position.K, Position.P].includes(position) ? baseRating : 30,
    contractYears: 1 + Math.floor(Math.random() * 4),
    salary: 1000000 + Math.floor(Math.random() * 20000000),
    potential: 60 + Math.floor(Math.random() * 35),
    progression: 50 + Math.floor(Math.random() * 40),
    health: 85 + Math.floor(Math.random() * 15),
    isRetired: false,
    isInjured: false,
  };
}

// Generate depth chart for a team
function generateDepthChart(teamId) {
  let playerId = 1;

  return {
    teamId,
    positions: {
      [Position.QB]: [
        createMockPlayer(playerId++, 'Marcus', 'Williams', Position.QB, 12, 88, teamId),
        createMockPlayer(playerId++, 'Jake', 'Thompson', Position.QB, 7, 72, teamId),
      ],
      [Position.RB]: [
        createMockPlayer(playerId++, 'DeShawn', 'Jackson', Position.RB, 28, 85, teamId),
        createMockPlayer(playerId++, 'Tyler', 'Mitchell', Position.RB, 32, 76, teamId),
        createMockPlayer(playerId++, 'Chris', 'Davis', Position.RB, 45, 68, teamId),
      ],
      [Position.WR]: [
        createMockPlayer(playerId++, 'Antonio', 'Brown', Position.WR, 84, 91, teamId),
        createMockPlayer(playerId++, 'Jarvis', 'Smith', Position.WR, 11, 82, teamId),
        createMockPlayer(playerId++, 'Michael', 'Thomas', Position.WR, 13, 79, teamId),
        createMockPlayer(playerId++, 'Brandon', 'Cook', Position.WR, 88, 74, teamId),
      ],
      [Position.TE]: [
        createMockPlayer(playerId++, 'Travis', 'Kelley', Position.TE, 87, 86, teamId),
        createMockPlayer(playerId++, 'Mark', 'Andrews', Position.TE, 89, 74, teamId),
      ],
      [Position.OL]: [
        createMockPlayer(playerId++, 'Jason', 'Peters', Position.OL, 71, 84, teamId),
        createMockPlayer(playerId++, 'Lane', 'Johnson', Position.OL, 65, 82, teamId),
        createMockPlayer(playerId++, 'Brandon', 'Scherff', Position.OL, 75, 80, teamId),
        createMockPlayer(playerId++, 'Zack', 'Martin', Position.OL, 70, 78, teamId),
        createMockPlayer(playerId++, 'Tyron', 'Smith', Position.OL, 77, 76, teamId),
        createMockPlayer(playerId++, 'David', 'Bakhtiari', Position.OL, 69, 72, teamId),
      ],
      [Position.DL]: [
        createMockPlayer(playerId++, 'Aaron', 'Donald', Position.DL, 99, 94, teamId),
        createMockPlayer(playerId++, 'Chris', 'Jones', Position.DL, 95, 87, teamId),
        createMockPlayer(playerId++, 'Cameron', 'Heyward', Position.DL, 97, 82, teamId),
        createMockPlayer(playerId++, 'Fletcher', 'Cox', Position.DL, 91, 78, teamId),
      ],
      [Position.LB]: [
        createMockPlayer(playerId++, 'Bobby', 'Wagner', Position.LB, 54, 89, teamId),
        createMockPlayer(playerId++, 'Fred', 'Warner', Position.LB, 52, 86, teamId),
        createMockPlayer(playerId++, 'Darius', 'Leonard', Position.LB, 53, 83, teamId),
        createMockPlayer(playerId++, 'Lavonte', 'David', Position.LB, 58, 76, teamId),
      ],
      [Position.CB]: [
        createMockPlayer(playerId++, 'Jalen', 'Ramsey', Position.CB, 20, 92, teamId),
        createMockPlayer(playerId++, 'Marlon', 'Humphrey', Position.CB, 21, 85, teamId),
        createMockPlayer(playerId++, 'Tre', 'White', Position.CB, 27, 80, teamId),
        createMockPlayer(playerId++, 'Darius', 'Slay', Position.CB, 24, 77, teamId),
      ],
      [Position.S]: [
        createMockPlayer(playerId++, 'Derwin', 'James', Position.S, 33, 90, teamId),
        createMockPlayer(playerId++, 'Jessie', 'Bates', Position.S, 30, 84, teamId),
        createMockPlayer(playerId++, 'Antoine', 'Winfield', Position.S, 31, 78, teamId),
      ],
      [Position.K]: [
        createMockPlayer(playerId++, 'Justin', 'Tucker', Position.K, 9, 95, teamId),
      ],
      [Position.P]: [
        createMockPlayer(playerId++, 'Michael', 'Dickson', Position.P, 4, 88, teamId),
      ],
    },
  };
}

const mocks = [];

// Get team depth chart
const getDepthChart = {
  name: 'getDepthChart',
  mockRoute: new RegExp(`^/api/teams/([0-9]+)/depth-chart$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/teams\/(\d+)\/depth-chart/);
        const teamId = match ? Number(match[1]) : null;

        if (!teamId || teamId < 1 || teamId > 32) {
          return JSON.stringify({ error: 'Team not found' });
        }

        return JSON.stringify(generateDepthChart(teamId));
      },
      notFoundScenario: function (req, res) {
        res.status(404);
        return JSON.stringify({ error: 'Team not found', status: 404 });
      },
      errorScenario: function (req, res) {
        res.status(500);
        return JSON.stringify({ error: 'Internal server error', status: 500 });
      },
    },
  ],
};

mocks.push(getDepthChart);

exports.mocks = mocks;
