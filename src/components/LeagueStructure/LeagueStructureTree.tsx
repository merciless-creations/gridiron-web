import type { LeagueDetail, LeagueConstraints, Conference, Division } from '../../types/League';
import type { Team } from '../../types/Team';
import { ConferenceNode } from './ConferenceNode';

interface LeagueStructureTreeProps {
  league: LeagueDetail;
  constraints: LeagueConstraints;
  onUpdateLeague: (updatedLeague: LeagueDetail) => void;
  onAddConference: () => void;
  onDeleteConference: (conferenceId: number) => void;
  onUpdateConference: (updatedConference: Conference) => void;
  onAddDivision: (conferenceId: number) => void;
  onDeleteDivision: (conferenceId: number, divisionId: number) => void;
  onUpdateDivision: (conferenceId: number, updatedDivision: Division) => void;
  onAddTeam: (conferenceId: number, divisionId: number) => void;
  onDeleteTeam: (conferenceId: number, divisionId: number, teamId: number) => void;
  onUpdateTeam: (conferenceId: number, divisionId: number, updatedTeam: Team) => void;
}

export function LeagueStructureTree({
  league,
  constraints,
  onAddConference,
  onDeleteConference,
  onUpdateConference,
  onAddDivision,
  onDeleteDivision,
  onUpdateDivision,
  onAddTeam,
  onDeleteTeam,
  onUpdateTeam,
}: LeagueStructureTreeProps) {
  const canAddConference = league.conferences.length < constraints.maxConferences;
  
  // Check if any conference can add divisions
  const canAddDivision = (conference: Conference) => 
    conference.divisions.length < constraints.maxDivisionsPerConference;
  
  // Check if any division can add teams
  const canAddTeam = (division: Division) => 
    division.teams.length < constraints.maxTeamsPerDivision;

  return (
    <div className="space-y-4">
      {/* Conferences */}
      {league.conferences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No conferences yet</p>
          <button
            onClick={onAddConference}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
          >
            Add First Conference
          </button>
        </div>
      ) : (
        <>
          {league.conferences.map((conference) => (
            <ConferenceNode
              key={conference.id}
              conference={conference}
              onUpdate={onUpdateConference}
              onDelete={() => onDeleteConference(conference.id)}
              onAddDivision={() => onAddDivision(conference.id)}
              onDeleteDivision={(divisionId) => onDeleteDivision(conference.id, divisionId)}
              onUpdateDivision={(division) => onUpdateDivision(conference.id, division)}
              onAddTeam={(divisionId) => onAddTeam(conference.id, divisionId)}
              onDeleteTeam={(divisionId, teamId) => onDeleteTeam(conference.id, divisionId, teamId)}
              onUpdateTeam={(divisionId, team) => onUpdateTeam(conference.id, divisionId, team)}
              canAddDivision={canAddDivision(conference)}
              canAddTeam={conference.divisions.some(canAddTeam)}
            />
          ))}

          {/* Add Conference Button */}
          <div className="pt-4">
            <button
              onClick={onAddConference}
              disabled={!canAddConference}
              className="w-full py-3 border-2 border-dashed border-zinc-700 hover:border-emerald-600 disabled:border-zinc-800 disabled:cursor-not-allowed text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 rounded-lg transition-colors font-medium"
            >
              {canAddConference
                ? '+ Add Conference'
                : `Maximum conferences reached (${constraints.maxConferences})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
