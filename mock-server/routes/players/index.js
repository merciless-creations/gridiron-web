/**
 * Player routes
 * - GET /api/players - List all players (with optional teamId filter)
 * - GET /api/players/:id - Get single player
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

// Generate realistic mock players for a team
function generateMockPlayers(teamId) {
  const firstNames = ['Marcus', 'James', 'Michael', 'David', 'Chris', 'Kevin', 'Justin', 'Tyler', 'Josh', 'Ryan', 'Brandon', 'Derek', 'Antonio', 'DeAndre', 'Tyreek', 'Travis', 'Patrick', 'Lamar', 'Derrick', 'Davante', 'Stefon', 'CeeDee', 'DK', 'Jaylen'];
  const lastNames = ['Johnson', 'Williams', 'Smith', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker'];
  const colleges = ['Alabama', 'Ohio State', 'Georgia', 'Clemson', 'LSU', 'Michigan', 'Texas', 'Oklahoma', 'Notre Dame', 'Penn State', 'USC', 'Florida', 'Oregon', 'Auburn', 'Miami'];

  // Roster composition (53-man roster)
  const positionCounts = [
    { position: Position.QB, count: 3, numbers: [1, 2, 3, 4, 7, 8, 10, 12] },
    { position: Position.RB, count: 4, numbers: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
    { position: Position.WR, count: 6, numbers: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 80, 81, 82, 83, 84, 85] },
    { position: Position.TE, count: 3, numbers: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89] },
    { position: Position.OL, count: 9, numbers: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
    { position: Position.DL, count: 8, numbers: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 70, 71, 72, 73, 74, 75] },
    { position: Position.LB, count: 7, numbers: [40, 41, 42, 43, 44, 45, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59] },
    { position: Position.CB, count: 6, numbers: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35] },
    { position: Position.S, count: 5, numbers: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43] },
    { position: Position.K, count: 1, numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { position: Position.P, count: 1, numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ];

  const players = [];
  let playerId = teamId * 100; // Unique IDs based on team
  const usedNumbers = new Set();

  for (const { position, count, numbers } of positionCounts) {
    for (let i = 0; i < count; i++) {
      // Find an unused number
      let number = numbers[i % numbers.length];
      while (usedNumbers.has(number)) {
        number = (number % 99) + 1;
      }
      usedNumbers.add(number);

      const age = Math.floor(Math.random() * 12) + 22; // 22-33
      const exp = Math.max(0, age - 22 - Math.floor(Math.random() * 3));

      // Generate position-appropriate attributes
      const baseRating = Math.floor(Math.random() * 25) + 65; // 65-90 base
      const variance = () => Math.floor(Math.random() * 20) - 10; // -10 to +10

      players.push({
        id: playerId++,
        teamId,
        position,
        number,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        age,
        exp,
        height: `${Math.floor(Math.random() * 12) + 68}"`, // 5'8" to 6'8" in inches
        college: colleges[Math.floor(Math.random() * colleges.length)],

        // General attributes
        speed: Math.min(99, Math.max(50, baseRating + variance())),
        strength: Math.min(99, Math.max(50, baseRating + variance())),
        agility: Math.min(99, Math.max(50, baseRating + variance())),
        awareness: Math.min(99, Math.max(50, baseRating + variance())),
        fragility: Math.floor(Math.random() * 30) + 20,
        morale: Math.floor(Math.random() * 30) + 60,
        discipline: Math.floor(Math.random() * 30) + 60,

        // Position-specific skills
        passing: position === Position.QB ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        catching: [Position.WR, Position.TE, Position.RB].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        rushing: [Position.RB, Position.QB].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        blocking: [Position.OL, Position.TE].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        tackling: [Position.DL, Position.LB, Position.CB, Position.S].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        coverage: [Position.CB, Position.S, Position.LB].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        kicking: [Position.K, Position.P].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 30) + 10,

        // Contract
        contractYears: Math.floor(Math.random() * 4) + 1,
        salary: Math.floor(Math.random() * 20000000) + 800000,

        // Development
        potential: Math.min(99, Math.max(50, baseRating + Math.floor(Math.random() * 15))),
        progression: Math.floor(Math.random() * 30) + 60,

        // Status
        health: Math.floor(Math.random() * 20) + 80,
        isRetired: false,
        isInjured: Math.random() < 0.1, // 10% injury rate
      });
    }
  }

  return players;
}

// Pre-generate players for teams 1-24
const allPlayers = new Map();
for (let teamId = 1; teamId <= 24; teamId++) {
  allPlayers.set(teamId, generateMockPlayers(teamId));
}

const mocks = [];

// List all players (optionally filtered by teamId)
const listPlayers = {
  name: 'listPlayers',
  mockRoute: '/api/players',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const teamId = req.query.teamId ? Number(req.query.teamId) : null;
        if (teamId) {
          const teamPlayers = allPlayers.get(teamId) || [];
          return JSON.stringify(teamPlayers);
        }
        // Return all players
        const all = [];
        allPlayers.forEach(players => all.push(...players));
        return JSON.stringify(all);
      },
      emptyScenario: function () {
        return JSON.stringify([]);
      },
      errorScenario: function (req, res) {
        res.status(500);
        return JSON.stringify({ error: 'Internal server error', status: 500 });
      },
    },
  ],
};

// Get single player
const getPlayer = {
  name: 'getPlayer',
  mockRoute: '/api/players/:id',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const playerId = Number(req.params.id);
        for (const players of allPlayers.values()) {
          const player = players.find(p => p.id === playerId);
          if (player) {
            return JSON.stringify(player);
          }
        }
        return JSON.stringify({ error: 'Player not found' });
      },
      notFoundScenario: function (req, res) {
        res.status(404);
        return JSON.stringify({ error: 'Player not found', status: 404 });
      },
    },
  ],
};

mocks.push(listPlayers);
mocks.push(getPlayer);

exports.mocks = mocks;
