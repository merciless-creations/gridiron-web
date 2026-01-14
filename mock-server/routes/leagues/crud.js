/**
 * League CRUD routes
 * - GET /api/leagues-management - List all leagues
 * - POST /api/leagues-management - Create league
 * - GET /api/leagues-management/:id - Get single league
 * - PUT /api/leagues-management/:id - Update league
 */
const state = require('../../state');

const mocks = [];

// ============================================================================
// SCENARIO DATA - Different league shapes for E2E testing
// ============================================================================

/**
 * Fully filled league: 2 conferences, 4 divisions each, 4 teams per division = 32 teams
 * Tests that UI renders all sections correctly when fully populated
 */
const fullyFilledLeagueData = {
  id: 1,
  name: 'National Football League',
  season: 2024,
  totalTeams: 32,
  totalConferences: 2,
  isActive: true,
  conferences: [
    {
      id: 100,
      name: 'AFC',
      leagueId: 1,
      divisions: [
        {
          id: 200,
          name: 'AFC East',
          conferenceId: 100,
          teams: [
            { id: 1, name: 'Buffalo Bills', divisionId: 200 },
            { id: 2, name: 'Miami Dolphins', divisionId: 200 },
            { id: 3, name: 'New England Patriots', divisionId: 200 },
            { id: 4, name: 'New York Jets', divisionId: 200 },
          ],
        },
        {
          id: 201,
          name: 'AFC North',
          conferenceId: 100,
          teams: [
            { id: 5, name: 'Baltimore Ravens', divisionId: 201 },
            { id: 6, name: 'Cincinnati Bengals', divisionId: 201 },
            { id: 7, name: 'Cleveland Browns', divisionId: 201 },
            { id: 8, name: 'Pittsburgh Steelers', divisionId: 201 },
          ],
        },
        {
          id: 202,
          name: 'AFC South',
          conferenceId: 100,
          teams: [
            { id: 9, name: 'Houston Texans', divisionId: 202 },
            { id: 10, name: 'Indianapolis Colts', divisionId: 202 },
            { id: 11, name: 'Jacksonville Jaguars', divisionId: 202 },
            { id: 12, name: 'Tennessee Titans', divisionId: 202 },
          ],
        },
        {
          id: 203,
          name: 'AFC West',
          conferenceId: 100,
          teams: [
            { id: 13, name: 'Denver Broncos', divisionId: 203 },
            { id: 14, name: 'Kansas City Chiefs', divisionId: 203 },
            { id: 15, name: 'Las Vegas Raiders', divisionId: 203 },
            { id: 16, name: 'Los Angeles Chargers', divisionId: 203 },
          ],
        },
      ],
    },
    {
      id: 101,
      name: 'NFC',
      leagueId: 1,
      divisions: [
        {
          id: 204,
          name: 'NFC East',
          conferenceId: 101,
          teams: [
            { id: 17, name: 'Dallas Cowboys', divisionId: 204 },
            { id: 18, name: 'New York Giants', divisionId: 204 },
            { id: 19, name: 'Philadelphia Eagles', divisionId: 204 },
            { id: 20, name: 'Washington Commanders', divisionId: 204 },
          ],
        },
        {
          id: 205,
          name: 'NFC North',
          conferenceId: 101,
          teams: [
            { id: 21, name: 'Chicago Bears', divisionId: 205 },
            { id: 22, name: 'Detroit Lions', divisionId: 205 },
            { id: 23, name: 'Green Bay Packers', divisionId: 205 },
            { id: 24, name: 'Minnesota Vikings', divisionId: 205 },
          ],
        },
        {
          id: 206,
          name: 'NFC South',
          conferenceId: 101,
          teams: [
            { id: 25, name: 'Atlanta Falcons', divisionId: 206 },
            { id: 26, name: 'Carolina Panthers', divisionId: 206 },
            { id: 27, name: 'New Orleans Saints', divisionId: 206 },
            { id: 28, name: 'Tampa Bay Buccaneers', divisionId: 206 },
          ],
        },
        {
          id: 207,
          name: 'NFC West',
          conferenceId: 101,
          teams: [
            { id: 29, name: 'Arizona Cardinals', divisionId: 207 },
            { id: 30, name: 'Los Angeles Rams', divisionId: 207 },
            { id: 31, name: 'San Francisco 49ers', divisionId: 207 },
            { id: 32, name: 'Seattle Seahawks', divisionId: 207 },
          ],
        },
      ],
    },
  ],
};

