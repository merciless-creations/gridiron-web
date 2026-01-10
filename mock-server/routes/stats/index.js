/**
 * Stats/Leaders routes
 * - GET /api/leagues-management/:leagueId/leaders - Get league statistical leaders
 */

const mocks = [];

// Mock league leaders data
const mockLeagueLeaders = {
  passing: {
    yards: [
      { playerId: 1, playerName: 'Patrick Mahomes', teamName: 'Chiefs', teamCity: 'Kansas City', value: 4183 },
      { playerId: 2, playerName: 'Josh Allen', teamName: 'Bills', teamCity: 'Buffalo', value: 4012 },
      { playerId: 3, playerName: 'Joe Burrow', teamName: 'Bengals', teamCity: 'Cincinnati', value: 3891 },
      { playerId: 4, playerName: 'Tua Tagovailoa', teamName: 'Dolphins', teamCity: 'Miami', value: 3745 },
      { playerId: 5, playerName: 'Lamar Jackson', teamName: 'Ravens', teamCity: 'Baltimore', value: 3678 },
    ],
    touchdowns: [
      { playerId: 1, playerName: 'Patrick Mahomes', teamName: 'Chiefs', teamCity: 'Kansas City', value: 38 },
      { playerId: 2, playerName: 'Josh Allen', teamName: 'Bills', teamCity: 'Buffalo', value: 35 },
      { playerId: 6, playerName: 'Jalen Hurts', teamName: 'Eagles', teamCity: 'Philadelphia', value: 32 },
      { playerId: 3, playerName: 'Joe Burrow', teamName: 'Bengals', teamCity: 'Cincinnati', value: 30 },
      { playerId: 7, playerName: 'Dak Prescott', teamName: 'Cowboys', teamCity: 'Dallas', value: 28 },
    ],
    rating: [
      { playerId: 1, playerName: 'Patrick Mahomes', teamName: 'Chiefs', teamCity: 'Kansas City', value: 112.4 },
      { playerId: 4, playerName: 'Tua Tagovailoa', teamName: 'Dolphins', teamCity: 'Miami', value: 108.9 },
      { playerId: 2, playerName: 'Josh Allen', teamName: 'Bills', teamCity: 'Buffalo', value: 105.2 },
      { playerId: 8, playerName: 'Brock Purdy', teamName: '49ers', teamCity: 'San Francisco', value: 103.8 },
      { playerId: 3, playerName: 'Joe Burrow', teamName: 'Bengals', teamCity: 'Cincinnati', value: 101.5 },
    ],
  },
  rushing: {
    yards: [
      { playerId: 10, playerName: 'Derrick Henry', teamName: 'Titans', teamCity: 'Tennessee', value: 1538 },
      { playerId: 11, playerName: 'Nick Chubb', teamName: 'Browns', teamCity: 'Cleveland', value: 1412 },
      { playerId: 12, playerName: 'Josh Jacobs', teamName: 'Raiders', teamCity: 'Las Vegas', value: 1356 },
      { playerId: 13, playerName: 'Saquon Barkley', teamName: 'Giants', teamCity: 'New York', value: 1289 },
      { playerId: 14, playerName: 'Christian McCaffrey', teamName: '49ers', teamCity: 'San Francisco', value: 1245 },
    ],
    touchdowns: [
      { playerId: 10, playerName: 'Derrick Henry', teamName: 'Titans', teamCity: 'Tennessee', value: 15 },
      { playerId: 12, playerName: 'Josh Jacobs', teamName: 'Raiders', teamCity: 'Las Vegas', value: 14 },
      { playerId: 14, playerName: 'Christian McCaffrey', teamName: '49ers', teamCity: 'San Francisco', value: 13 },
      { playerId: 11, playerName: 'Nick Chubb', teamName: 'Browns', teamCity: 'Cleveland', value: 12 },
      { playerId: 15, playerName: 'Austin Ekeler', teamName: 'Chargers', teamCity: 'Los Angeles', value: 11 },
    ],
    ypc: [
      { playerId: 16, playerName: 'Kenneth Walker', teamName: 'Seahawks', teamCity: 'Seattle', value: 5.8 },
      { playerId: 11, playerName: 'Nick Chubb', teamName: 'Browns', teamCity: 'Cleveland', value: 5.6 },
      { playerId: 10, playerName: 'Derrick Henry', teamName: 'Titans', teamCity: 'Tennessee', value: 5.4 },
      { playerId: 14, playerName: 'Christian McCaffrey', teamName: '49ers', teamCity: 'San Francisco', value: 5.2 },
      { playerId: 17, playerName: 'Breece Hall', teamName: 'Jets', teamCity: 'New York', value: 5.0 },
    ],
  },
  receiving: {
    yards: [
      { playerId: 20, playerName: 'Tyreek Hill', teamName: 'Dolphins', teamCity: 'Miami', value: 1710 },
      { playerId: 21, playerName: "Ja'Marr Chase", teamName: 'Bengals', teamCity: 'Cincinnati', value: 1456 },
      { playerId: 22, playerName: 'Stefon Diggs', teamName: 'Bills', teamCity: 'Buffalo', value: 1389 },
      { playerId: 23, playerName: 'CeeDee Lamb', teamName: 'Cowboys', teamCity: 'Dallas', value: 1324 },
      { playerId: 24, playerName: 'A.J. Brown', teamName: 'Eagles', teamCity: 'Philadelphia', value: 1298 },
    ],
    touchdowns: [
      { playerId: 20, playerName: 'Tyreek Hill', teamName: 'Dolphins', teamCity: 'Miami', value: 13 },
      { playerId: 21, playerName: "Ja'Marr Chase", teamName: 'Bengals', teamCity: 'Cincinnati', value: 12 },
      { playerId: 25, playerName: 'Travis Kelce', teamName: 'Chiefs', teamCity: 'Kansas City', value: 11 },
      { playerId: 22, playerName: 'Stefon Diggs', teamName: 'Bills', teamCity: 'Buffalo', value: 10 },
      { playerId: 26, playerName: 'Davante Adams', teamName: 'Raiders', teamCity: 'Las Vegas', value: 10 },
    ],
    receptions: [
      { playerId: 20, playerName: 'Tyreek Hill', teamName: 'Dolphins', teamCity: 'Miami', value: 119 },
      { playerId: 22, playerName: 'Stefon Diggs', teamName: 'Bills', teamCity: 'Buffalo', value: 108 },
      { playerId: 25, playerName: 'Travis Kelce', teamName: 'Chiefs', teamCity: 'Kansas City', value: 103 },
      { playerId: 21, playerName: "Ja'Marr Chase", teamName: 'Bengals', teamCity: 'Cincinnati', value: 98 },
      { playerId: 23, playerName: 'CeeDee Lamb', teamName: 'Cowboys', teamCity: 'Dallas', value: 95 },
    ],
  },
  defense: {
    sacks: [
      { playerId: 30, playerName: 'Micah Parsons', teamName: 'Cowboys', teamCity: 'Dallas', value: 16.5 },
      { playerId: 31, playerName: 'Nick Bosa', teamName: '49ers', teamCity: 'San Francisco', value: 15.0 },
      { playerId: 32, playerName: 'T.J. Watt', teamName: 'Steelers', teamCity: 'Pittsburgh', value: 14.5 },
      { playerId: 33, playerName: 'Myles Garrett', teamName: 'Browns', teamCity: 'Cleveland', value: 13.5 },
      { playerId: 34, playerName: 'Maxx Crosby', teamName: 'Raiders', teamCity: 'Las Vegas', value: 12.0 },
    ],
    interceptions: [
      { playerId: 40, playerName: 'Sauce Gardner', teamName: 'Jets', teamCity: 'New York', value: 7 },
      { playerId: 41, playerName: 'Tariq Woolen', teamName: 'Seahawks', teamCity: 'Seattle', value: 6 },
      { playerId: 42, playerName: 'Patrick Surtain II', teamName: 'Broncos', teamCity: 'Denver', value: 6 },
      { playerId: 43, playerName: 'Trevon Diggs', teamName: 'Cowboys', teamCity: 'Dallas', value: 5 },
      { playerId: 44, playerName: 'Minkah Fitzpatrick', teamName: 'Steelers', teamCity: 'Pittsburgh', value: 5 },
    ],
  },
};

