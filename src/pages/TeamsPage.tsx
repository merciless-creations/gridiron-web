import { useTeams } from '../api';
import { Loading, ErrorMessage } from '../components';
import type { Team } from '../types/Team';

export const TeamsPage = () => {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorMessage message="Failed to load teams. Unable to connect to the API." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gridiron-text-primary">Teams</h1>
          <p className="text-gridiron-text-secondary mt-1">
            {teams?.length || 0} teams in the league
          </p>
        </div>
      </div>

      {teams && teams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: Team) => (
            <div key={team.id} className="card hover:border-gridiron-accent transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-gridiron-text-primary">
                    {team.city} {team.name}
                  </h3>
                  <p className="text-sm text-gridiron-text-muted mt-1">
                    Division {team.divisionId || 'N/A'}
                  </p>
                </div>
                <div className="text-2xl">🏈</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-t border-gridiron-border-subtle">
                  <span className="text-sm text-gridiron-text-secondary">Record</span>
                  <span className="font-display font-semibold text-gridiron-text-primary">
                    {team.wins}-{team.losses}-{team.ties}
                  </span>
                </div>

                {team.championships > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-gridiron-border-subtle">
                    <span className="text-sm text-gridiron-text-secondary">Championships</span>
                    <span className="font-display font-semibold text-gridiron-warning">
                      🏆 {team.championships}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-t border-gridiron-border-subtle">
                  <span className="text-sm text-gridiron-text-secondary">Budget</span>
                  <span className="font-display font-semibold text-gridiron-text-primary">
                    ${(team.budget / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-gridiron-border-subtle">
                  <span className="text-sm text-gridiron-text-secondary">Roster</span>
                  <span className="font-display font-semibold text-gridiron-text-primary">
                    {team.players?.length || 0} players
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gridiron-border-subtle">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gridiron-text-muted">Fan Support:</span>
                    <div className="bg-gridiron-bg-secondary rounded-full h-2 mt-1">
                      <div
                        className="bg-gridiron-win h-2 rounded-full"
                        style={{ width: `${team.fanSupport}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gridiron-text-muted">Chemistry:</span>
                    <div className="bg-gridiron-bg-secondary rounded-full h-2 mt-1">
                      <div
                        className="bg-gridiron-accent h-2 rounded-full"
                        style={{ width: `${team.chemistry}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gridiron-text-secondary">No teams found. Create some teams to get started!</p>
        </div>
      )}
    </div>
  );
};
