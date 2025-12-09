import { http, HttpResponse } from 'msw';
import type { LeagueDetail, CreateLeagueRequest } from '../../types/League';

// Seed data for tests
const seedLeagues: LeagueDetail[] = [
  {
    id: 1,
    name: 'Test League',
    season: 2024,
    totalTeams: 8,
    totalConferences: 2,
    isActive: true,
    conferences: [
      {
        id: 1,
        name: 'Conference A',
        divisions: [
          { id: 1, name: 'Division 1', teams: [] },
          { id: 2, name: 'Division 2', teams: [] },
        ],
      },
      {
        id: 2,
        name: 'Conference B',
        divisions: [
          { id: 3, name: 'Division 3', teams: [] },
          { id: 4, name: 'Division 4', teams: [] },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Another League',
    season: 2024,
    totalTeams: 16,
    totalConferences: 2,
    isActive: true,
    conferences: [
      {
        id: 3,
        name: 'NFC',
        divisions: [
          { id: 5, name: 'North', teams: [] },
          { id: 6, name: 'South', teams: [] },
        ],
      },
      {
        id: 4,
        name: 'AFC',
        divisions: [
          { id: 7, name: 'East', teams: [] },
          { id: 8, name: 'West', teams: [] },
        ],
      },
    ],
  },
];

// In-memory league storage - seeded with initial data
let leagues = new Map<number, LeagueDetail>(
  seedLeagues.map(league => [league.id, league])
);
let nextLeagueId = seedLeagues.length + 1;

// Reset function to restore initial state (for tests)
export function resetLeagueState() {
  leagues = new Map<number, LeagueDetail>(
    seedLeagues.map(league => [league.id, { ...league }])
  );
  nextLeagueId = seedLeagues.length + 1;
}

function generateEmptyLeague(id: number, request: CreateLeagueRequest): LeagueDetail {
  return {
    id,
    name: request.name,
    season: new Date().getFullYear(),
    totalTeams: 0,
    totalConferences: 0,
    isActive: true,
    conferences: [],
  };
}

export const leagueHandlers = [
  /**
   * POST /api/leagues-management
   * Create a new league
   */
  http.post<never, CreateLeagueRequest>(
    '/api/leagues-management',
    async ({ request }) => {
      const body = await request.json();
      
      const newLeague = generateEmptyLeague(nextLeagueId++, body);
      leagues.set(newLeague.id, newLeague);
      
      return HttpResponse.json(newLeague, { status: 201 });
    }
  ),

  /**
   * GET /api/leagues-management/:id
   * Get league details by ID
   */
  http.get<{ id: string }>(
    '/api/leagues-management/:id',
    ({ params }) => {
      const id = Number(params.id);
      const league = leagues.get(id);
      
      if (!league) {
        return HttpResponse.json(
          { error: 'League not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json(league);
    }
  ),

  /**
   * GET /api/leagues-management
   * List all leagues
   */
  http.get('/api/leagues-management', () => {
    return HttpResponse.json(Array.from(leagues.values()));
  }),

  /**
   * PUT /api/leagues-management/:id
   * Update league details
   */
  http.put<{ id: string }>(
    '/api/leagues-management/:id',
    async ({ params, request }) => {
      const id = Number(params.id);
      const league = leagues.get(id);

      if (!league) {
        return HttpResponse.json(
          { error: 'League not found' },
          { status: 404 }
        );
      }

      const updates = await request.json() as Partial<LeagueDetail>;
      const updatedLeague = { ...league, ...updates };
      leagues.set(id, updatedLeague);

      return HttpResponse.json(updatedLeague);
    }
  ),
];
