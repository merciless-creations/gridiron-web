import { Link, useNavigate } from 'react-router-dom';
import { useLeagues, useCurrentUser } from '../api';
import { Loading, ErrorMessage } from '../components';

export const LeaguesPage = () => {
  const navigate = useNavigate();
  const { data: leagues, isLoading, error } = useLeagues();
  const { data: user } = useCurrentUser();

  // Get user's role in a specific league
  const getUserRoleInLeague = (leagueId: number) => {
    if (!user?.leagueRoles) return null;
    const roles = user.leagueRoles.filter(r => r.leagueId === leagueId);
    if (roles.some(r => r.role === 'Commissioner')) return 'Commissioner';
    if (roles.some(r => r.role === 'GeneralManager')) return 'GeneralManager';
    return null;
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load leagues" />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold text-gridiron-text-primary mb-2">My Leagues</h1>
          <p className="text-lg text-gridiron-text-secondary">
            Manage your leagues or create a new one
          </p>
        </div>
        <button
          onClick={() => navigate('/leagues/create')}
          className="btn-primary text-lg px-6 py-3"
          data-testid="create-league-button"
        >
          + Create League
        </button>
      </div>

      {/* Leagues Grid */}
      {!leagues || leagues.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏈</div>
          <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary mb-2">No Leagues Yet</h2>
          <p className="text-gridiron-text-secondary mb-6">
            Create your first league to get started, or ask a commissioner to add you to an existing league.
          </p>
          <button
            onClick={() => navigate('/leagues/create')}
            className="btn-primary"
            data-testid="create-first-league-button"
          >
            Create Your First League
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map(league => {
            const role = getUserRoleInLeague(league.id);
            return (
              <Link
                key={league.id}
                to={`/leagues/${league.id}`}
                className="card hover:border-gridiron-accent transition-all"
                data-testid={`league-card-${league.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-display font-semibold text-gridiron-text-primary">{league.name}</h3>
                  {role && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role === 'Commissioner'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-gridiron-accent/20 text-gridiron-accent'
                      }`}
                    >
                      {role === 'Commissioner' ? '👑 Commissioner' : '📋 GM'}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gridiron-text-secondary">
                  <div className="flex justify-between">
                    <span>Season:</span>
                    <span className="font-medium text-gridiron-text-primary">{league.season}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conferences:</span>
                    <span className="font-medium text-gridiron-text-primary">{league.totalConferences}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teams:</span>
                    <span className="font-medium text-gridiron-text-primary">{league.totalTeams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${league.isActive ? 'text-gridiron-win' : 'text-gridiron-text-muted'}`}>
                      {league.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gridiron-border-subtle">
                  <span className="text-gridiron-accent font-medium text-sm">
                    View League →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
