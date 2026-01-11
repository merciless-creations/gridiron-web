import { useParams, Link } from 'react-router-dom';
import { useTeam } from '../api/teams';
import { Loading, ReadOnlyBanner, TeamColorSchemeEditor } from '../components';
import { usePermissions } from '../hooks/usePermissions';
import { useActiveContext } from '../contexts';

export const TeamManagePage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNum = Number(teamId);
  const { leagueId } = useActiveContext();

  const { data: team, isLoading, error } = useTeam(teamIdNum);
  const permissions = usePermissions(teamIdNum);

  if (isLoading || permissions.isLoading) {
    return <Loading />;
  }

  if (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;

    if (status === 404) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Team Not Found</h2>
          <p className="text-gray-400 mb-6">
            The team you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      );
    }

    if (status === 403) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You don't have permission to manage this team.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Team</h2>
        <p className="text-gray-400 mb-6">
          Something went wrong while loading your team. Please try again.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400">Team Not Found</h2>
        <Link to="/dashboard" className="btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const record = `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`;
  const fullTeamName = `${team.city} ${team.name}`;

  return (
    <div className="space-y-6">
      {/* Read-only banner for scouting mode */}
      {permissions.isReadOnly && (
        <ReadOnlyBanner teamName={fullTeamName} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-gridiron-accent hover:underline text-sm mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">
            {fullTeamName}
          </h1>
          <p className="text-gray-400">
            {permissions.isReadOnly ? 'Team Scouting' : 'Team Management'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{record}</div>
          <div className="text-gray-400 text-sm">
            {team.championships > 0 && `${team.championships} Championship${team.championships > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-gray-400 text-sm">Budget</div>
            <div className="text-lg font-semibold">${(team.budget / 1000000).toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Fan Support</div>
            <div className="text-lg font-semibold">{team.fanSupport}%</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Chemistry</div>
            <div className="text-lg font-semibold">{team.chemistry}%</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Roster Size</div>
            <div className="text-lg font-semibold">{team.players?.length ?? '--'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          {permissions.isReadOnly ? 'View Options' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissions.canEdit ? (
            // Full edit mode - show management links
            <>
              <Link
                to={`/teams/${teamId}/depth-chart`}
                className="block p-4 bg-gridiron-light rounded-lg hover:bg-gridiron-accent/20 transition-colors"
              >
                <div className="font-semibold mb-1">Depth Chart</div>
                <div className="text-gray-400 text-sm">Set your starting lineup and backups</div>
              </Link>
              <Link
                to={`/teams/${teamId}/roster`}
                className="block p-4 bg-gridiron-light rounded-lg hover:bg-gridiron-accent/20 transition-colors"
              >
                <div className="font-semibold mb-1">Full Roster</div>
                <div className="text-gray-400 text-sm">View and manage your players</div>
              </Link>
              {leagueId && (
                <Link
                  to={`/leagues/${leagueId}/standings`}
                  className="block p-4 bg-gridiron-light rounded-lg hover:bg-gridiron-accent/20 transition-colors"
                >
                  <div className="font-semibold mb-1">League Standings</div>
                  <div className="text-gray-400 text-sm">View league rankings and leaders</div>
                </Link>
              )}
              <div className="block p-4 bg-gridiron-light rounded-lg opacity-50 cursor-not-allowed">
                <div className="font-semibold mb-1">Upcoming Games</div>
                <div className="text-gray-400 text-sm">Coming soon</div>
              </div>
            </>
          ) : (
            // Read-only scouting mode - show view-only links
            <>
              <Link
                to={`/teams/${teamId}/depth-chart`}
                className="block p-4 bg-gridiron-light rounded-lg hover:bg-gridiron-accent/20 transition-colors"
              >
                <div className="font-semibold mb-1">View Depth Chart</div>
                <div className="text-gray-400 text-sm">See their starting lineup and backups</div>
              </Link>
              <Link
                to={`/teams/${teamId}/roster`}
                className="block p-4 bg-gridiron-light rounded-lg hover:bg-gridiron-accent/20 transition-colors"
              >
                <div className="font-semibold mb-1">View Roster</div>
                <div className="text-gray-400 text-sm">Scout their players</div>
              </Link>
              {leagueId && (
                <Link
                  to={`/leagues/${leagueId}/standings`}
                  className="block p-4 bg-gridiron-light rounded-lg hover:bg-gridiron-accent/20 transition-colors"
                >
                  <div className="font-semibold mb-1">League Standings</div>
                  <div className="text-gray-400 text-sm">View league rankings and leaders</div>
                </Link>
              )}
              <div className="block p-4 bg-gridiron-light rounded-lg opacity-50 cursor-not-allowed">
                <div className="font-semibold mb-1">Team Schedule</div>
                <div className="text-gray-400 text-sm">Coming soon</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Season Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-gridiron-win">{team.wins}</div>
            <div className="text-gridiron-text-secondary text-sm">Wins</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gridiron-loss">{team.losses}</div>
            <div className="text-gridiron-text-secondary text-sm">Losses</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gridiron-text-muted">{team.ties}</div>
            <div className="text-gridiron-text-secondary text-sm">Ties</div>
          </div>
        </div>
      </div>

      {/* Team Color Customization - Only for team owners */}
      {permissions.canEdit && (
        <TeamColorSchemeEditor
          teamId={teamIdNum}
          teamName={fullTeamName}
          defaultColors={{
            primary: '#00d4aa', // Gridiron accent color
            secondary: '#1a1a24', // Gridiron bg-tertiary
          }}
        />
      )}
    </div>
  );
};

export default TeamManagePage;
