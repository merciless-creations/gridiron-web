import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveContext } from '../contexts';

interface ContextSwitcherProps {
  className?: string;
  /** When true, renders inline list without trigger button (for embedding in parent dropdown) */
  embedded?: boolean;
  /** Callback when a selection is made (useful for closing parent menu) */
  onSelect?: () => void;
}

export const ContextSwitcher = ({ className = '', embedded = false, onSelect }: ContextSwitcherProps) => {
  const navigate = useNavigate();
  const {
    leagueId,
    leagueName,
    teamId,
    teamName,
    role,
    availableLeagues,
    availableTeams,
    isLoading,
    setActiveLeague,
    setActiveTeam,
  } = useActiveContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside (only for standalone mode)
  useEffect(() => {
    if (embedded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [embedded]);

  // Close dropdown on escape key (only for standalone mode)
  useEffect(() => {
    if (embedded) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [embedded]);

  const handleLeagueSelect = (selectedLeagueId: number) => {
    setActiveLeague(selectedLeagueId);
    setIsOpen(false);
    navigate(`/leagues/${selectedLeagueId}`);
    onSelect?.();
  };

  const handleTeamSelect = (selectedTeamId: number) => {
    setActiveTeam(selectedTeamId);
    setIsOpen(false);
    navigate(`/teams/${selectedTeamId}`);
    onSelect?.();
  };

  // Don't render if no leagues or teams available
  if (!isLoading && availableLeagues.length === 0 && availableTeams.length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center text-sm text-gridiron-text-muted ${className}`}>
        <div className="animate-pulse bg-gridiron-bg-tertiary rounded h-8 w-32" />
      </div>
    );
  }

  // Get current display text
  const getCurrentDisplayText = () => {
    if (teamName && leagueName) {
      return teamName;
    }
    if (leagueName) {
      return leagueName;
    }
    return 'Select Context';
  };

  // Get role badge
  const getRoleBadge = () => {
    if (role === 'Commissioner') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
          Commissioner
        </span>
      );
    }
    if (role === 'GeneralManager') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
          GM
        </span>
      );
    }
    return null;
  };

  // Group teams by league
  const teamsByLeague = availableTeams.reduce((acc, team) => {
    if (!acc[team.leagueId]) {
      acc[team.leagueId] = { leagueName: team.leagueName, teams: [] };
    }
    acc[team.leagueId].teams.push(team);
    return acc;
  }, {} as Record<number, { leagueName: string; teams: typeof availableTeams }>);

  // Content for leagues/teams list (shared between modes)
  const renderContent = () => (
    <>
      {/* Leagues Section */}
      {availableLeagues.length > 0 && (
        <div className={embedded ? 'px-2' : 'p-2'}>
          <div className="px-2 py-1.5 text-xs font-semibold text-gridiron-text-muted uppercase tracking-wider">
            Leagues
          </div>
          {availableLeagues.map((league) => (
            <button
              key={league.id}
              type="button"
              onClick={() => handleLeagueSelect(league.id)}
              className={`w-full flex items-center justify-between px-2 py-2 rounded text-left text-sm transition-colors ${
                leagueId === league.id && !teamId
                  ? 'bg-gridiron-accent/20 text-gridiron-accent'
                  : 'text-gridiron-text-primary hover:bg-gridiron-bg-tertiary'
              }`}
              role="option"
              aria-selected={leagueId === league.id && !teamId}
              data-testid={`league-option-${league.id}`}
            >
              <span className="truncate">{league.name}</span>
              {league.role === 'Commissioner' && (
                <span className="flex-shrink-0 ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                  Commissioner
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      {availableLeagues.length > 0 && availableTeams.length > 0 && (
        <div className="border-t border-gridiron-border-subtle" />
      )}

      {/* Teams Section - Grouped by League */}
      {availableTeams.length > 0 && (
        <div className={embedded ? 'px-2' : 'p-2'}>
          <div className="px-2 py-1.5 text-xs font-semibold text-gridiron-text-muted uppercase tracking-wider">
            My Teams
          </div>
          {Object.entries(teamsByLeague).map(([leagueIdStr, { leagueName: groupLeagueName, teams }]) => (
            <div key={leagueIdStr}>
              {Object.keys(teamsByLeague).length > 1 && (
                <div className="px-2 py-1 text-xs text-gridiron-text-muted mt-1">
                  {groupLeagueName}
                </div>
              )}
              {teams.map((team) => (
                <button
                  key={team.teamId}
                  type="button"
                  onClick={() => handleTeamSelect(team.teamId)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded text-left text-sm transition-colors ${
                    teamId === team.teamId
                      ? 'bg-gridiron-accent/20 text-gridiron-accent'
                      : 'text-gridiron-text-primary hover:bg-gridiron-bg-tertiary'
                  }`}
                  role="option"
                  aria-selected={teamId === team.teamId}
                  data-testid={`team-option-${team.teamId}`}
                >
                  <span className="truncate">{team.teamName}</span>
                  <span className="flex-shrink-0 ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                    GM
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Embedded mode: render content directly without wrapper/trigger
  if (embedded) {
    return (
      <div className={className} role="listbox" data-testid="context-switcher-embedded">
        {renderContent()}
      </div>
    );
  }

  // Standalone mode: render with trigger button and dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-gridiron-bg-tertiary border border-gridiron-border-subtle hover:bg-gridiron-border-subtle hover:border-gridiron-border-emphasis transition-colors text-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="context-switcher-trigger"
      >
        <span className="text-gridiron-text-primary font-medium truncate max-w-[150px]">
          {getCurrentDisplayText()}
        </span>
        {getRoleBadge()}
        <svg
          className={`w-4 h-4 text-gridiron-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-72 max-h-96 overflow-auto bg-gridiron-bg-card border border-gridiron-border-subtle rounded shadow-lg z-50"
          role="listbox"
          data-testid="context-switcher-dropdown"
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
};
