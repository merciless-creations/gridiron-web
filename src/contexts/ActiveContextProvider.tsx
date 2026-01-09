import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { useCurrentUser } from '../api/users';
import { useMyTeams } from '../api/teamAssignments';
import type { UserTeamDto } from '../api/teamAssignments';
import type { ActiveRole, ActiveContextState } from './types';
import { ActiveContextContext } from './ActiveContextContext';

const STORAGE_KEY = 'gridiron-active-context';

interface StoredContext {
  leagueId: number | null;
  teamId: number | null;
}

function loadStoredContext(): StoredContext {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { leagueId: null, teamId: null };
}

function saveStoredContext(context: StoredContext): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // Ignore storage errors
  }
}

interface ActiveContextProviderProps {
  children: ReactNode;
}

export function ActiveContextProvider({ children }: ActiveContextProviderProps) {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams();

  // Use ref to track initialization without triggering re-renders
  const initializedRef = useRef(false);

  // Lazy initialization from localStorage
  const [activeLeagueId, setActiveLeagueId] = useState<number | null>(() => {
    const stored = loadStoredContext();
    return stored.leagueId;
  });
  const [activeTeamId, setActiveTeamId] = useState<number | null>(() => {
    const stored = loadStoredContext();
    return stored.teamId;
  });

  // Extract leagueRoles with stable reference for memoization
  const leagueRoles = currentUser?.leagueRoles;

  // Build available leagues from user's league roles
  const availableLeagues = useMemo(() => {
    if (!leagueRoles) return [];

    const leagueMap = new Map<number, { id: number; name: string; role: ActiveRole }>();

    for (const role of leagueRoles) {
      // Commissioner role takes precedence
      const existing = leagueMap.get(role.leagueId);
      if (!existing || role.role === 'Commissioner') {
        leagueMap.set(role.leagueId, {
          id: role.leagueId,
          name: role.leagueName,
          role: role.role,
        });
      }
    }

    return Array.from(leagueMap.values());
  }, [leagueRoles]);

  // Available teams from myTeams API
  const availableTeams: UserTeamDto[] = useMemo(() => myTeams || [], [myTeams]);

  // Validate and auto-select context once data is loaded
  // This is intentional initialization logic that must run after data loads
  useEffect(() => {
    if (initializedRef.current || userLoading || teamsLoading || !currentUser) {
      return;
    }

    // Mark as initialized to prevent re-running
    initializedRef.current = true;

    // Compute what the initial values should be
    let newLeagueId: number | null = activeLeagueId;
    let newTeamId: number | null = activeTeamId;

    // Validate stored league still exists for this user
    const storedLeagueValid = activeLeagueId !== null && availableLeagues.some(l => l.id === activeLeagueId);

    if (!storedLeagueValid) {
      // Only auto-select if user has exactly one league
      if (availableLeagues.length === 1) {
        newLeagueId = availableLeagues[0].id;
        // If they're a GM, also select their team in that league
        const teamInLeague = availableTeams.find(t => t.leagueId === availableLeagues[0].id);
        newTeamId = teamInLeague?.teamId || null;
      } else {
        // Multiple leagues or none - let user choose
        newLeagueId = null;
        newTeamId = null;
      }
    } else {
      // Validate stored team
      const storedTeamValid = activeTeamId !== null &&
        availableTeams.some(t => t.teamId === activeTeamId && t.leagueId === activeLeagueId);
      if (!storedTeamValid) {
        newTeamId = null;
      }
    }

    // Only update state if values changed - this is one-time initialization
    if (newLeagueId !== activeLeagueId) {
      setActiveLeagueId(newLeagueId); // eslint-disable-line react-hooks/set-state-in-effect
    }
    if (newTeamId !== activeTeamId) {
      setActiveTeamId(newTeamId);
    }
  }, [userLoading, teamsLoading, currentUser, availableLeagues, availableTeams, activeLeagueId, activeTeamId]);

  // Persist to localStorage when context changes
  useEffect(() => {
    // Don't save until we're done initializing
    if (!initializedRef.current) return;
    saveStoredContext({ leagueId: activeLeagueId, teamId: activeTeamId });
  }, [activeLeagueId, activeTeamId]);

  // Derive current context values
  const activeContext = useMemo(() => {
    if (!activeLeagueId) {
      return { leagueId: null, leagueName: null, teamId: null, teamName: null, role: null };
    }

    const league = availableLeagues.find(l => l.id === activeLeagueId);
    if (!league) {
      return { leagueId: null, leagueName: null, teamId: null, teamName: null, role: null };
    }

    let teamId: number | null = null;
    let teamName: string | null = null;

    if (activeTeamId) {
      const team = availableTeams.find(t => t.teamId === activeTeamId && t.leagueId === activeLeagueId);
      if (team) {
        teamId = team.teamId;
        teamName = team.teamName;
      }
    }

    return {
      leagueId: league.id,
      leagueName: league.name,
      teamId,
      teamName,
      role: league.role,
    };
  }, [activeLeagueId, activeTeamId, availableLeagues, availableTeams]);

  const setActiveLeague = useCallback((leagueId: number) => {
    setActiveLeagueId(leagueId);
    // Clear team when switching leagues, then auto-select team if user is GM in new league
    const teamInLeague = availableTeams.find(t => t.leagueId === leagueId);
    setActiveTeamId(teamInLeague?.teamId || null);
  }, [availableTeams]);

  const setActiveTeam = useCallback((teamId: number) => {
    const team = availableTeams.find(t => t.teamId === teamId);
    if (team) {
      setActiveLeagueId(team.leagueId);
      setActiveTeamId(teamId);
    }
  }, [availableTeams]);

  const clearContext = useCallback(() => {
    setActiveLeagueId(null);
    setActiveTeamId(null);
  }, []);

  const isCommissionerOf = useCallback((leagueId: number): boolean => {
    if (currentUser?.isGlobalAdmin) return true;
    return leagueRoles?.some(
      r => r.leagueId === leagueId && r.role === 'Commissioner'
    ) || false;
  }, [currentUser?.isGlobalAdmin, leagueRoles]);

  const isGmOf = useCallback((teamId: number): boolean => {
    return availableTeams.some(t => t.teamId === teamId);
  }, [availableTeams]);

  const getRoleForLeague = useCallback((leagueId: number): ActiveRole => {
    if (currentUser?.isGlobalAdmin) return 'Commissioner';
    const role = leagueRoles?.find(r => r.leagueId === leagueId);
    return role?.role || null;
  }, [currentUser?.isGlobalAdmin, leagueRoles]);

  const value = useMemo((): ActiveContextState => ({
    ...activeContext,
    availableLeagues,
    availableTeams,
    isLoading: userLoading || teamsLoading,
    setActiveLeague,
    setActiveTeam,
    clearContext,
    isCommissionerOf,
    isGmOf,
    getRoleForLeague,
  }), [
    activeContext,
    availableLeagues,
    availableTeams,
    userLoading,
    teamsLoading,
    setActiveLeague,
    setActiveTeam,
    clearContext,
    isCommissionerOf,
    isGmOf,
    getRoleForLeague,
  ]);

  return (
    <ActiveContextContext.Provider value={value}>
      {children}
    </ActiveContextContext.Provider>
  );
}
