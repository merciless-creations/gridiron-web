import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../api';
import { Loading, ErrorMessage, ThemeSwitcher } from '../components';
import { usePreferences } from '../contexts';

export const ProfilePage = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  const { resetPreferences, isSaving } = usePreferences();
  const [copiedUserId, setCopiedUserId] = useState(false);

  const copyUserId = () => {
    if (user) {
      navigator.clipboard.writeText(user.id.toString());
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load user profile" />;
  if (!user) return <ErrorMessage message="User not found" />;

  // Group roles by league
  const leagueRolesMap = new Map<number, {
    leagueId: number;
    leagueName: string;
    roles: typeof user.leagueRoles;
  }>();

  user.leagueRoles.forEach(role => {
    if (!leagueRolesMap.has(role.leagueId)) {
      leagueRolesMap.set(role.leagueId, {
        leagueId: role.leagueId,
        leagueName: role.leagueName,
        roles: [],
      });
    }
    leagueRolesMap.get(role.leagueId)?.roles.push(role);
  });

  const leagues = Array.from(leagueRolesMap.values());

  // Get all teams the user manages
  const teams = user.leagueRoles
    .filter(role => role.role === 'GeneralManager' && role.teamId)
    .map(role => ({
      teamId: role.teamId!,
      teamName: role.teamName!,
      leagueId: role.leagueId,
      leagueName: role.leagueName,
    }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gridiron-text-primary mb-2">
          User Profile
        </h1>
        <p className="text-lg text-gridiron-text-secondary">
          Manage your account and view your leagues
        </p>
      </div>

      {/* User Info Card */}
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary mb-4">Account Information</h2>

        <div className="space-y-4">
          {/* User ID - Shareable Key */}
          <div className="bg-gridiron-accent/10 border-2 border-gridiron-accent/30 rounded p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
                  Your User ID
                </label>
                <div className="flex items-center space-x-3">
                  <code className="text-2xl font-display font-bold text-gridiron-accent">
                    {user.id}
                  </code>
                  <button
                    onClick={copyUserId}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    {copiedUserId ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gridiron-text-muted mt-2">
                  Share this ID with league commissioners to join a league
                </p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
              Display Name
            </label>
            <div className="text-lg text-gridiron-text-primary">{user.displayName}</div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
              Email
            </label>
            <div className="text-lg text-gridiron-text-primary">{user.email}</div>
          </div>

          {/* Global Admin Badge */}
          {user.isGlobalAdmin && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
              🔧 Global Administrator
            </div>
          )}

          {/* Account Activity */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gridiron-border-subtle">
            <div>
              <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
                Member Since
              </label>
              <div className="text-sm text-gridiron-text-primary">{formatDate(user.createdAt)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
                Last Login
              </label>
              <div className="text-sm text-gridiron-text-primary">{formatDate(user.lastLoginAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card max-w-2xl mx-auto" data-testid="preferences-section">
        <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary mb-4">
          Preferences
        </h2>

        <div className="space-y-6">
          {/* Theme Preference */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
                Theme
              </label>
              <p className="text-xs text-gridiron-text-muted">
                Choose your preferred color scheme
              </p>
            </div>
            <ThemeSwitcher />
          </div>

          {/* Reset Preferences */}
          <div className="pt-4 border-t border-gridiron-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gridiron-text-secondary block mb-1">
                  Reset All Preferences
                </label>
                <p className="text-xs text-gridiron-text-muted">
                  Restore theme, grid columns, and team colors to defaults
                </p>
              </div>
              <button
                onClick={() => resetPreferences()}
                disabled={isSaving}
                className="btn-secondary text-sm"
                data-testid="reset-preferences-button"
              >
                {isSaving ? 'Resetting...' : 'Reset to Defaults'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leagues Section */}
      <div className="card max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary">
            My Leagues ({leagues.length})
          </h2>
        </div>

        {leagues.length === 0 ? (
          <div className="text-center py-8 text-gridiron-text-muted">
            <div className="text-5xl mb-3">🏈</div>
            <p className="text-lg font-medium mb-2">No leagues yet</p>
            <p className="text-sm">
              Join a league by sharing your User ID with a commissioner, or create your own league
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leagues.map(league => (
              <Link
                key={league.leagueId}
                to={`/leagues/${league.leagueId}`}
                className="block card hover:border-gridiron-accent transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-gridiron-text-primary">
                      {league.leagueName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {league.roles.map(role => (
                        <span
                          key={role.id}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role.role === 'Commissioner'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-gridiron-accent/20 text-gridiron-accent'
                          }`}
                        >
                          {role.role === 'Commissioner' ? '👑 Commissioner' : '📋 GM'}
                          {role.teamName && ` - ${role.teamName}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-gridiron-accent text-xl">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Teams Section */}
      {teams.length > 0 && (
        <div className="card max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary">
              My Teams ({teams.length})
            </h2>
          </div>

          <div className="space-y-3">
            {teams.map(team => (
              <Link
                key={team.teamId}
                to={`/teams/${team.teamId}/manage`}
                className="block card hover:border-gridiron-win transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-gridiron-text-primary">
                      {team.teamName}
                    </h3>
                    <p className="text-sm text-gridiron-text-muted mt-1">
                      {team.leagueName}
                    </p>
                  </div>
                  <div className="text-gridiron-win text-xl">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
