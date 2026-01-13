import { formatDistanceToNow } from 'date-fns';

interface SimulationLockBannerProps {
  /** When the simulation started (ISO string) */
  startedAt: string;
  /** Display name of who started the simulation */
  startedByUserName: string | null;
}

/**
 * Banner displayed when a simulation is in progress for the league.
 * Shows that roster and depth chart changes are disabled.
 */
export const SimulationLockBanner = ({
  startedAt,
  startedByUserName,
}: SimulationLockBannerProps) => {
  const duration = formatDistanceToNow(new Date(startedAt), { addSuffix: false });

  return (
    <div
      className="bg-amber-600/20 border border-amber-500/40 rounded-lg px-4 py-3 mb-6"
      role="status"
      aria-label="Simulation in progress"
    >
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
        <div>
          <p className="text-sm font-semibold text-amber-400">
            Simulation in progress
            {startedByUserName && ` (started by ${startedByUserName})`}
            {` - running for ${duration}`}
          </p>
          <p className="text-xs text-gridiron-text-secondary mt-0.5">
            Roster and depth chart changes are disabled until the simulation
            completes.
          </p>
        </div>
      </div>
    </div>
  );
};
