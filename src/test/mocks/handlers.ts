import { http, HttpResponse } from 'msw'
import type { Team } from '../../types/Team'
import type { Game, SimulateGameResponse } from '../../types/Game'
import type { League, LeagueDetail, CreateLeagueRequest } from '../../types/League'
import type { User } from '../../types/User'
import { leagueConstraintsHandlers } from '../../mocks/handlers/leagueConstraints'
import { leagueStructureHandlers } from '../../mocks/handlers/leagueStructure'
import { generateMockLeague } from '../../mocks/data/leaguePresets'

// Mock data - Teams
export const mockTeams: Team[] = [
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
]

export const mockGame: Game = {
  id: 1,
  homeTeamId: 1,
  awayTeamId: 2,
  homeScore: 24,
  awayScore: 17,
  fieldPosition: 50,
  yardsToGo: 10,
  currentDown: 1,
}

export const mockSimulateResponse: SimulateGameResponse = {
  id: 1,
  homeTeamId: 1,
  awayTeamId: 2,
  homeScore: 24,
  awayScore: 17,
  message: 'Game simulated successfully',
}

// Mock data - User
// Note: isGlobalAdmin is set to true so the test user can manage all leagues
// including newly created ones during E2E tests
export const mockUser: User = {
  id: 1,
  email: 'testuser@example.com',
  displayName: 'Test User',
  isGlobalAdmin: true,
  createdAt: '2024-01-15T10:00:00Z',
  lastLoginAt: '2024-11-29T08:30:00Z',
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
  ],
}

// Mock data - Leagues (predefined, stateless)
export const mockLeagues: League[] = [
  {
    id: 1,
    name: 'Test League',
    season: 2024,
    isActive: true,
    totalTeams: 8,
    totalConferences: 2,
  },
  {
    id: 2,
    name: 'Another League',
    season: 2024,
    isActive: true,
    totalTeams: 16,
    totalConferences: 2,
  },
  {
    id: 3,
    name: 'NFL-Style League',
    season: 2024,
    isActive: true,
    totalTeams: 32,
    totalConferences: 2,
  },
]

// Predefined league details (stateless - always return same data)
const mockLeagueDetails: Map<number, LeagueDetail> = new Map([
  // League 1: Small test league
  [1, {
    id: 1,
    name: 'Test League',
    season: 2024,
    isActive: true,
    totalTeams: 8,
    totalConferences: 2,
    conferences: [
      {
        id: 1,
        name: 'Conference A',
        divisions: [
          {
            id: 1,
            name: 'Division 1',
            teams: [mockTeams[0], mockTeams[1]],
          },
          {
            id: 2,
            name: 'Division 2',
            teams: [],
          },
        ],
      },
      {
        id: 2,
        name: 'Conference B',
        divisions: [
          {
            id: 3,
            name: 'Division 3',
            teams: [],
          },
          {
            id: 4,
            name: 'Division 4',
            teams: [],
          },
        ],
      },
    ],
  }],
  // League 2: Medium league
  [2, generateMockLeague({ 
    name: 'Another League', 
    numberOfConferences: 2, 
    divisionsPerConference: 4, 
    teamsPerDivision: 2 
  }, 2)],
  // League 3: NFL-style league
  [3, generateMockLeague({ 
    name: 'NFL-Style League', 
    numberOfConferences: 2, 
    divisionsPerConference: 4, 
    teamsPerDivision: 4 
  }, 3)],
]);

// API handlers - STATELESS (always return same data)
export const handlers = [
  // ============ LEAGUE CONSTRAINTS & STRUCTURE ============
  ...leagueConstraintsHandlers,
  ...leagueStructureHandlers,

  // ============ TEAMS ============
  // GET /api/teams
  http.get('/api/teams', () => {
    return HttpResponse.json(mockTeams)
  }),

  // GET /api/teams/:id
  http.get('/api/teams/:id', ({ params }) => {
    const team = mockTeams.find(t => t.id === Number(params.id))
    if (!team) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(team)
  }),

  // ============ GAMES ============
  // POST /api/games/simulate
  http.post('/api/games/simulate', async ({ request }) => {
    const body = await request.json() as { homeTeamId: number; awayTeamId: number }
    return HttpResponse.json({
      ...mockSimulateResponse,
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
    })
  }),

  // GET /api/games
  http.get('/api/games', () => {
    return HttpResponse.json([mockGame])
  }),

  // ============ USERS ============
  // GET /api/users/me
  http.get('/api/users/me', () => {
    return HttpResponse.json(mockUser)
  }),

  // GET /api/users/league/:leagueId
  http.get('/api/users/league/:leagueId', () => {
    return HttpResponse.json([mockUser])
  }),

  // POST /api/users/:userId/league-roles
  http.post('/api/users/:userId/league-roles', () => {
    return HttpResponse.json(mockUser)
  }),

  // DELETE /api/users/:userId/league-roles/:roleId
  http.delete('/api/users/:userId/league-roles/:roleId', () => {
    return HttpResponse.json(mockUser)
  }),

  // ============ LEAGUES ============
  // GET /api/leagues-management (always returns same list)
  http.get('/api/leagues-management', () => {
    return HttpResponse.json(mockLeagues)
  }),

  // GET /api/leagues-management/:id (always returns predefined data)
  http.get('/api/leagues-management/:id', ({ params }) => {
    const leagueId = Number(params.id)
    const leagueDetail = mockLeagueDetails.get(leagueId)
    
    if (!leagueDetail) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(leagueDetail)
  }),

  // POST /api/leagues-management (returns success but doesn't persist)
  http.post('/api/leagues-management', async ({ request }) => {
    const body = await request.json() as CreateLeagueRequest
    
    // Generate structure for the created league (but don't store it)
    const newLeague = generateMockLeague(body, 999) // Use ID 999 for demo
    
    return HttpResponse.json(newLeague)
  }),

  // PUT /api/leagues-management/:id (returns success but doesn't persist)
  http.put('/api/leagues-management/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const body = await request.json() as { name?: string; season?: number; isActive?: boolean }
    const league = mockLeagueDetails.get(id)
    
    if (!league) {
      return new HttpResponse(null, { status: 404 })
    }
    
    // Return updated league (but don't actually modify the mock data)
    return HttpResponse.json({
      ...league,
      ...body,
    })
  }),

  // DELETE /api/leagues-management/:id (returns success but doesn't persist)
  http.delete('/api/leagues-management/:id', ({ params }) => {
    const id = Number(params.id)
    const league = mockLeagues.find(l => l.id === id)
    
    if (!league) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/leagues-management/:id/populate-rosters (returns success but doesn't persist)
  http.post('/api/leagues-management/:id/populate-rosters', ({ params }) => {
    const id = Number(params.id)
    const league = mockLeagues.find(l => l.id === id)
    if (!league) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      id: league.id,
      name: league.name,
      totalTeams: league.totalTeams,
    })
  }),
]
