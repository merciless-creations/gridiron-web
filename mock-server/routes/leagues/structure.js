/**
 * League structure routes (conferences, divisions, teams)
 * - POST /api/leagues-management/:leagueId/conferences
 * - DELETE /api/leagues-management/conferences/:conferenceId
 * - POST /api/leagues-management/conferences/:conferenceId/divisions
 * - DELETE /api/leagues-management/divisions/:divisionId
 * - POST /api/leagues-management/divisions/:divisionId/teams
 * - DELETE /api/leagues-management/teams/:teamId
 * - POST /api/leagues-management/:id/populate-rosters
 */
const state = require('../../state');

const mocks = [];

// Add conference to league
const addConference = {
  name: 'addConference',
  mockRoute: '/api/leagues-management/:leagueId/conferences',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        if (!body.name || body.numberOfDivisions <= 0 || body.teamsPerDivision <= 0) {
          return JSON.stringify({ error: 'Invalid request parameters' });
        }
        const conference = {
          id: state.getNextConferenceId(),
          name: body.name,
          divisions: state.generateDivisions(body.numberOfDivisions, body.teamsPerDivision),
        };
        return JSON.stringify(conference);
      },
    },
  ],
};

// Delete conference
const deleteConference = {
  name: 'deleteConference',
  mockRoute: '/api/leagues-management/conferences/:conferenceId',
  method: 'DELETE',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({
          success: true,
          totalEntitiesDeleted: 21,
          deletedByType: { Conference: 1, Division: 4, Team: 16 },
        });
      },
    },
  ],
};

// Add division to conference
const addDivision = {
  name: 'addDivision',
  mockRoute: '/api/leagues-management/conferences/:conferenceId/divisions',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        if (!body.name || body.numberOfTeams <= 0) {
          return JSON.stringify({ error: 'Invalid request parameters' });
        }
        const divisionId = state.getNextDivisionId();
        const division = {
          id: divisionId,
          name: body.name,
          teams: state.generateTeams(body.numberOfTeams, divisionId),
        };
        return JSON.stringify(division);
      },
    },
  ],
};

// Delete division
const deleteDivision = {
  name: 'deleteDivision',
  mockRoute: '/api/leagues-management/divisions/:divisionId',
  method: 'DELETE',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({
          success: true,
          totalEntitiesDeleted: 5,
          deletedByType: { Division: 1, Team: 4 },
        });
      },
    },
  ],
};

// Add team to division
const addTeam = {
  name: 'addTeam',
  mockRoute: '/api/leagues-management/divisions/:divisionId/teams',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body;
        const teamId = state.getNextTeamId();
        const team = {
          id: teamId,
          divisionId: Number(req.params.divisionId),
          name: body.name || `Team ${teamId}`,
          city: body.city || 'City',
          budget: 100000000,
          championships: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          fanSupport: 50,
          chemistry: 50,
        };
        return JSON.stringify(team);
      },
    },
  ],
};

// Delete team
const deleteTeam = {
  name: 'deleteTeam',
  mockRoute: '/api/leagues-management/teams/:teamId',
  method: 'DELETE',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({
          success: true,
          totalEntitiesDeleted: 1,
          deletedByType: { Team: 1 },
        });
      },
    },
  ],
};

// Populate rosters
const populateRosters = {
  name: 'populateRosters',
  mockRoute: new RegExp(`^/api/leagues-management/([0-9]+)/populate-rosters$`).source,
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const match = req.originalUrl.match(/\/api\/leagues-management\/(\d+)\/populate-rosters/);
        const id = match ? Number(match[1]) : null;
        const league = id ? state.getLeague(id) : null;
        if (!league) {
          return JSON.stringify({ error: 'League not found' });
        }
        return JSON.stringify({
          id: league.id,
          name: league.name,
          totalTeams: league.totalTeams,
        });
      },
    },
  ],
};

mocks.push(addConference);
mocks.push(deleteConference);
mocks.push(addDivision);
mocks.push(deleteDivision);
mocks.push(addTeam);
mocks.push(deleteTeam);
mocks.push(populateRosters);

exports.mocks = mocks;
