import { useState } from 'react';
import type { Conference, Division } from '../../types/League';
import type { Team } from '../../types/Team';
import { useAutoSave } from '../../hooks/useAutoSave';
import { updateConference } from '../../api/leagues';
import { DivisionNode } from './DivisionNode';

interface ConferenceNodeProps {
  conference: Conference;
  onUpdate: (updatedConference: Conference) => void;
  onDelete: () => void;
  onAddDivision: () => void;
  onDeleteDivision: (divisionId: number) => void;
  onUpdateDivision: (updatedDivision: Division) => void;
  onAddTeam: (divisionId: number) => void;
  onDeleteTeam: (divisionId: number, teamId: number) => void;
  onUpdateTeam: (divisionId: number, updatedTeam: Team) => void;
  canAddDivision: boolean;
  canAddTeam: boolean;
}

export function ConferenceNode({
  conference,
  onUpdate,
  onDelete,
  onAddDivision,
  onDeleteDivision,
  onUpdateDivision,
  onAddTeam,
  onDeleteTeam,
  onUpdateTeam,
  canAddDivision,
  canAddTeam,
}: ConferenceNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(conference.name);

  const { save, isSaving, error } = useAutoSave({
    saveFn: async (data: { name: string }) => {
      await updateConference(conference.id, data);
      onUpdate({ ...conference, name: data.name });
    },
    debounceMs: 800,
  });

  const handleNameBlur = () => {
    setIsEditing(false);
    if (name !== conference.name && name.trim()) {
      save({ name: name.trim() });
    } else {
      setName(conference.name);
    }
  };

  const handleDelete = () => {
    const totalTeams = conference.divisions.reduce((sum, div) => sum + div.teams.length, 0);
    if (
      window.confirm(
        `Delete ${conference.name}? This will remove ${conference.divisions.length} divisions and ${totalTeams} teams.`
      )
    ) {
      onDelete();
    }
  };

  const totalTeams = conference.divisions.reduce((sum, div) => sum + div.teams.length, 0);

  return (
    <div className="mb-4">
      {/* Conference Header */}
      <div className="flex items-center gap-3 py-3 px-4 bg-zinc-800 rounded-lg hover:bg-zinc-700/80 group border border-zinc-700">
        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {/* Conference Name (editable) */}
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameBlur();
              if (e.key === 'Escape') {
                setName(conference.name);
                setIsEditing(false);
              }
            }}
            className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-white text-lg font-bold hover:text-emerald-400 transition-colors"
          >
            {conference.name}
          </button>
        )}

        {/* Stats */}
        <span className="text-sm text-gray-400">
          {conference.divisions.length} division{conference.divisions.length !== 1 ? 's' : ''} •{' '}
          {totalTeams} team{totalTeams !== 1 ? 's' : ''}
        </span>

        {/* Save Status */}
        {isSaving && <span className="text-xs text-gray-500 ml-2">Saving...</span>}
        {error && (
          <span className="text-xs text-red-400 ml-2" title={error.message}>
            ⚠
          </span>
        )}

        {/* Actions */}
        <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onAddDivision}
            disabled={!canAddDivision}
            className="text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors px-3 py-1 text-sm font-medium"
            title={canAddDivision ? 'Add division' : 'Maximum divisions reached'}
          >
            + Division
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Delete conference"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Divisions List */}
      {isExpanded && (
        <div className="mt-2">
          {conference.divisions.length === 0 ? (
            <div className="text-gray-500 text-sm py-3 px-6 italic ml-6">No divisions</div>
          ) : (
            conference.divisions.map((division) => (
              <DivisionNode
                key={division.id}
                division={division}
                onUpdate={onUpdateDivision}
                onDelete={() => onDeleteDivision(division.id)}
                onAddTeam={() => onAddTeam(division.id)}
                onDeleteTeam={(teamId) => onDeleteTeam(division.id, teamId)}
                onUpdateTeam={(team) => onUpdateTeam(division.id, team)}
                canAddTeam={canAddTeam}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
