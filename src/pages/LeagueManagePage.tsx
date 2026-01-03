import { useParams } from 'react-router-dom';
import { useLeague } from '../api/leagues';
import { useLeagueTeamAssignments, useRemoveAssignment, useSelfAssign } from '../api/teamAssignments';
import { useLeagueTeams } from '../api/teams';
import { Loading } from '../components/Loading';
import { useState } from 'react';
import { AssignGmModal } from '../components/AssignGmModal';

interface TeamWithAssignment {
  teamId: number;
  teamName: string;
  assignmentEmail: string | null;
  assignmentDisplayName: string | null;
  controlState: 'AiControlled' | 'Pending' | 'HumanControlled';
}

export function LeagueManagePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const leagueIdNum = parseInt(leagueId || '0', 10);

  const { data: league, isLoading: leagueLoading, isError: leagueError } = useLeague(leagueIdNum);
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useLeagueTeams(leagueIdNum);
  const { data: assignments, isLoading: assignmentsLoading, isError: assignmentsError } = useLeagueTeamAssignments(leagueIdNum);
  
  const removeAssignment = useRemoveAssignment();
  const selfAssign = useSelfAssign();

  const [assignModalTeamId, setAssignModalTeamId] = useState<number | null>(null);
  const [assignModalTeamName, setAssignModalTeamName] = useState<string>('');

  if (leagueLoading || teamsLoading || assignmentsLoading) {
    return <Loading />;
  }

  if (leagueError || teamsError || assignmentsError) {
    return <div className="text-red-500">Error loading team management. Please try again.</div>;
  }

  if (!league) {
    return <div className="text-gridiron-light">League not found</div>;
  }

  const teamsWithAssignments: TeamWithAssignment[] = (teams || []).map((team) => {
    const assignment = assignments?.find((a) => a.teamId === team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      assignmentEmail: assignment?.email || null,
      assignmentDisplayName: assignment?.displayName || null,
      controlState: assignment?.controlState || 'AiControlled',
    };
  });

  const unassignedFirst = [...teamsWithAssignments].sort((a, b) => {
    if (a.controlState === 'AiControlled' && b.controlState !== 'AiControlled') return -1;
    if (a.controlState !== 'AiControlled' && b.controlState === 'AiControlled') return 1;
    return 0;
  });

  const handleRemove = async (teamId: number) => {
    if (confirm('Remove GM from this team? The team will return to AI control.')) {
      await removeAssignment.mutateAsync({ leagueId: leagueIdNum, teamId });
    }
  };

  const handleSelfAssign = async (teamId: number) => {
    await selfAssign.mutateAsync({ leagueId: leagueIdNum, teamId });
  };

  const openAssignModal = (teamId: number, teamName: string) => {
    setAssignModalTeamId(teamId);
    setAssignModalTeamName(teamName);
  };

  const getStatusIndicator = (state: string) => {
    switch (state) {
      case 'HumanControlled':
        return { icon: '✅', label: 'Active' };
      case 'Pending':
        return { icon: '⏳', label: 'Pending' };
      default:
        return { icon: '🤖', label: 'Needs GM' };
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gridiron-light">
        Manage {league.name}
      </h1>

      <section className="card">
        <h2 className="text-xl font-semibold text-gridiron-light mb-4">
          Team Assignments
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gridiron-gray border-b border-gridiron-gray/30">
                <th className="pb-2">Team</th>
                <th className="pb-2">Assigned To</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unassignedFirst.map((team) => {
                const status = getStatusIndicator(team.controlState);
                return (
                  <tr
                    key={team.teamId}
                    className="border-b border-gridiron-gray/10 hover:bg-gridiron-dark/50"
                  >
                    <td className="py-3 text-gridiron-light">{team.teamName}</td>
                    <td className="py-3 text-gridiron-gray">
                      {team.assignmentEmail || '—'}
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1">
                        <span>{status.icon}</span>
                        <span className="text-gridiron-gray">{status.label}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {team.controlState === 'AiControlled' ? (
                          <>
                            <button
                              onClick={() => openAssignModal(team.teamId, team.teamName)}
                              className="btn-secondary text-sm"
                            >
                              Assign GM
                            </button>
                            <button
                              onClick={() => handleSelfAssign(team.teamId)}
                              className="btn-primary text-sm"
                              disabled={selfAssign.isPending}
                            >
                              I'll Take This
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRemove(team.teamId)}
                            className="btn-danger text-sm"
                            disabled={removeAssignment.isPending}
                          >
                            Remove GM
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {assignModalTeamId && (
        <AssignGmModal
          leagueId={leagueIdNum}
          teamId={assignModalTeamId}
          teamName={assignModalTeamName}
          onClose={() => setAssignModalTeamId(null)}
        />
      )}
    </div>
  );
}
