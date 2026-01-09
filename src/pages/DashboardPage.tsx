import { Link, useNavigate } from 'react-router-dom';
import { useMyTeams, useTakeControl } from '../api/teamAssignments';
import { useMyLeagues } from '../api/leagues';
import { DashboardSkeleton } from '../components/Skeleton';
import { useState } from 'react';
import { WelcomeModal } from '../components/WelcomeModal';
import type { UserTeamDto } from '../api/teamAssignments';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const ErrorState = ({ title, message, onRetry, isRetrying }: ErrorStateProps) => (
  <div className="card border-gridiron-loss/30 animate-fade-in">
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-12 h-12 rounded-full bg-gridiron-loss/10 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-gridiron-loss"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gridiron-text-primary mb-2">{title}</h3>
      <p className="text-gridiron-text-secondary mb-4">{message}</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="btn-secondary flex items-center gap-2"
      >
        {isRetrying ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gridiron-text-primary" />
            Retrying...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </>
        )}
      </button>
    </div>
  </div>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionLink: string;
}

const EmptyState = ({ icon, title, description, actionLabel, actionLink }: EmptyStateProps) => (
  <div className="flex flex-col items-center text-center py-6 animate-fade-in">
    <div className="w-16 h-16 rounded-full bg-gridiron-bg-tertiary flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gridiron-text-primary mb-2">{title}</h3>
    <p className="text-gridiron-text-secondary mb-4 max-w-sm">{description}</p>
    <Link to={actionLink} className="btn-primary">
      {actionLabel}
    </Link>
  </div>
);

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    data: leagues,
    isLoading: leaguesLoading,
    isError: leaguesError,
    refetch: refetchLeagues,
    isRefetching: leaguesRefetching
  } = useMyLeagues();
  const {
    data: teams,
    isLoading: teamsLoading,
    isError: teamsError,
    refetch: refetchTeams,
    isRefetching: teamsRefetching
  } = useMyTeams();
  const takeControl = useTakeControl();

  const [welcomeModalTeam, setWelcomeModalTeam] = useState<UserTeamDto | null>(null);

  const handleTeamClick = (team: UserTeamDto) => {
    if (!team.hasViewed) {
      setWelcomeModalTeam(team);
    } else {
      navigate(`/teams/${team.teamId}/manage`);
    }
  };

  const handleTakeControl = async () => {
    if (!welcomeModalTeam) return;

    await takeControl.mutateAsync(welcomeModalTeam.teamId);
    setWelcomeModalTeam(null);
    navigate(`/teams/${welcomeModalTeam.teamId}/manage`);
  };

  const handleRetryAll = () => {
    refetchLeagues();
    refetchTeams();
  };

  // Loading state with skeleton
  if (leaguesLoading || teamsLoading) {
    return <DashboardSkeleton />;
  }

  // Combined error state when both fail
  if (leaguesError && teamsError) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gridiron-light animate-fade-in">Your Dashboard</h1>
        <ErrorState
          title="Unable to Load Dashboard"
          message="We couldn't load your leagues and teams. Please check your connection and try again."
          onRetry={handleRetryAll}
          isRetrying={leaguesRefetching || teamsRefetching}
        />
      </div>
    );
  }

  // Individual error for leagues
  if (leaguesError) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gridiron-light animate-fade-in">Your Dashboard</h1>
        <ErrorState
          title="Unable to Load Leagues"
          message="We couldn't load your leagues. Please try again."
          onRetry={() => refetchLeagues()}
          isRetrying={leaguesRefetching}
        />
      </div>
    );
  }

  // Individual error for teams
  if (teamsError) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gridiron-light animate-fade-in">Your Dashboard</h1>
        <ErrorState
          title="Unable to Load Teams"
          message="We couldn't load your teams. Please try again."
          onRetry={() => refetchTeams()}
          isRetrying={teamsRefetching}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gridiron-light">Your Dashboard</h1>

      {/* Leagues Section */}
      <section className="card animate-slide-up">
        <h2 className="text-xl font-semibold text-gridiron-light mb-4">
          Leagues You Manage
        </h2>

        {leagues && leagues.length > 0 ? (
          <div className="space-y-2">
            {leagues.map((league) => (
              <div
                key={league.id}
                className="flex items-center justify-between p-3 bg-gridiron-dark rounded-lg transition-colors hover:bg-gridiron-dark/80"
              >
                <span className="text-gridiron-light">{league.name}</span>
                <Link
                  to={`/leagues/${league.id}/manage`}
                  className="btn-secondary text-sm"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gridiron-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            title="No Leagues Yet"
            description="Create your first league to start managing teams and running simulations."
            actionLabel="Create Your First League"
            actionLink="/leagues/create"
          />
        )}

        {leagues && leagues.length > 0 && (
          <div className="mt-4">
            <Link to="/leagues/create" className="btn-primary">
              + Create League
            </Link>
          </div>
        )}
      </section>

      {/* Teams Section */}
      <section className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-semibold text-gridiron-light mb-4">
          Teams You Manage
        </h2>

        {teams && teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between p-3 bg-gridiron-dark rounded-lg cursor-pointer hover:bg-gridiron-dark/80 transition-colors"
                onClick={() => handleTeamClick(team)}
              >
                <div className="flex items-center gap-2">
                  {!team.hasViewed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gridiron-accent/20 text-gridiron-accent">
                      New
                    </span>
                  )}
                  <span className="text-gridiron-light">{team.teamName}</span>
                  <span className="text-gridiron-gray text-sm">
                    ({team.leagueName})
                  </span>
                </div>
                <button className="btn-secondary text-sm">
                  Manage
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gridiron-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="No Teams Assigned"
            description="You haven't been assigned to manage any teams yet. Ask a commissioner to assign you, or create your own league."
            actionLabel="Browse Leagues"
            actionLink="/leagues"
          />
        )}
      </section>

      {/* Welcome Modal */}
      {welcomeModalTeam && (
        <WelcomeModal
          teamName={welcomeModalTeam.teamName}
          onConfirm={handleTakeControl}
          onCancel={() => setWelcomeModalTeam(null)}
          isLoading={takeControl.isPending}
        />
      )}
    </div>
  );
}