/**
 * Lopsided league: AFC has 3 divisions, NFC has 1 division
 * Tests that UI handles uneven conference structures
 */
const lopsidedLeagueData = {
  id: 2,
  name: 'Lopsided League',
  season: 2024,
  totalTeams: 16,
  totalConferences: 2,
  isActive: true,
  conferences: [
    {
      id: 110,
      name: 'Big Conference',
      leagueId: 2,
      divisions: [
        {
          id: 210,
          name: 'Division Alpha',
          conferenceId: 110,
          teams: [
            { id: 101, name: 'Alpha Team 1', divisionId: 210 },
            { id: 102, name: 'Alpha Team 2', divisionId: 210 },
            { id: 103, name: 'Alpha Team 3', divisionId: 210 },
            { id: 104, name: 'Alpha Team 4', divisionId: 210 },
          ],
        },
        {
          id: 211,
          name: 'Division Beta',
          conferenceId: 110,
          teams: [
            { id: 105, name: 'Beta Team 1', divisionId: 211 },
            { id: 106, name: 'Beta Team 2', divisionId: 211 },
            { id: 107, name: 'Beta Team 3', divisionId: 211 },
            { id: 108, name: 'Beta Team 4', divisionId: 211 },
          ],
        },
        {
          id: 212,
          name: 'Division Gamma',
          conferenceId: 110,
          teams: [
            { id: 109, name: 'Gamma Team 1', divisionId: 212 },
            { id: 110, name: 'Gamma Team 2', divisionId: 212 },
            { id: 111, name: 'Gamma Team 3', divisionId: 212 },
            { id: 112, name: 'Gamma Team 4', divisionId: 212 },
          ],
        },
      ],
    },
    {
      id: 111,
      name: 'Small Conference',
      leagueId: 2,
      divisions: [
        {
          id: 213,
          name: 'Only Division',
          conferenceId: 111,
          teams: [
            { id: 113, name: 'Solo Team 1', divisionId: 213 },
            { id: 114, name: 'Solo Team 2', divisionId: 213 },
            { id: 115, name: 'Solo Team 3', divisionId: 213 },
            { id: 116, name: 'Solo Team 4', divisionId: 213 },
          ],
        },
      ],
    },
  ],
};

/**
 * Empty league: No conferences yet
 * Tests that UI shows empty state / "Add your first conference" message
 */
const emptyLeagueData = {
  id: 3,
  name: 'Empty League',
  season: 2024,
  totalTeams: 0,
  totalConferences: 0,
  isActive: true,
  conferences: [],
};

/**
 * League with simulation in progress
 * Tests that UI shows lock banner and disables roster controls
 */
const simulationLockedLeagueData = {
  id: 1,
  name: 'Test League',
  season: 2024,
  totalTeams: 4,
  totalConferences: 1,
  isActive: true,
  simulationInProgress: true,
  simulationStartedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  simulationStartedByUserName: 'Commissioner Bob',
  conferences: [
    {
      id: 100,
      name: 'Test Conference',
      leagueId: 1,
      divisions: [
        {
          id: 200,
          name: 'Test Division',
          conferenceId: 100,
          teams: [
            { id: 1, name: 'Eagles', divisionId: 200 },
            { id: 2, name: 'Bears', divisionId: 200 },
            { id: 3, name: 'Lions', divisionId: 200 },
            { id: 4, name: 'Vikings', divisionId: 200 },
          ],
        },
      ],
    },
  ],
};

