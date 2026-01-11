/**
 * Shared state for mock server
 * This module provides in-memory state that can be reset between tests
 */
const fs = require('fs');
const path = require('path');

// Load seed data
const seedDataPath = path.join(__dirname, '..', 'data', 'seed.json');
let seedData = {};
try {
  seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
} catch (err) {
  console.warn('Could not load seed data, using defaults');
}

// In-memory state
let leagues = new Map(seedData.leagues?.map(l => [l.id, l]) || []);
let nextLeagueId = Math.max(...Array.from(leagues.keys()), 0) + 1;
let nextConferenceId = 1000;
let nextDivisionId = 2000;
let nextTeamId = 3000;

// Default constraints
const LEAGUE_CONSTRAINTS = seedData.constraints || {
  minConferences: 1,
  maxConferences: 4,
  minDivisionsPerConference: 1,
  maxDivisionsPerConference: 8,
  minTeamsPerDivision: 1,
  maxTeamsPerDivision: 8,
};

// Default mock user
const mockUser = seedData.user || {
  id: 1,
  email: 'testuser@example.com',
  displayName: 'Test User',
  isGlobalAdmin: true,
  createdAt: '2024-01-15T10:00:00Z',
  lastLoginAt: new Date().toISOString(),
  leagueRoles: [
    {
      id: 1,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'Commissioner',
      teamId: null,
      teamName: null,
      assignedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      leagueId: 1,
      leagueName: 'Test League',
      role: 'GeneralManager',
      teamId: 1,
      teamName: 'Falcons',
      assignedAt: '2024-01-15T10:00:00Z',
    },
  ],
};

// Default mock teams
const mockTeams = seedData.teams || [
  {
    id: 1,
    divisionId: 1,
    name: 'Falcons',
    city: 'Atlanta',
    budget: 200000000,
    championships: 0,
    wins: 10,
    losses: 6,
    ties: 0,
    fanSupport: 75,
    chemistry: 80,
  },
  {
    id: 2,
    divisionId: 1,
    name: 'Eagles',
    city: 'Philadelphia',
    budget: 210000000,
    championships: 1,
    wins: 12,
    losses: 4,
    ties: 0,
    fanSupport: 85,
    chemistry: 90,
  },
];

// Default mock game
const mockGame = {
  id: 1,
  homeTeamId: 1,
  awayTeamId: 2,
  homeScore: 24,
  awayScore: 17,
  fieldPosition: 50,
  yardsToGo: 10,
  currentDown: 1,
};

/**
 * Reset all state to initial values from seed data
 */
function resetState() {
  try {
    const data = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    leagues = new Map(data.leagues?.map(l => [l.id, l]) || []);
    nextLeagueId = Math.max(...Array.from(leagues.keys()), 0) + 1;
  } catch (err) {
    leagues = new Map();
    nextLeagueId = 1;
  }
  nextConferenceId = 1000;
  nextDivisionId = 2000;
  nextTeamId = 3000;
}

/**
 * Generate teams for a new division
 */
function generateTeams(count, divisionId) {
  const teams = [];
  for (let i = 1; i <= count; i++) {
    teams.push({
      id: nextTeamId++,
      divisionId,
      name: `Team ${nextTeamId}`,
      city: 'City',
      budget: 100000000,
      championships: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      fanSupport: 50,
      chemistry: 50,
    });
  }
  return teams;
}

/**
 * Generate divisions for a new conference
 */
function generateDivisions(count, teamsPerDivision) {
  const divisions = [];
  for (let i = 1; i <= count; i++) {
    const divisionId = nextDivisionId++;
    divisions.push({
      id: divisionId,
      name: `Division ${divisionId}`,
      teams: generateTeams(teamsPerDivision, divisionId),
    });
  }
  return divisions;
}

// Export state and helpers
module.exports = {
  // State accessors
  getLeagues: () => leagues,
  getLeague: (id) => leagues.get(id),
  setLeague: (id, league) => leagues.set(id, league),

  // ID generators
  getNextLeagueId: () => nextLeagueId++,
  getNextConferenceId: () => nextConferenceId++,
  getNextDivisionId: () => nextDivisionId++,
  getNextTeamId: () => nextTeamId++,

  // Constants
  LEAGUE_CONSTRAINTS,
  mockUser,
  mockTeams,
  mockGame,

  // Helpers
  resetState,
  generateTeams,
  generateDivisions,
};
