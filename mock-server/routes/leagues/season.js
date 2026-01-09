/**
 * Season routes (season, standings, schedule)
 * - GET /api/leagues-management/:leagueId/season - Get season info
 * - GET /api/leagues-management/:leagueId/standings - Get standings
 * - GET /api/leagues-management/:leagueId/schedule - Get schedule
 * - POST /api/leagues-management/:leagueId/generate-schedule - Generate schedule
 * - POST /api/leagues-management/:leagueId/advance-week - Advance week
 * - POST /api/leagues-management/:leagueId/process-year-end - Process year end
 */
const state = require('../../state');

const mocks = [];

// Mock standings data generator
function generateStandingsData(leagueId) {
  const league = state.getLeague(leagueId);
  if (!league || !league.conferences || league.conferences.length === 0) {
    return null;
  }

  const conferences = league.conferences.map(conf => ({
    conferenceId: conf.id,
    conferenceName: conf.name,
    divisions: (conf.divisions || []).map(div => ({
      divisionId: div.id,
      divisionName: div.name,
      conferenceId: conf.id,
      conferenceName: conf.name,
      teams: (div.teams || []).map((team, idx) => {
        // Generate semi-random but consistent stats based on team id
        const seed = team.id * 7;
        const wins = Math.floor((seed % 13) + 3); // 3-15 wins
        const losses = 17 - wins;
        const ties = 0;
        const winPct = wins / (wins + losses + ties);
        const ppg = 20 + (seed % 15);
        const papg = 18 + ((seed * 3) % 14);
        const pf = ppg * (wins + losses);
        const pa = papg * (wins + losses);

        return {
          teamId: team.id,
          teamName: team.name.split(' ').pop() || team.name, // Get last word as team name
          teamCity: team.name.split(' ').slice(0, -1).join(' ') || 'City', // Everything before last word
          divisionId: div.id,
          divisionName: div.name,
          conferenceId: conf.id,
          conferenceName: conf.name,
          wins,
          losses,
          ties,
          winPercentage: winPct,
          pointsFor: pf,
          pointsAgainst: pa,
          pointDifferential: pf - pa,
          divisionWins: Math.floor(wins * 0.35),
          divisionLosses: Math.floor(losses * 0.35),
          conferenceWins: Math.floor(wins * 0.6),
          conferenceLosses: Math.floor(losses * 0.6),
          streak: winPct > 0.5 ? `W${1 + (seed % 4)}` : `L${1 + (seed % 3)}`,
          lastFive: `${Math.min(wins, 5)}-${Math.min(losses, 5)}`,
        };
      }).sort((a, b) => b.winPercentage - a.winPercentage),
    })),
  }));

  return {
    seasonId: leagueId * 100 + 1,
    year: new Date().getFullYear(),
    currentWeek: 10,
    conferences,
  };
}

// Get season info
const getSeason = {
  name: 'getSeason',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/season$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/season/);
        const leagueId = match ? Number(match[1]) : null;
        const league = leagueId ? state.getLeague(leagueId) : null;

        if (!league) {
          return JSON.stringify({ error: 'League not found' });
        }

        return JSON.stringify({
          id: leagueId * 100 + 1,
          leagueId: leagueId,
          year: new Date().getFullYear(),
          currentWeek: 10,
          totalWeeks: 18,
          phase: 'regular',
          isComplete: false,
        });
      },
    },
  ],
};

// Get standings
const getStandings = {
  name: 'getStandings',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/standings$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/standings/);
        const leagueId = match ? Number(match[1]) : null;

        if (!leagueId) {
          return JSON.stringify({ error: 'League ID required' });
        }

        const standings = generateStandingsData(leagueId);
        if (!standings) {
          return JSON.stringify({ error: 'No standings data available' });
        }

        return JSON.stringify(standings);
      },
    },
  ],
};

// Get schedule
const getSchedule = {
  name: 'getSchedule',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/schedule$`).source,
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/schedule/);
        const leagueId = match ? Number(match[1]) : null;

        if (!leagueId) {
          return JSON.stringify({ error: 'League ID required' });
        }

        // Generate mock schedule
        const weeks = [];
        for (let w = 1; w <= 18; w++) {
          weeks.push({
            week: w,
            games: [],
            isCurrent: w === 10,
            isComplete: w < 10,
          });
        }

        return JSON.stringify({
          seasonId: leagueId * 100 + 1,
          year: new Date().getFullYear(),
          currentWeek: 10,
          weeks,
        });
      },
    },
  ],
};

// Generate schedule
const generateSchedule = {
  name: 'generateSchedule',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/generate-schedule`).source,
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/generate-schedule/);
        const leagueId = match ? Number(match[1]) : null;

        return JSON.stringify({
          seasonId: leagueId * 100 + 1,
          totalGames: 272,
          totalWeeks: 18,
        });
      },
    },
  ],
};

// Advance week
const advanceWeek = {
  name: 'advanceWeek',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/advance-week$`).source,
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({
          previousWeek: 10,
          currentWeek: 11,
          gamesSimulated: 16,
          seasonComplete: false,
        });
      },
    },
  ],
};

// Process year end
const processYearEnd = {
  name: 'processYearEnd',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/process-year-end$`).source,
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/process-year-end/);
        const leagueId = match ? Number(match[1]) : null;

        return JSON.stringify({
          newSeasonId: leagueId * 100 + 2,
          newYear: new Date().getFullYear() + 1,
          playersProgressed: 1700,
          playersRetired: 42,
        });
      },
    },
  ],
};

mocks.push(getSeason);
mocks.push(getStandings);
mocks.push(getSchedule);
mocks.push(generateSchedule);
mocks.push(advanceWeek);
mocks.push(processYearEnd);

exports.mocks = mocks;
