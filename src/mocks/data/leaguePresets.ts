import type { LeagueDetail, CreateLeagueRequest, LeagueConstraints } from '../../types/League';

/**
 * League structure presets for testing different configurations
 */

export const LEAGUE_CONSTRAINTS: LeagueConstraints = {
  minConferences: 1,
  maxConferences: 4,
  minDivisionsPerConference: 1,
  maxDivisionsPerConference: 8,
  minTeamsPerDivision: 1,
  maxTeamsPerDivision: 8,
};

export const NFL_PRESET: CreateLeagueRequest = {
  name: 'National Football League',
  numberOfConferences: 2,
  divisionsPerConference: 4,
  teamsPerDivision: 4,
};

export const SMALL_LEAGUE_PRESET: CreateLeagueRequest = {
  name: 'Small League',
  numberOfConferences: 1,
  divisionsPerConference: 2,
  teamsPerDivision: 4,
};

export const LARGE_LEAGUE_PRESET: CreateLeagueRequest = {
  name: 'Mega League',
  numberOfConferences: 4,
  divisionsPerConference: 8,
  teamsPerDivision: 8,
};

export const SINGLE_CONFERENCE_PRESET: CreateLeagueRequest = {
  name: 'Single Conference League',
  numberOfConferences: 1,
  divisionsPerConference: 4,
  teamsPerDivision: 6,
};

/**
 * Active preset for mock data generation
 * Change this to test different league configurations
 */
export const ACTIVE_PRESET = NFL_PRESET;

/**
 * Generate a mock league structure based on a preset
 */
