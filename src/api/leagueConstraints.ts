import type { LeagueConstraints } from '../types/League';
import { apiClient } from './client';

/**
 * Fetch league structure constraints (min/max values)
 */
export async function getLeagueConstraints(): Promise<LeagueConstraints> {
  const response = await apiClient.get<LeagueConstraints>('/leagues-management/constraints');
  return response.data;
}
