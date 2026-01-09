import type { UserTeamDto } from '../api/teamAssignments';

export type ActiveRole = 'Commissioner' | 'GeneralManager' | null;

export interface ActiveContext {
  leagueId: number | null;
  leagueName: string | null;
  teamId: number | null;
  teamName: string | null;
  role: ActiveRole;
}

export interface ActiveContextState extends ActiveContext {
  /** All leagues the user has access to (as commissioner or GM) */
  availableLeagues: Array<{ id: number; name: string; role: ActiveRole }>;
  /** All teams the user manages */
  availableTeams: UserTeamDto[];
  /** Whether context data is still loading */
  isLoading: boolean;
  /** Set the active league (clears team if switching leagues) */
  setActiveLeague: (leagueId: number) => void;
  /** Set the active team (also sets the league) */
  setActiveTeam: (teamId: number) => void;
  /** Clear all context */
  clearContext: () => void;
  /** Check if user is commissioner of a specific league */
  isCommissionerOf: (leagueId: number) => boolean;
  /** Check if user is GM of a specific team */
  isGmOf: (teamId: number) => boolean;
  /** Get the user's role for a specific league */
  getRoleForLeague: (leagueId: number) => ActiveRole;
}
