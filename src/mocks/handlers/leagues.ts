import { http, HttpResponse } from 'msw';
import type { LeagueDetail, CreateLeagueRequest } from '../../types/League';

// In-memory league storage
const leagues = new Map<number, LeagueDetail>();
let nextLeagueId = 1;

function generateEmptyLeague(id: number, request: CreateLeagueRequest): LeagueDetail {
  return {
    id,
    name: request.name,
    season: new Date().getFullYear(),
    totalTeams: 0,
    totalConferences: 0,
    totalDivisions: 0,
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
];