export function generateMockLeague(
  preset: CreateLeagueRequest,
  startId: number = 1
): LeagueDetail {
  let currentId = startId;
  const conferences = [];

  for (let c = 1; c <= preset.numberOfConferences; c++) {
    const divisions = [];

    for (let d = 1; d <= preset.divisionsPerConference; d++) {
      const teams = [];

      for (let t = 1; t <= preset.teamsPerDivision; t++) {
        const teamNumber = (c - 1) * preset.divisionsPerConference * preset.teamsPerDivision +
                          (d - 1) * preset.teamsPerDivision +
                          t;

        teams.push({
          id: currentId++,
          name: `Team ${teamNumber}`,
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

      divisions.push({
        id: currentId++,
        name: `Division ${d}`,
        teams,
      });
    }

    conferences.push({
      id: currentId++,
      name: `Conference ${c}`,
      divisions,
    });
  }

  const totalTeams = preset.numberOfConferences * 
                     preset.divisionsPerConference * 
                     preset.teamsPerDivision;

  return {
    id: startId,
    name: preset.name,
    season: new Date().getFullYear(),
    isActive: true,
    totalConferences: preset.numberOfConferences,
    totalTeams,
    conferences,
  };
}

/**
 * Generate NFL-style league with realistic names
 */
export function generateNFLStyleLeague(id: number = 1): LeagueDetail {
  return {
    id,
    name: 'National Football League',
    season: 2024,
    isActive: true,
    totalConferences: 2,
    totalTeams: 32,
    conferences: [
      {
        id: 100,
        name: 'AFC',
        divisions: [
          {
            id: 200,
            name: 'North',
            teams: [
              { id: 1, name: 'Ravens', city: 'Baltimore', budget: 100000000, championships: 2, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
              { id: 2, name: 'Bengals', city: 'Cincinnati', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 75 },
              { id: 3, name: 'Browns', city: 'Cleveland', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 70 },
              { id: 4, name: 'Steelers', city: 'Pittsburgh', budget: 100000000, championships: 6, wins: 0, losses: 0, ties: 0, fanSupport: 90, chemistry: 85 },
            ],
          },
          {
            id: 201,
            name: 'South',
            teams: [
              { id: 5, name: 'Texans', city: 'Houston', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
              { id: 6, name: 'Colts', city: 'Indianapolis', budget: 100000000, championships: 2, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
              { id: 7, name: 'Jaguars', city: 'Jacksonville', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 65, chemistry: 60 },
              { id: 8, name: 'Titans', city: 'Tennessee', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
            ],
          },
          {
            id: 202,
            name: 'East',
            teams: [
              { id: 9, name: 'Bills', city: 'Buffalo', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
              { id: 10, name: 'Dolphins', city: 'Miami', budget: 100000000, championships: 2, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
              { id: 11, name: 'Patriots', city: 'New England', budget: 100000000, championships: 6, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
              { id: 12, name: 'Jets', city: 'New York', budget: 100000000, championships: 1, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
            ],
          },
          {
            id: 203,
            name: 'West',
            teams: [
              { id: 13, name: 'Broncos', city: 'Denver', budget: 100000000, championships: 3, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
              { id: 14, name: 'Chiefs', city: 'Kansas City', budget: 100000000, championships: 3, wins: 0, losses: 0, ties: 0, fanSupport: 90, chemistry: 85 },
              { id: 15, name: 'Raiders', city: 'Las Vegas', budget: 100000000, championships: 3, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
              { id: 16, name: 'Chargers', city: 'Los Angeles', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
            ],
          },
        ],
      },
      {
        id: 101,
        name: 'NFC',
        divisions: [
          {
            id: 204,
            name: 'North',
            teams: [
              { id: 17, name: 'Bears', city: 'Chicago', budget: 100000000, championships: 1, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
              { id: 18, name: 'Lions', city: 'Detroit', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
              { id: 19, name: 'Packers', city: 'Green Bay', budget: 100000000, championships: 4, wins: 0, losses: 0, ties: 0, fanSupport: 90, chemistry: 85 },
              { id: 20, name: 'Vikings', city: 'Minnesota', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
            ],
          },
          {
            id: 205,
            name: 'South',
            teams: [
              { id: 21, name: 'Falcons', city: 'Atlanta', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
              { id: 22, name: 'Panthers', city: 'Carolina', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 65, chemistry: 60 },
              { id: 23, name: 'Saints', city: 'New Orleans', budget: 100000000, championships: 1, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
              { id: 24, name: 'Buccaneers', city: 'Tampa Bay', budget: 100000000, championships: 2, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
            ],
          },
          {
            id: 206,
            name: 'East',
            teams: [
              { id: 25, name: 'Cowboys', city: 'Dallas', budget: 100000000, championships: 5, wins: 0, losses: 0, ties: 0, fanSupport: 95, chemistry: 90 },
              { id: 26, name: 'Giants', city: 'New York', budget: 100000000, championships: 4, wins: 0, losses: 0, ties: 0, fanSupport: 80, chemistry: 75 },
              { id: 27, name: 'Eagles', city: 'Philadelphia', budget: 100000000, championships: 1, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
              { id: 28, name: 'Commanders', city: 'Washington', budget: 100000000, championships: 3, wins: 0, losses: 0, ties: 0, fanSupport: 70, chemistry: 65 },
            ],
          },
          {
            id: 207,
            name: 'West',
            teams: [
              { id: 29, name: 'Cardinals', city: 'Arizona', budget: 100000000, championships: 0, wins: 0, losses: 0, ties: 0, fanSupport: 65, chemistry: 60 },
              { id: 30, name: 'Rams', city: 'Los Angeles', budget: 100000000, championships: 2, wins: 0, losses: 0, ties: 0, fanSupport: 75, chemistry: 70 },
              { id: 31, name: '49ers', city: 'San Francisco', budget: 100000000, championships: 5, wins: 0, losses: 0, ties: 0, fanSupport: 90, chemistry: 85 },
              { id: 32, name: 'Seahawks', city: 'Seattle', budget: 100000000, championships: 1, wins: 0, losses: 0, ties: 0, fanSupport: 85, chemistry: 80 },
            ],
          },
        ],
      },
    ],
  };
}
