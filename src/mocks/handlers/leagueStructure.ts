import { http, HttpResponse } from 'msw';
import type {
  Conference,
  Division,
  AddConferenceRequest,
  AddDivisionRequest,
  AddTeamRequest,
  CascadeDeleteResult,
} from '../../types/League';
import type { Team } from '../../types/Team';

// In-memory counters for generating IDs
let nextConferenceId = 1000;
let nextDivisionId = 2000;
let nextTeamId = 3000;

/**
 * Generate placeholder teams for a division
 */
function generateTeams(count: number, divisionId: number): Team[] {
  const teams: Team[] = [];
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
 * Generate placeholder divisions for a conference
 */
function generateDivisions(count: number, teamsPerDivision: number): Division[] {
  const divisions: Division[] = [];
  for (let i = 1; i <= count; i++) {
    const divisionId = nextDivisionId++;
    divisions.push({
      id: divisionId,
      name: `Division ${nextDivisionId}`,
      teams: generateTeams(teamsPerDivision, divisionId),
    });
  }
  return divisions;
}

export const leagueStructureHandlers = [
  /**
   * POST /api/leagues-management/{leagueId}/conferences
   * Add a new conference to a league
   */
  http.post<{ leagueId: string }, AddConferenceRequest>(
    '/api/leagues-management/:leagueId/conferences',
    async ({ request }) => {
      const body = await request.json();
      
      // Validate request
      if (!body.name || body.numberOfDivisions <= 0 || body.teamsPerDivision <= 0) {
        return HttpResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400 }
        );
      }

      const conference: Conference = {
        id: nextConferenceId++,
        name: body.name,
        divisions: generateDivisions(body.numberOfDivisions, body.teamsPerDivision),
      };

      return HttpResponse.json(conference, { status: 201 });
    }
  ),

  /**
   * DELETE /api/leagues-management/conferences/{conferenceId}
   * Delete a conference (cascade)
   */
  http.delete<{ conferenceId: string }>(
    '/api/leagues-management/conferences/:conferenceId',
    () => {
      // Simulate cascade delete
      const result: CascadeDeleteResult = {
        success: true,
        totalEntitiesDeleted: 21, // 1 conference + 4 divisions + 16 teams (example)
        deletedByType: {
          Conference: 1,
          Division: 4,
          Team: 16,
        },
      };

      return HttpResponse.json(result);
    }
  ),

  /**
   * POST /api/leagues-management/conferences/{conferenceId}/divisions
   * Add a new division to a conference
   */
  http.post<{ conferenceId: string }, AddDivisionRequest>(
    '/api/leagues-management/conferences/:conferenceId/divisions',
    async ({ request }) => {
      const body = await request.json();
      
      if (!body.name || body.numberOfTeams <= 0) {
        return HttpResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400 }
        );
      }

      const division: Division = {
        id: nextDivisionId++,
        name: body.name,
        teams: generateTeams(body.numberOfTeams, nextDivisionId - 1),
      };

      return HttpResponse.json(division, { status: 201 });
    }
  ),

  /**
   * DELETE /api/leagues-management/divisions/{divisionId}
   * Delete a division (cascade)
   */
  http.delete<{ divisionId: string }>(
    '/api/leagues-management/divisions/:divisionId',
    () => {
      const result: CascadeDeleteResult = {
        success: true,
        totalEntitiesDeleted: 5, // 1 division + 4 teams (example)
        deletedByType: {
          Division: 1,
          Team: 4,
        },
      };

      return HttpResponse.json(result);
    }
  ),

  /**
   * POST /api/leagues-management/divisions/{divisionId}/teams
   * Add a new team to a division
   */
  http.post<{ divisionId: string }, AddTeamRequest>(
    '/api/leagues-management/divisions/:divisionId/teams',
    async ({ params, request }) => {
      const body = await request.json();

      const team: Team = {
        id: nextTeamId++,
        divisionId: Number(params.divisionId),
        name: body.name || `Team ${nextTeamId}`,
        city: body.city || 'City',
        budget: 100000000,
        championships: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        fanSupport: 50,
        chemistry: 50,
      };

      return HttpResponse.json(team, { status: 201 });
    }
  ),

  /**
   * DELETE /api/leagues-management/teams/{teamId}
   * Delete a team (cascade)
   */
  http.delete<{ teamId: string }>(
    '/api/leagues-management/teams/:teamId',
    () => {
      const result: CascadeDeleteResult = {
        success: true,
        totalEntitiesDeleted: 1, // Just the team (players would be included in real API)
        deletedByType: {
          Team: 1,
        },
      };

      return HttpResponse.json(result);
    }
  ),
];
