import { Link } from 'react-router-dom';
import { useTeams } from '../api';
import { Loading } from '../components';

export const HomePage = () => {
  const { data: teams, isLoading, error } = useTeams();

  const getApiStatus = () => {
    if (isLoading) return { text: 'Checking...', color: 'bg-gridiron-warning' };
    if (error) return { text: 'Offline', color: 'bg-gridiron-loss' };
    return { text: 'Online', color: 'bg-gridiron-win' };
  };

  const status = getApiStatus();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold text-gridiron-text-primary mb-4">
          Goal to Go Football
        </h1>
        <p className="text-xl text-gridiron-text-secondary max-w-2xl mx-auto">
          Your ultimate football management simulation. Build your team, simulate games,
          and lead your franchise to championship glory.
        </p>
      </div>

      {/* API Status Card */}
      <div className="card max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gridiron-text-primary">API Status</h3>
            <p className="text-sm text-gridiron-text-secondary mt-1">
              {isLoading ? 'Connecting to server...' : error ? 'Cannot connect to API' : `${teams?.length || 0} teams loaded`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`h-3 w-3 rounded-full ${status.color} animate-pulse`}></span>
            <span className="text-sm font-medium text-gridiron-text-secondary">{status.text}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Link to="/teams" className="card hover:border-gridiron-accent transition-all cursor-pointer group">
          <div className="text-center">
            <div className="text-4xl mb-3">🏈</div>
            <h3 className="text-lg font-semibold text-gridiron-text-primary mb-2 group-hover:text-gridiron-accent">View Teams</h3>
            <p className="text-sm text-gridiron-text-secondary">
              Browse all teams in the league
            </p>
          </div>
        </Link>

        <Link to="/simulate" className="card hover:border-gridiron-accent transition-all cursor-pointer group">
          <div className="text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gridiron-text-primary mb-2 group-hover:text-gridiron-accent">Simulate Game</h3>
            <p className="text-sm text-gridiron-text-secondary">
              Run a game simulation between two teams
            </p>
          </div>
        </Link>

        <Link to="/leagues" className="card hover:border-gridiron-accent transition-all cursor-pointer group">
          <div className="text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold text-gridiron-text-primary mb-2 group-hover:text-gridiron-accent">Leagues</h3>
            <p className="text-sm text-gridiron-text-secondary">
              Manage your leagues
            </p>
          </div>
        </Link>
      </div>

      {/* Stats Preview */}
      {teams && teams.length > 0 && (
        <div className="card max-w-4xl mx-auto">
          <h3 className="text-xl font-display font-semibold text-gridiron-text-primary mb-4">League Overview</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-display font-bold text-gridiron-accent">{teams.length}</div>
              <div className="text-sm text-gridiron-text-secondary mt-1">Total Teams</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-gridiron-win">
                {teams.reduce((sum, team) => sum + (team.players?.length || 0), 0)}
              </div>
              <div className="text-sm text-gridiron-text-secondary mt-1">Total Players</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-gridiron-warning">
                {teams.reduce((sum, team) => sum + team.wins, 0)}
              </div>
              <div className="text-sm text-gridiron-text-secondary mt-1">Total Wins</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <Loading />}

      {/* Error State */}
      {error && (
        <div className="card max-w-md mx-auto border-gridiron-loss">
          <p className="text-gridiron-loss text-center">
            <strong>API Connection Error</strong><br />
            <span className="text-gridiron-text-secondary">Unable to connect to the API. Please try again later.</span>
          </p>
        </div>
      )}
    </div>
  );
};
