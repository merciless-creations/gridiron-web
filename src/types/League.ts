import type { Team } from './Team';

/**
 * League types matching backend DTOs
 */

export interface League {
  id: number;
  name: string;
  season: number;
  isActive: boolean;
  totalTeams: number;
  totalConferences: number;
}

export interface LeagueDetail extends League {
  conferences: Conference[];
}

export interface Conference {
  id: number;
  name: string;
  divisions: Division[];
}

export interface Division {
  id: number;
  name: string;
  teams: Team[];
}

export interface CreateLeagueRequest {
  name: string;
  numberOfConferences: number;
  divisionsPerConference: number;
  teamsPerDivision: number;
  /** Number of regular season games (10-18, default 17) */
  regularSeasonGames?: number;
  /** Number of bye weeks per team (0-2, default 1) */
  byeWeeksPerTeam?: number;
}

export interface UpdateLeagueRequest {
  name?: string;
  season?: number;
  isActive?: boolean;
}

export interface PopulateRostersResponse {
  id: number;
  name: string;
  totalTeams: number;
}

export interface LeagueConstraints {
  minConferences: number;
  maxConferences: number;
  minDivisionsPerConference: number;
  maxDivisionsPerConference: number;
  minTeamsPerDivision: number;
  maxTeamsPerDivision: number;
}

export interface AddConferenceRequest {
  name: string;
  numberOfDivisions: number;
  teamsPerDivision: number;
}

export interface AddDivisionRequest {
  name: string;
  numberOfTeams: number;
}

export interface AddTeamRequest {
  name?: string;
  city?: string;
}

export interface UpdateConferenceRequest {
  name?: string;
}

export interface UpdateDivisionRequest {
  name?: string;
}

export interface CascadeDeleteResult {
  success: boolean;
  errorMessage?: string;
  totalEntitiesDeleted: number;
  deletedByType: Record<string, number>;
}
