import { useMemo } from 'react';
import type { Play } from '../types/Game';

interface PlayByPlayViewerProps {
  plays: Play[];
  homeTeamName: string;
  awayTeamName: string;
  isLoading?: boolean;
}

/**
 * Converts field position (0-100) to readable yard line
 * 0 = own goal line, 50 = midfield, 100 = opponent's goal line
 */
function formatFieldPosition(position: number, possession: string): string {
  if (position === 50) return 'MIDFIELD';
  if (position < 50) {
    return `OWN ${position}`;
  }
  return `OPP ${100 - position}`;
}

/**
 * Formats down and distance (e.g., "1st & 10")
 */
function formatDownAndDistance(down: number, yardsToGo: number): string {
  const ordinal = ['', '1st', '2nd', '3rd', '4th'][down] || `${down}th`;
  if (yardsToGo >= 100) return `${ordinal} & Goal`;
  return `${ordinal} & ${yardsToGo}`;
}

/**
 * Gets appropriate styling for play type
 */
function getPlayTypeStyle(play: Play): string {
  if (play.isTouchdown) return 'bg-gridiron-win/20 border-l-4 border-l-gridiron-win';
  if (play.interception) return 'bg-gridiron-loss/20 border-l-4 border-l-gridiron-loss';
  if (play.isSafety) return 'bg-gridiron-loss/20 border-l-4 border-l-gridiron-loss';
  if (play.possessionChange) return 'bg-gridiron-accent/10 border-l-4 border-l-gridiron-accent';
  if (play.penalties.length > 0) return 'bg-yellow-500/10 border-l-4 border-l-yellow-500';
  return 'border-l-4 border-l-transparent';
}

/**
 * Gets icon/badge for special plays
 */
function getPlayBadge(play: Play): { text: string; className: string } | null {
  if (play.isTouchdown) return { text: 'TD', className: 'bg-gridiron-win text-white' };
  if (play.interception) return { text: 'INT', className: 'bg-gridiron-loss text-white' };
  if (play.isSafety) return { text: 'SAFETY', className: 'bg-gridiron-loss text-white' };
  if (play.possessionChange) return { text: 'TURNOVER', className: 'bg-gridiron-accent text-gridiron-bg-primary' };
  return null;
}

export const PlayByPlayViewer = ({
  plays,
  homeTeamName,
  awayTeamName,
  isLoading = false,
}: PlayByPlayViewerProps) => {
  // Group plays by quarter
  const playsByQuarter = useMemo(() => {
    const quarters: { quarter: number; plays: Play[] }[] = [];
    let currentQuarter = 1;
    let currentPlays: Play[] = [];

    plays.forEach((play, index) => {
      // Calculate quarter based on game time (4 quarters * 15 minutes = 3600 seconds)
      // startTime counts down from 3600
      const quarterNumber = Math.min(4, Math.floor((3600 - play.startTime) / 900) + 1);

      if (quarterNumber !== currentQuarter) {
        if (currentPlays.length > 0) {
          quarters.push({ quarter: currentQuarter, plays: currentPlays });
        }
        currentQuarter = quarterNumber;
        currentPlays = [];
      }
      currentPlays.push(play);
    });

    // Don't forget the last quarter
    if (currentPlays.length > 0) {
      quarters.push({ quarter: currentQuarter, plays: currentPlays });
    }

    return quarters;
  }, [plays]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalPlays = plays.length;
    const touchdowns = plays.filter(p => p.isTouchdown).length;
    const turnovers = plays.filter(p => p.interception || p.possessionChange).length;
    const penalties = plays.reduce((acc, p) => acc + p.penalties.length, 0);
    return { totalPlays, touchdowns, turnovers, penalties };
  }, [plays]);

  if (isLoading) {
    return (
      <div className="card" data-testid="play-by-play-loading">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-gridiron-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gridiron-text-secondary">Loading play-by-play...</span>
        </div>
      </div>
    );
  }

  if (plays.length === 0) {
    return (
      <div className="card" data-testid="play-by-play-empty">
        <p className="text-gridiron-text-secondary text-center py-4">
          No play-by-play data available for this game.
        </p>
      </div>
    );
  }

  return (
    <div className="card" data-testid="play-by-play-viewer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-gridiron-text-primary">
          Play-by-Play
        </h3>
        <div className="flex gap-4 text-sm">
          <span className="text-gridiron-text-secondary">
            <strong className="text-gridiron-text-primary">{stats.totalPlays}</strong> plays
          </span>
          <span className="text-gridiron-text-secondary">
            <strong className="text-gridiron-win">{stats.touchdowns}</strong> TDs
          </span>
          <span className="text-gridiron-text-secondary">
            <strong className="text-gridiron-loss">{stats.turnovers}</strong> turnovers
          </span>
          {stats.penalties > 0 && (
            <span className="text-gridiron-text-secondary">
              <strong className="text-yellow-500">{stats.penalties}</strong> penalties
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-6" data-testid="play-list">
        {playsByQuarter.map(({ quarter, plays: quarterPlays }) => (
          <div key={quarter}>
            <div className="sticky top-0 bg-gridiron-bg-card py-2 mb-2 border-b border-gridiron-border-subtle">
              <h4 className="text-sm font-semibold text-gridiron-accent uppercase tracking-wide">
                {quarter <= 4 ? `Quarter ${quarter}` : `Overtime ${quarter - 4}`}
              </h4>
            </div>
            <div className="space-y-2">
              {quarterPlays.map((play, index) => {
                const badge = getPlayBadge(play);
                const teamName = play.possession === 'Home' ? homeTeamName : awayTeamName;

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-r bg-gridiron-bg-tertiary ${getPlayTypeStyle(play)}`}
                    data-testid="play-item"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gridiron-text-muted">
                            {formatDownAndDistance(play.down, play.yardsToGo)}
                          </span>
                          <span className="text-xs text-gridiron-text-muted">
                            {formatFieldPosition(play.startFieldPosition, play.possession)}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gridiron-bg-secondary text-gridiron-text-secondary">
                            {teamName}
                          </span>
                          <span className="text-xs text-gridiron-text-muted uppercase">
                            {play.playType}
                          </span>
                          {badge && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${badge.className}`}>
                              {badge.text}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gridiron-text-primary">
                          {play.description || `${play.playType} for ${play.yardsGained} yards`}
                        </p>
                        {play.yardsGained !== 0 && (
                          <span className={`text-xs ${play.yardsGained > 0 ? 'text-gridiron-win' : 'text-gridiron-loss'}`}>
                            {play.yardsGained > 0 ? '+' : ''}{play.yardsGained} yards
                          </span>
                        )}
                        {play.penalties.length > 0 && (
                          <div className="mt-1">
                            {play.penalties.map((penalty, i) => (
                              <span key={i} className="text-xs text-yellow-500 block">
                                FLAG: {penalty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
