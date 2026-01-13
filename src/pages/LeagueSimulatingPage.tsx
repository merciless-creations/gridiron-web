import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { apiClient } from '../api/client';

interface SimulationStatus {
  leagueId: number;
  simulationInProgress: boolean;
  startedAt: string | null;
  startedByUserName: string | null;
}

/**
 * Page shown when a league is actively being simulated.
 * All league API calls return 423 Locked, so this is the only page
 * available for the league until simulation completes.
 * Polls every 10 seconds to detect completion.
 */
export default function LeagueSimulatingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const leagueId = Number(id);
    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const response = await apiClient.get<SimulationStatus>(
          `/leagues-management/${leagueId}/simulation-status`
        );
        const data = response.data;

        if (!data.simulationInProgress) {
          // Simulation complete - redirect to league page
          navigate(`/leagues/${leagueId}`, { replace: true });
          return;
        }

        setStatus(data);
        setError(null);
      } catch (err) {
        console.error('Failed to check simulation status:', err);
        setError('Failed to check simulation status');
      }
    };

    // Initial check
    checkStatus();

    // Poll every 10 seconds
    intervalId = setInterval(checkStatus, 10000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id, navigate]);

  const duration = status?.startedAt
    ? formatDistanceToNow(new Date(status.startedAt), { addSuffix: false })
    : null;

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto animate-spin text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Simulation in Progress
        </h1>

        {status?.startedByUserName && (
          <p className="text-gray-400 mb-1">
            Started by {status.startedByUserName}
          </p>
        )}

        {duration && (
          <p className="text-gray-500 text-sm">Running for {duration}</p>
        )}

        <p className="text-gray-500 text-sm mt-4 mb-6">
          This page will refresh automatically when complete.
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <Link
          to="/dashboard"
          className="inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
