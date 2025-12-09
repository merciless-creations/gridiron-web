import { http, HttpResponse } from 'msw';
import { LEAGUE_CONSTRAINTS } from '../data/leaguePresets';

export const leagueConstraintsHandlers = [
  /**
   * GET /api/leagues-management/constraints
   * Returns league structure constraints (min/max values)
   */
  http.get('/api/leagues-management/constraints', () => {
    console.log('[MSW] Handling constraints request');
    return HttpResponse.json(LEAGUE_CONSTRAINTS);
  }),
];
