import { http, HttpResponse } from 'msw';
import { LEAGUE_CONSTRAINTS } from '../data/leaguePresets';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const leagueConstraintsHandlers = [
  /**
   * GET /api/leagues-management/constraints
   * Returns league structure constraints (min/max values)
   */
  http.get(`${API_URL}/api/leagues-management/constraints`, () => {
    return HttpResponse.json(LEAGUE_CONSTRAINTS);
  }),
];
