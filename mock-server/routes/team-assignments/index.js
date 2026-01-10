const mocks = [];

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
    },
  ],
};

const getLeagueTeamAssignments = {
  name: 'getLeagueTeamAssignments',
  mockRoute: '^/api/leagues/([0-9]+)/teams/assignments$',
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
