import { Link, useNavigate } from 'react-router-dom';
import { useMyTeams, useTakeControl } from '../api/teamAssignments';
import { useMyLeagues } from '../api/leagues';
import { Loading } from '../components/Loading';
import { useState } from 'react';
import { WelcomeModal } from '../components/WelcomeModal';
import type { UserTeamDto } from '../api/teamAssignments';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: leagues, isLoading: leaguesLoading, isError: leaguesError } = useMyLeagues();
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useMyTeams();
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

  if (leaguesLoading || teamsLoading) {
    return <Loading />;
  }

  if (leaguesError) {
    return <div className="text-red-500">Error loading leagues. Please try again.</div>;
  }

  if (teamsError) {
    return <div className="text-red-500">Error loading teams. Please try again.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gridiron-light">Your Dashboard</h1>

      {/* Leagues Section */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gridiron-light mb-4">
          Leagues You Manage
        </h2>
        
        {leagues && leagues.length > 0 ? (
          <div className="space-y-2">
            {leagues.map((league) => (
              <div
                key={league.id}
                className="flex items-center justify-between p-3 bg-gridiron-dark rounded-lg"
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
          <p className="text-gridiron-gray">No leagues yet</p>
        )}

        <div className="mt-4">
          <Link to="/leagues/create" className="btn-primary">
            + Create League
          </Link>
        </div>
      </section>

      {/* Teams Section */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gridiron-light mb-4">
          Teams You Manage
        </h2>

        {teams && teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between p-3 bg-gridiron-dark rounded-lg cursor-pointer hover:bg-gridiron-dark/80"
                onClick={() => handleTeamClick(team)}
              >
                <div className="flex items-center gap-2">
                  {!team.hasViewed && (
                    <span className="text-lg" title="New assignment">🆕</span>
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
          <p className="text-gridiron-gray">No teams assigned</p>
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
