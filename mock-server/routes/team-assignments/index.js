const mocks = [];

// Default scenario: Mixed control states (1 active, 1 pending, 1 AI)
const mockTeamAssignments = [
  {
    id: 1,
    teamId: 1,
    teamName: 'Eagles',
    leagueId: 1,
    leagueName: 'Test League',
    email: 'gm1@example.com',
    displayName: 'John Smith',
    controlState: 'HumanControlled',
    hasViewed: true,
    assignedAt: '2024-01-01T00:00:00Z',
    firstViewedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 2,
    teamId: 2,
    teamName: 'Cowboys',
    leagueId: 1,
    leagueName: 'Test League',
    email: 'gm2@example.com',
    displayName: 'Jane Doe',
    controlState: 'Pending',
    hasViewed: false,
    assignedAt: '2024-01-01T00:00:00Z',
    firstViewedAt: null,
  },
  {
    id: 3,
    teamId: 3,
    teamName: 'Giants',
    leagueId: 1,
    leagueName: 'Test League',
    email: null,
    displayName: null,
    controlState: 'AiControlled',
    hasViewed: false,
    assignedAt: null,
    firstViewedAt: null,
  },
];

// Fresh league: All teams AI controlled (no GMs assigned)
const allAiControlled = [
  { id: 1, teamId: 1, teamName: 'Eagles', leagueId: 1, leagueName: 'Test League', email: null, displayName: null, controlState: 'AiControlled', hasViewed: false, assignedAt: null, firstViewedAt: null },
  { id: 2, teamId: 2, teamName: 'Cowboys', leagueId: 1, leagueName: 'Test League', email: null, displayName: null, controlState: 'AiControlled', hasViewed: false, assignedAt: null, firstViewedAt: null },
  { id: 3, teamId: 3, teamName: 'Giants', leagueId: 1, leagueName: 'Test League', email: null, displayName: null, controlState: 'AiControlled', hasViewed: false, assignedAt: null, firstViewedAt: null },
  { id: 4, teamId: 4, teamName: 'Bears', leagueId: 1, leagueName: 'Test League', email: null, displayName: null, controlState: 'AiControlled', hasViewed: false, assignedAt: null, firstViewedAt: null },
];

// Many pending: Commissioner has invited several GMs, none have logged in yet
const manyPending = [
  { id: 1, teamId: 1, teamName: 'Eagles', leagueId: 1, leagueName: 'Test League', email: 'gm1@example.com', displayName: 'John Smith', controlState: 'Pending', hasViewed: false, assignedAt: '2024-01-01T00:00:00Z', firstViewedAt: null },
  { id: 2, teamId: 2, teamName: 'Cowboys', leagueId: 1, leagueName: 'Test League', email: 'gm2@example.com', displayName: 'Jane Doe', controlState: 'Pending', hasViewed: false, assignedAt: '2024-01-01T00:00:00Z', firstViewedAt: null },
  { id: 3, teamId: 3, teamName: 'Giants', leagueId: 1, leagueName: 'Test League', email: 'gm3@example.com', displayName: 'Bob Wilson', controlState: 'Pending', hasViewed: false, assignedAt: '2024-01-02T00:00:00Z', firstViewedAt: null },
  { id: 4, teamId: 4, teamName: 'Bears', leagueId: 1, leagueName: 'Test League', email: null, displayName: null, controlState: 'AiControlled', hasViewed: false, assignedAt: null, firstViewedAt: null },
];

// All active: Full league with all GMs actively managing
const allActive = [
  { id: 1, teamId: 1, teamName: 'Eagles', leagueId: 1, leagueName: 'Test League', email: 'gm1@example.com', displayName: 'John Smith', controlState: 'HumanControlled', hasViewed: true, assignedAt: '2024-01-01T00:00:00Z', firstViewedAt: '2024-01-02T00:00:00Z' },
  { id: 2, teamId: 2, teamName: 'Cowboys', leagueId: 1, leagueName: 'Test League', email: 'gm2@example.com', displayName: 'Jane Doe', controlState: 'HumanControlled', hasViewed: true, assignedAt: '2024-01-01T00:00:00Z', firstViewedAt: '2024-01-03T00:00:00Z' },
  { id: 3, teamId: 3, teamName: 'Giants', leagueId: 1, leagueName: 'Test League', email: 'gm3@example.com', displayName: 'Bob Wilson', controlState: 'HumanControlled', hasViewed: true, assignedAt: '2024-01-02T00:00:00Z', firstViewedAt: '2024-01-04T00:00:00Z' },
  { id: 4, teamId: 4, teamName: 'Bears', leagueId: 1, leagueName: 'Test League', email: 'gm4@example.com', displayName: 'Sarah Jones', controlState: 'HumanControlled', hasViewed: true, assignedAt: '2024-01-03T00:00:00Z', firstViewedAt: '2024-01-05T00:00:00Z' },
];

const mockUserTeams = [
  {
    teamId: 1,
    teamName: 'Eagles',
    leagueId: 1,
    leagueName: 'Test League',
    hasViewed: true,
  },
  {
    teamId: 5,
    teamName: 'Falcons',
    leagueId: 2,
    leagueName: 'Another League',
    hasViewed: false,
  },
];

