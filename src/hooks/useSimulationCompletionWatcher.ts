import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useToast } from '../contexts';

interface SimulationStatus {
  leagueId: number;
  simulationInProgress: boolean;
  startedAt: string | null;
  startedByUserName: string | null;
}

interface WatchedLeague {
  leagueId: number;
  leagueName: string;
}

/**
 * Hook that watches for simulation completion across all leagues the user cares about.
 * Shows a toast notification when a simulation completes.
 *
 * @param leaguesToWatch - Array of leagues to watch for simulation completion.
 *                         If not provided, no polling occurs.
 */
export function useSimulationCompletionWatcher(leaguesToWatch?: WatchedLeague[]) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const previousStatusRef = useRef<Map<number, boolean>>(new Map());

  useEffect(() => {
    if (!leaguesToWatch || leaguesToWatch.length === 0) {
      return;
    }

    // Get which leagues are currently simulating
    const simulatingLeagues = leaguesToWatch.filter((league) => {
      // Check if we've seen this league as simulating before
      return previousStatusRef.current.get(league.leagueId) === true;
    });

    // If no leagues are simulating, no need to poll
    if (simulatingLeagues.length === 0) {
      return;
    }

    const checkStatuses = async () => {
      for (const league of simulatingLeagues) {
        try {
          const response = await apiClient.get<SimulationStatus>(
            `/leagues-management/${league.leagueId}/simulation-status`
          );

          const wasSimulating = previousStatusRef.current.get(league.leagueId);
          const isNowSimulating = response.data.simulationInProgress;

          // Update the tracking map
          previousStatusRef.current.set(league.leagueId, isNowSimulating);

          // If was simulating and now not, show toast
          if (wasSimulating && !isNowSimulating) {
            toast.success(
              `Simulation complete for ${league.leagueName}!`,
              10000
            );

            // Invalidate league queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['league', league.leagueId] });
            queryClient.invalidateQueries({ queryKey: ['season', league.leagueId] });
            queryClient.invalidateQueries({ queryKey: ['standings', league.leagueId] });
            queryClient.invalidateQueries({ queryKey: ['schedule', league.leagueId] });
          }
        } catch (err) {
          // Silently ignore errors - we're just polling
          console.warn(`Failed to check simulation status for league ${league.leagueId}:`, err);
        }
      }
    };

    // Poll every 10 seconds
    const intervalId = setInterval(checkStatuses, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [leaguesToWatch, toast, queryClient]);

  // Function to mark a league as simulating (called when simulation starts)
  const markAsSimulating = (leagueId: number) => {
    previousStatusRef.current.set(leagueId, true);
  };

  return { markAsSimulating };
}