/**
 * League with no simulation (unlocked)
 * Tests that UI allows roster changes when not locked
 */
const simulationUnlockedLeagueData = {
  id: 1,
  name: 'Test League',
  season: 2024,
  totalTeams: 4,
  totalConferences: 1,
  isActive: true,
  simulationInProgress: false,
  simulationStartedAt: null,
  simulationStartedByUserName: null,
  conferences: [
    {
      id: 100,
      name: 'Test Conference',
      leagueId: 1,
      divisions: [
        {
          id: 200,
          name: 'Test Division',
          conferenceId: 100,
          teams: [
            { id: 1, name: 'Eagles', divisionId: 200 },
            { id: 2, name: 'Bears', divisionId: 200 },
            { id: 3, name: 'Lions', divisionId: 200 },
            { id: 4, name: 'Vikings', divisionId: 200 },
          ],
        },
      ],
    },
  ],
};

// ============================================================================

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
      empty: function () {
        return JSON.stringify([]);
      },
    },
  ],
};

// Create a new league
const createLeague = {
  name: 'createLeague',
  mockRoute: new RegExp(`^/api/leagues-management$`).source,
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        const leagueId = state.getNextLeagueId();

        // Build conference/division/team structure based on request
        const numConferences = body.numberOfConferences || 2;
        const divisionsPerConference = body.divisionsPerConference || 4;
        const teamsPerDivision = body.teamsPerDivision || 4;

        const conferences = [];
        let teamId = 1;
        let divisionId = 1;

        for (let c = 1; c <= numConferences; c++) {
          const divisions = [];
          for (let d = 1; d <= divisionsPerConference; d++) {
            const teams = [];
            for (let t = 1; t <= teamsPerDivision; t++) {
              teams.push({
                id: teamId++,
                name: `City ${c}-${d}-${t} Team ${t}`,
                city: `City ${c}-${d}-${t}`,
                abbreviation: `T${teamId - 1}`,
                divisionId: divisionId,
              });
            }
            divisions.push({
              id: divisionId++,
              name: `Division ${c}-${d}`,
              conferenceId: c,
              teams,
            });
          }
          conferences.push({
            id: c,
            name: `Conference ${c}`,
            leagueId,
            divisions,
          });
        }

        const totalTeams = numConferences * divisionsPerConference * teamsPerDivision;

        const newLeague = {
          id: leagueId,
          name: body.name,
          season: new Date().getFullYear(),
          totalTeams,
          totalConferences: numConferences,
          isActive: true,
          conferences,
          // Playoff settings from request
          playoffTeamsPerConference: body.playoffTeamsPerConference || 7,
          divisionWinnersAutoQualify: body.divisionWinnersAutoQualify ?? true,
          byeWeekForTopSeed: body.byeWeekForTopSeed ?? true,
        };
        state.setLeague(newLeague.id, newLeague);
        return JSON.stringify(newLeague);
      },
    },
  ],
};

// Get a single league by ID
// Supports multiple scenarios for E2E testing:
// - defaultScenario: Returns league from state (dynamic)
// - fullyFilledLeague: Returns a full NFL-style league (32 teams)
// - lopsidedLeague: Returns uneven conference structure
// - emptyLeague: Returns league with no conferences
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
    {
      fullyFilledLeague: function () {
        return JSON.stringify(fullyFilledLeagueData);
      },
    },
    {
      lopsidedLeague: function () {
        return JSON.stringify(lopsidedLeagueData);
      },
    },
    {
      emptyLeague: function () {
        return JSON.stringify(emptyLeagueData);
      },
    },
    {
      simulationLocked: function () {
        return JSON.stringify(simulationLockedLeagueData);
      },
    },
    {
      simulationUnlocked: function () {
        return JSON.stringify(simulationUnlockedLeagueData);
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