// Pending user only sees the team they're invited to
const pendingUserTeams = [
  {
    teamId: 6,
    teamName: 'Giants',
    leagueId: 1,
    leagueName: 'Test League',
    hasViewed: false,
    controlState: 'Pending',
  },
];

// User with one new team (first team assigned, hasn't taken control)
const oneTeamNew = [
  {
    teamId: 1,
    teamName: 'Eagles',
    leagueId: 1,
    leagueName: 'Test League',
    hasViewed: false,
    controlState: 'Pending',
  },
];

// User with multiple teams, one is new
const multipleTeamsOneNew = [
  {
    teamId: 1,
    teamName: 'Eagles',
    leagueId: 1,
    leagueName: 'Test League',
    hasViewed: true,
    controlState: 'HumanControlled',
  },
  {
    teamId: 2,
    teamName: 'Cowboys',
    leagueId: 1,
    leagueName: 'Test League',
    hasViewed: true,
    controlState: 'HumanControlled',
  },
  {
    teamId: 3,
    teamName: 'Giants',
    leagueId: 2,
    leagueName: 'Another League',
    hasViewed: false,
    controlState: 'Pending',
  },
];

const getMyTeams = {
  name: 'getMyTeams',
  mockRoute: '/api/users/me/teams',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(mockUserTeams);
      },
      pendingUserScenario: function () {
        return JSON.stringify(pendingUserTeams);
      },
      empty: function () {
        return JSON.stringify([]);
      },
      oneTeamNew: function () {
        return JSON.stringify(oneTeamNew);
      },
      multipleTeamsOneNew: function () {
        return JSON.stringify(multipleTeamsOneNew);
      },
    },
  ],
};

const getLeagueTeamAssignments = {
  name: 'getLeagueTeamAssignments',
  mockRoute: '^/api/leagues/([0-9]+)/team-assignments$',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify(mockTeamAssignments);
      },
      empty: function () {
        return JSON.stringify([]);
      },
      allAiControlled: function () {
        return JSON.stringify(allAiControlled);
      },
      manyPending: function () {
        return JSON.stringify(manyPending);
      },
      allActive: function () {
        return JSON.stringify(allActive);
      },
    },
  ],
};

const getLeagueTeams = {
  name: 'getLeagueTeams',
  mockRoute: '^/api/leagues/([0-9]+)/teams$',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify([
          { id: 1, name: 'Eagles' },
          { id: 2, name: 'Cowboys' },
          { id: 3, name: 'Giants' },
        ]);
      },
      // 4 teams for scenarios that have 4 assignments (allAiControlled, manyPending, allActive)
      fourTeams: function () {
        return JSON.stringify([
          { id: 1, name: 'Eagles' },
          { id: 2, name: 'Cowboys' },
          { id: 3, name: 'Giants' },
          { id: 4, name: 'Bears' },
        ]);
      },
    },
  ],
};

const assignGm = {
  name: 'assignGm',
  mockRoute: '^/api/leagues/([0-9]+)/teams/([0-9]+)/assign$',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const body = req.body || {};
        return JSON.stringify({
          id: 99,
          teamId: 3,
          teamName: 'Giants',
          leagueId: 1,
          leagueName: 'Test League',
          email: body.email || 'new@example.com',
          displayName: body.displayName || 'New GM',
          controlState: 'Pending',
          hasViewed: false,
          assignedAt: new Date().toISOString(),
          firstViewedAt: null,
        });
      },
      error: function () {
        return JSON.stringify({ error: 'Failed to assign GM' });
      },
    },
  ],
};

const selfAssign = {
  name: 'selfAssign',
  mockRoute: '^/api/leagues/([0-9]+)/teams/([0-9]+)/self-assign$',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({
          id: 99,
          teamId: 3,
          teamName: 'Giants',
          leagueId: 1,
          leagueName: 'Test League',
          email: 'commissioner@example.com',
          displayName: 'Commissioner',
          controlState: 'HumanControlled',
          hasViewed: true,
          assignedAt: new Date().toISOString(),
          firstViewedAt: new Date().toISOString(),
        });
      },
    },
  ],
};

const removeAssignment = {
  name: 'removeAssignment',
  mockRoute: '^/api/leagues/([0-9]+)/teams/([0-9]+)/assignment$',
  method: 'DELETE',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({ success: true });
      },
    },
  ],
};

const takeControl = {
  name: 'takeControl',
  mockRoute: '^/api/teams/([0-9]+)/take-control$',
  method: 'POST',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function () {
        return JSON.stringify({
          id: 2,
          teamId: 5,
          teamName: 'Falcons',
          leagueId: 2,
          leagueName: 'Another League',
          email: 'user@example.com',
          displayName: 'Current User',
          controlState: 'HumanControlled',
          hasViewed: true,
          assignedAt: '2024-01-01T00:00:00Z',
          firstViewedAt: new Date().toISOString(),
        });
      },
    },
  ],
};

mocks.push(getMyTeams);
mocks.push(getLeagueTeamAssignments);
mocks.push(getLeagueTeams);
mocks.push(assignGm);
mocks.push(selfAssign);
mocks.push(removeAssignment);
mocks.push(takeControl);

exports.mocks = mocks;