// Get league leaders
const getLeagueLeaders = {
  name: 'getLeagueLeaders',
  mockRoute: '^/api/leagues-management/([0-9]+)/leaders$',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/leaders/);
        const leagueId = match ? Number(match[1]) : null;

        if (!leagueId) {
          return JSON.stringify({ error: 'League ID required' });
        }

        return JSON.stringify({
          leagueId,
          seasonId: leagueId * 100 + 1,
          ...mockLeagueLeaders,
        });
      },
      notFoundScenario: function (req, res) {
        res.status(404);
        return JSON.stringify({ error: 'League not found', status: 404 });
      },
      emptyScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/leaders/);
        const leagueId = match ? Number(match[1]) : null;

        return JSON.stringify({
          leagueId,
          seasonId: leagueId * 100 + 1,
          passing: { yards: [], touchdowns: [], rating: [] },
          rushing: { yards: [], touchdowns: [], ypc: [] },
          receiving: { yards: [], touchdowns: [], receptions: [] },
          defense: { sacks: [], interceptions: [] },
        });
      },
      errorScenario: function (req, res) {
        res.status(500);
        return JSON.stringify({ error: 'Internal server error', status: 500 });
      },
    },
  ],
};

mocks.push(getLeagueLeaders);

exports.mocks = mocks;
