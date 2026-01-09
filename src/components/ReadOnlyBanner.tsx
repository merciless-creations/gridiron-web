interface ReadOnlyBannerProps {
  /** The name of the team being scouted */
  teamName: string;
  /** Optional custom message override */
  message?: string;
}

/**
 * Banner displayed when viewing a team in read-only/scouting mode.
 * Shows when a GM views another team in their league.
 */
export const ReadOnlyBanner = ({ teamName, message }: ReadOnlyBannerProps) => {
  const displayMessage = message || `Scouting: ${teamName}`;

  return (
    <div
      className="bg-gridiron-warning/10 border border-gridiron-warning/30 rounded-lg px-4 py-3 mb-6"
      role="status"
      aria-label="Read-only mode"
    >
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-gridiron-warning mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-gridiron-warning">
            {displayMessage}
          </p>
          <p className="text-xs text-gridiron-text-secondary mt-0.5">
            You are viewing this team in read-only mode
          </p>
        </div>
      </div>
    </div>
  );
};
