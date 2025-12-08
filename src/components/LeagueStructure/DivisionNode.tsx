import { useState } from 'react';
import type { Division } from '../../types/League';
import type { Team } from '../../types/Team';
import { useAutoSave } from '../../hooks/useAutoSave';
import { updateDivision } from '../../api/leagues';
import { TeamNode } from './TeamNode';

interface DivisionNodeProps {
  division: Division;
  onUpdate: (updatedDivision: Division) => void;
  onDelete: () => void;
  onAddTeam: () => void;
  onDeleteTeam: (teamId: number) => void;
  onUpdateTeam: (updatedTeam: Team) => void;
  canAddTeam: boolean;
}

export function DivisionNode({
  division,
  onUpdate,
  onDelete,
  onAddTeam,
  onDeleteTeam,
  onUpdateTeam,
  canAddTeam,
}: DivisionNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(division.name);

  const { save, isSaving, error } = useAutoSave({
    saveFn: async (data: { name: string }) => {
      await updateDivision(division.id, data);
      onUpdate({ ...division, name: data.name });
    },
    debounceMs: 800,
  });

  const handleNameBlur = () => {
    setIsEditing(false);
    if (name !== division.name && name.trim()) {
      save({ name: name.trim() });
    } else {
      setName(division.name);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete ${division.name}? This will remove all ${division.teams.length} teams and their players.`
      )
    ) {
      onDelete();
    }
  };

  return (
    <div className="ml-6 my-2">
      {/* Division Header */}
      <div className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 rounded hover:bg-zinc-700/50 group">
        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {/* Division Name (editable) */}
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameBlur();
              if (e.key === 'Escape') {
                setName(division.name);
                setIsEditing(false);
              }
            }}
            className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-white font-medium hover:text-emerald-400 transition-colors"
          >
            {division.name}
          </button>
        )}

        {/* Team Count */}
        <span className="text-sm text-gray-400">
          ({division.teams.length} team{division.teams.length !== 1 ? 's' : ''})
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
            onClick={onAddTeam}
            disabled={!canAddTeam}
            className="text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors px-2 py-1 text-sm"
            title={canAddTeam ? 'Add team' : 'Maximum teams reached'}
          >
            + Team
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Delete division"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Teams List */}
      {isExpanded && (
        <div className="ml-4 mt-1">
          {division.teams.length === 0 ? (
            <div className="text-gray-500 text-sm py-2 px-3 italic">No teams</div>
          ) : (
            division.teams.map((team) => (
              <TeamNode
                key={team.id}
                team={team}
                onUpdate={onUpdateTeam}
                onDelete={() => onDeleteTeam(team.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
