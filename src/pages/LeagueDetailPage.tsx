import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useLeague,
  useUpdateLeague,
  useDeleteLeague,
  usePopulateRosters,
  useCurrentUser,
  useLeagueUsers,
  useAssignLeagueRole,
  useRemoveLeagueRole,
} from '../api';
import { Loading, ErrorMessage, SimulationLockBanner } from '../components';
import type { UpdateLeagueRequest } from '../types/League';
import type { User } from '../types/User';

export const LeagueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leagueId = parseInt(id || '0');

  const { data: league, isLoading, error } = useLeague(leagueId);
  const { data: currentUser } = useCurrentUser();
  const { data: leagueUsers } = useLeagueUsers(leagueId);
  const updateLeague = useUpdateLeague();
  const deleteLeague = useDeleteLeague();
  const populateRosters = usePopulateRosters();
  const assignRole = useAssignLeagueRole();
  const removeRole = useRemoveLeagueRole();

  // UI State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPopulateModal, setShowPopulateModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateLeagueRequest>({});
  const [addUserFormData, setAddUserFormData] = useState({
    userId: '',
    role: 'GeneralManager' as 'Commissioner' | 'GeneralManager',
    teamId: '',
  });
  const [populateSeed, setPopulateSeed] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedConferences, setExpandedConferences] = useState<Set<number>>(new Set());

  // Check if current user is commissioner
  const isCommissioner = currentUser?.leagueRoles?.some(
    r => r.leagueId === leagueId && r.role === 'Commissioner'
  ) || currentUser?.isGlobalAdmin;

  const toggleConference = (conferenceId: number) => {
    setExpandedConferences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conferenceId)) {
        newSet.delete(conferenceId);
      } else {
        newSet.add(conferenceId);
      }
      return newSet;
    });
  };

  const handleOpenEditModal = () => {
    if (league) {
      setEditFormData({
        name: league.name,
        season: league.season,
        isActive: league.isActive,
      });
    }
    setShowEditModal(true);
  };

  const handleUpdateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await updateLeague.mutateAsync({ id: leagueId, request: editFormData });
      setShowEditModal(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update league');
    }
  };

  const handleDeleteLeague = async () => {
    setActionError(null);
    try {
      await deleteLeague.mutateAsync(leagueId);
      navigate('/leagues');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete league');
    }
  };

  const handlePopulateRosters = async () => {
    setActionError(null);
    try {
      const seed = populateSeed ? parseInt(populateSeed) : undefined;
      await populateRosters.mutateAsync({ id: leagueId, seed });
      setShowPopulateModal(false);
      setPopulateSeed('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to populate rosters');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const userId = parseInt(addUserFormData.userId);
    if (isNaN(userId)) {
      setActionError('Please enter a valid User ID');
      return;
    }

    try {
      await assignRole.mutateAsync({
        userId,
        request: {
          leagueId,
          role: addUserFormData.role,
          teamId: addUserFormData.role === 'GeneralManager' && addUserFormData.teamId
            ? parseInt(addUserFormData.teamId)
            : undefined,
        },
      });
      setShowAddUserModal(false);
      setAddUserFormData({ userId: '', role: 'GeneralManager', teamId: '' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: number, roleId: number) => {
    setActionError(null);
    try {
      await removeRole.mutateAsync({ userId, roleId });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove role');
    }
  };

  // Get all teams in the league for the dropdown
  const allTeams = league?.conferences?.flatMap(c =>
    c.divisions.flatMap(d => d.teams)
  ) || [];

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load league" />;
  if (!league) return <ErrorMessage message="League not found" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link to="/leagues" className="text-gridiron-accent hover:underline text-sm mb-2 inline-block">
            ← Back to Leagues
          </Link>
          <h1 className="text-4xl font-display font-bold text-gridiron-text-primary" data-testid="league-name">{league.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-lg text-gridiron-text-secondary">Season {league.season}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              league.isActive ? 'bg-gridiron-win/20 text-gridiron-win' : 'bg-gridiron-bg-tertiary text-gridiron-text-muted'
            }`}>
              {league.isActive ? 'Active' : 'Inactive'}
            </span>
            {isCommissioner && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                👑 Commissioner
              </span>
            )}
          </div>
        </div>

        {isCommissioner && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowPopulateModal(true)}
              className="px-4 py-2 bg-gridiron-win text-white rounded hover:bg-green-600 transition-colors"
              data-testid="populate-rosters-button"
            >
              Populate Rosters
            </button>
            <button
              onClick={handleOpenEditModal}
              className="btn-secondary"
              data-testid="edit-league-button"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger"
              data-testid="delete-league-button"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Simulation Lock Banner */}
      {league.simulationInProgress && league.simulationStartedAt && (
        <SimulationLockBanner
          startedAt={league.simulationStartedAt}
          startedByUserName={league.simulationStartedByUserName}
        />
      )}

      {/* Error Message */}
      {actionError && (
        <div className="bg-gridiron-loss/10 border border-gridiron-loss/30 text-gridiron-loss px-4 py-3 rounded" data-testid="action-error">
          {actionError}
        </div>
      )}

      {/* League Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-gridiron-accent">{league.totalConferences}</div>
          <div className="text-sm text-gridiron-text-secondary">Conferences</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-gridiron-accent">
            {league.conferences?.reduce((acc, c) => acc + c.divisions.length, 0) || 0}
          </div>
          <div className="text-sm text-gridiron-text-secondary">Divisions</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-gridiron-accent">{league.totalTeams}</div>
          <div className="text-sm text-gridiron-text-secondary">Teams</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-gridiron-accent">
            {allTeams.reduce((acc, t) => acc + (t.players?.length || 0), 0)}
          </div>
          <div className="text-sm text-gridiron-text-secondary">Players</div>
        </div>
      </div>

      {/* League Structure */}
      <div className="card">
        <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary mb-4">League Structure</h2>

        {league.conferences?.length === 0 ? (
          <p className="text-gridiron-text-muted">No conferences in this league yet.</p>
        ) : (
          <div className="space-y-4">
            {league.conferences?.map(conference => (
              <div key={conference.id} className="border border-gridiron-border-subtle rounded overflow-hidden">
                <button
                  onClick={() => toggleConference(conference.id)}
                  className="w-full flex justify-between items-center p-4 bg-gridiron-bg-secondary hover:bg-gridiron-bg-tertiary transition-colors"
                  data-testid={`conference-${conference.id}`}
                >
                  <span className="text-lg font-display font-semibold text-gridiron-text-primary">{conference.name}</span>
                  <span className="text-gridiron-text-secondary">
                    {conference.divisions.length} divisions • {conference.divisions.reduce((acc, d) => acc + d.teams.length, 0)} teams
                    <span className="ml-2">{expandedConferences.has(conference.id) ? '▼' : '▶'}</span>
                  </span>
                </button>

                {expandedConferences.has(conference.id) && (
                  <div className="p-4 space-y-4 bg-gridiron-bg-primary">
                    {conference.divisions.map(division => (
                      <div key={division.id} className="ml-4">
                        <h4 className="font-medium text-gridiron-text-secondary mb-2" data-testid={`division-${division.id}`}>
                          {division.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 ml-4">
                          {division.teams.map(team => (
                            <Link
                              key={team.id}
                              to={`/teams/${team.id}/manage`}
                              className="block p-3 bg-gridiron-bg-card border border-gridiron-border-subtle rounded hover:border-gridiron-accent transition-all"
                              data-testid={`team-${team.id}`}
                            >
                              <div className="font-medium text-gridiron-text-primary">{team.city} {team.name}</div>
                              <div className="text-sm text-gridiron-text-muted">
                                {team.players?.length || 0} players
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management (Commissioner Only) */}
      {isCommissioner && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-semibold text-gridiron-text-primary">League Members</h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="btn-primary"
              data-testid="add-user-button"
            >
              + Add User
            </button>
          </div>

          {!leagueUsers || leagueUsers.length === 0 ? (
            <p className="text-gridiron-text-muted">No other users in this league yet.</p>
          ) : (
            <div className="space-y-3">
              {leagueUsers.map((user: User) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gridiron-bg-secondary rounded">
                  <div>
                    <div className="font-medium text-gridiron-text-primary">{user.displayName}</div>
                    <div className="text-sm text-gridiron-text-muted">{user.email}</div>
                    <div className="flex gap-2 mt-1">
                      {user.leagueRoles
                        .filter(r => r.leagueId === leagueId)
                        .map(role => (
                          <span
                            key={role.id}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              role.role === 'Commissioner'
                                ? 'bg-purple-500/20 text-purple-300'
                                : role.controlState === 'Pending'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-gridiron-accent/20 text-gridiron-accent'
                            }`}
                          >
                            {role.role === 'Commissioner'
                              ? '👑 Commissioner'
                              : role.controlState === 'Pending'
                                ? `⏳ ${role.teamName} (Invited)`
                                : `📋 ${role.teamName}`}
                          </span>
                        ))}
                    </div>
                  </div>
                  {user.id !== currentUser?.id && (
                    <div className="flex gap-2">
                      {user.leagueRoles
                        .filter(r => r.leagueId === leagueId)
                        .map(role => (
                          <button
                            key={role.id}
                            onClick={() => handleRemoveRole(user.id, role.id)}
                            className="text-gridiron-loss hover:text-red-400 text-sm"
                            data-testid={`remove-role-${role.id}`}
                          >
                            Remove
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit League Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="edit-league-modal">
          <div className="bg-gridiron-bg-card border border-gridiron-border-subtle rounded max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gridiron-text-primary">Edit League</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gridiron-text-muted hover:text-gridiron-text-primary text-2xl">×</button>
              </div>

              <form onSubmit={handleUpdateLeague} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gridiron-text-secondary mb-1">League Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="input-field"
                    data-testid="edit-name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gridiron-text-secondary mb-1">Season</label>
                  <input
                    type="number"
                    value={editFormData.season || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, season: parseInt(e.target.value) || undefined })}
                    className="input-field"
                    data-testid="edit-season-input"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editFormData.isActive || false}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-gridiron-accent focus:ring-gridiron-accent border-gridiron-border-subtle rounded bg-gridiron-bg-secondary"
                    data-testid="edit-active-checkbox"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gridiron-text-secondary">Active</label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={updateLeague.isPending} className="flex-1 btn-primary disabled:opacity-50" data-testid="submit-edit-league">
                    {updateLeague.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete League Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="delete-league-modal">
          <div className="bg-gridiron-bg-card border border-gridiron-border-subtle rounded max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-display font-bold text-gridiron-text-primary mb-4">Delete League</h2>
              <p className="text-gridiron-text-secondary mb-6">
                Are you sure you want to delete <strong className="text-gridiron-text-primary">{league.name}</strong>? This will remove all conferences, divisions, teams, and players. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button onClick={handleDeleteLeague} disabled={deleteLeague.isPending} className="flex-1 btn-danger disabled:opacity-50" data-testid="confirm-delete-league">
                  {deleteLeague.isPending ? 'Deleting...' : 'Delete League'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Populate Rosters Modal */}
      {showPopulateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="populate-rosters-modal">
          <div className="bg-gridiron-bg-card border border-gridiron-border-subtle rounded max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-display font-bold text-gridiron-text-primary mb-4">Populate Team Rosters</h2>
              <p className="text-gridiron-text-secondary mb-4">
                This will generate 53 random players for each team in the league. Existing rosters will be cleared.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gridiron-text-secondary mb-1">Seed (optional)</label>
                <input
                  type="number"
                  value={populateSeed}
                  onChange={(e) => setPopulateSeed(e.target.value)}
                  placeholder="Leave empty for random"
                  className="input-field"
                  data-testid="populate-seed-input"
                />
                <p className="text-xs text-gridiron-text-muted mt-1">Use a seed for reproducible player generation</p>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setShowPopulateModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button onClick={handlePopulateRosters} disabled={populateRosters.isPending} className="flex-1 btn-primary disabled:opacity-50" data-testid="confirm-populate-rosters">
                  {populateRosters.isPending ? 'Populating...' : 'Populate Rosters'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="add-user-modal">
          <div className="bg-gridiron-bg-card border border-gridiron-border-subtle rounded max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gridiron-text-primary">Add User to League</h2>
                <button onClick={() => setShowAddUserModal(false)} className="text-gridiron-text-muted hover:text-gridiron-text-primary text-2xl">×</button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gridiron-text-secondary mb-1">User ID *</label>
                  <input
                    type="text"
                    value={addUserFormData.userId}
                    onChange={(e) => setAddUserFormData({ ...addUserFormData, userId: e.target.value })}
                    placeholder="Enter the user's ID number"
                    className="input-field"
                    data-testid="add-user-id-input"
                  />
                  <p className="text-xs text-gridiron-text-muted mt-1">Ask the user for their ID from their profile page</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gridiron-text-secondary mb-1">Role *</label>
                  <select
                    value={addUserFormData.role}
                    onChange={(e) => setAddUserFormData({ ...addUserFormData, role: e.target.value as 'Commissioner' | 'GeneralManager' })}
                    className="select-field"
                    data-testid="add-user-role-select"
                  >
                    <option value="GeneralManager">General Manager (Team)</option>
                    <option value="Commissioner">Commissioner (League)</option>
                  </select>
                </div>

                {addUserFormData.role === 'GeneralManager' && (
                  <div>
                    <label className="block text-sm font-medium text-gridiron-text-secondary mb-1">Team *</label>
                    <select
                      value={addUserFormData.teamId}
                      onChange={(e) => setAddUserFormData({ ...addUserFormData, teamId: e.target.value })}
                      className="select-field"
                      data-testid="add-user-team-select"
                    >
                      <option value="">Select a team...</option>
                      {allTeams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.city} {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={assignRole.isPending} className="flex-1 btn-primary disabled:opacity-50" data-testid="submit-add-user">
                    {assignRole.isPending ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
