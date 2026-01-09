import { useMemo } from 'react';
import { useActiveContext } from '../contexts/useActiveContext';
import { useCurrentUser } from '../api/users';

export type PermissionRole = 'Commissioner' | 'GM' | null;

export interface Permissions {
  /** Whether the user can edit the resource */
  canEdit: boolean;
  /** Whether the user can view the resource */
  canView: boolean;
  /** The user's role for this resource */
  role: PermissionRole;
  /** Whether the user is a commissioner (or global admin) */
  isCommissioner: boolean;
  /** Whether the user is a GM */
  isGM: boolean;
  /** Whether viewing in read-only/scouting mode */
  isReadOnly: boolean;
  /** Whether permissions are still loading */
  isLoading: boolean;
}

/**
 * Hook for determining edit vs read-only access based on user role.
 *
 * Permission Matrix:
 * | User Role    | Own Team   | Other Teams in League | League Settings |
 * |--------------|------------|----------------------|-----------------|
 * | Commissioner | Full Edit  | Full Edit            | Full Edit       |
 * | GM           | Full Edit  | Read-Only (Scout)    | Read-Only       |
 * | No Role      | No Access  | No Access            | No Access       |
 *
 * Global admins have commissioner access everywhere.
 *
 * @param teamId - Optional team ID to check permissions for
 * @param leagueId - Optional league ID to check permissions for
 */
export function usePermissions(teamId?: number, leagueId?: number): Permissions {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const activeContext = useActiveContext();

  return useMemo(() => {
    // Default loading state
    if (userLoading || activeContext.isLoading) {
      return {
        canEdit: false,
        canView: false,
        role: null,
        isCommissioner: false,
        isGM: false,
        isReadOnly: false,
        isLoading: true,
      };
    }

    // Use provided IDs or fall back to active context
    const effectiveLeagueId = leagueId ?? activeContext.leagueId;
    const effectiveTeamId = teamId;

    // No user or no league context = no access
    if (!currentUser || !effectiveLeagueId) {
      return {
        canEdit: false,
        canView: false,
        role: null,
        isCommissioner: false,
        isGM: false,
        isReadOnly: false,
        isLoading: false,
      };
    }

    // Check if user is global admin (has commissioner access everywhere)
    const isGlobalAdmin = currentUser.isGlobalAdmin;

    // Check if user is commissioner of this league
    const isCommissionerOfLeague = isGlobalAdmin || activeContext.isCommissionerOf(effectiveLeagueId);

    // Check if user is GM of this team (if team is specified)
    const isGmOfTeam = effectiveTeamId ? activeContext.isGmOf(effectiveTeamId) : false;

    // Determine the user's role for this league
    const leagueRole = activeContext.getRoleForLeague(effectiveLeagueId);

    // Calculate permissions based on role and resource
    let canEdit = false;
    let canView = false;
    let isReadOnly = false;

    if (isCommissionerOfLeague) {
      // Commissioners can edit everything
      canEdit = true;
      canView = true;
      isReadOnly = false;
    } else if (leagueRole === 'GeneralManager') {
      // GMs can view everything in their league
      canView = true;

      if (effectiveTeamId) {
        // For teams: can only edit own team
        if (isGmOfTeam) {
          canEdit = true;
          isReadOnly = false;
        } else {
          // Can view other teams in read-only/scouting mode
          canEdit = false;
          isReadOnly = true;
        }
      } else {
        // For league settings: read-only
        canEdit = false;
        isReadOnly = true;
      }
    }
    // Users with no role have no access (default values are false)

    return {
      canEdit,
      canView,
      role: isCommissionerOfLeague ? 'Commissioner' : leagueRole === 'GeneralManager' ? 'GM' : null,
      isCommissioner: isCommissionerOfLeague,
      isGM: leagueRole === 'GeneralManager' && !isCommissionerOfLeague,
      isReadOnly,
      isLoading: false,
    };
  }, [currentUser, userLoading, activeContext, teamId, leagueId]);
}
