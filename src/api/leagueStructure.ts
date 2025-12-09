import type {
  Conference,
  Division,
  AddConferenceRequest,
  AddDivisionRequest,
  AddTeamRequest,
  CascadeDeleteResult,
} from '../types/League';
import type { Team } from '../types/Team';
import { apiClient } from './client';

/**
 * Add a new conference to a league
 */
export async function addConference(
  leagueId: number,
  request: AddConferenceRequest
): Promise<Conference> {
  const response = await apiClient.post<Conference>(
    `/leagues-management/${leagueId}/conferences`,
    request
  );
  return response.data;
}

/**
 * Delete a conference (cascade to divisions, teams, players)
 */
export async function deleteConference(
  conferenceId: number,
  deletedBy?: string,
  reason?: string
): Promise<CascadeDeleteResult> {
  const params = new URLSearchParams();
  if (deletedBy) params.append('deletedBy', deletedBy);
  if (reason) params.append('reason', reason);

  const response = await apiClient.delete<CascadeDeleteResult>(
    `/leagues-management/conferences/${conferenceId}?${params.toString()}`
  );
  return response.data;
}

/**
 * Add a new division to a conference
 */
export async function addDivision(
  conferenceId: number,
  request: AddDivisionRequest
): Promise<Division> {
  const response = await apiClient.post<Division>(
    `/leagues-management/conferences/${conferenceId}/divisions`,
    request
  );
  return response.data;
}

/**
 * Delete a division (cascade to teams, players)
 */
export async function deleteDivision(
  divisionId: number,
  deletedBy?: string,
  reason?: string
): Promise<CascadeDeleteResult> {
  const params = new URLSearchParams();
  if (deletedBy) params.append('deletedBy', deletedBy);
  if (reason) params.append('reason', reason);

  const response = await apiClient.delete<CascadeDeleteResult>(
    `/leagues-management/divisions/${divisionId}?${params.toString()}`
  );
  return response.data;
}

/**
 * Add a new team to a division
 */
export async function addTeam(
  divisionId: number,
  request: AddTeamRequest
): Promise<Team> {
  const response = await apiClient.post<Team>(
    `/leagues-management/divisions/${divisionId}/teams`,
    request
  );
  return response.data;
}

/**
 * Delete a team (cascade to players)
 */
export async function deleteTeam(
  teamId: number,
  deletedBy?: string,
  reason?: string
): Promise<CascadeDeleteResult> {
  const params = new URLSearchParams();
  if (deletedBy) params.append('deletedBy', deletedBy);
  if (reason) params.append('reason', reason);

  const response = await apiClient.delete<CascadeDeleteResult>(
    `/leagues-management/teams/${teamId}?${params.toString()}`
  );
  return response.data;
}
