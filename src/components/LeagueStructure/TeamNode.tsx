import { useState } from 'react';
import type { Team } from '../../types/Team';
import { useAutoSave } from '../../hooks/useAutoSave';
import { updateTeam } from '../../api/teams';

interface TeamNodeProps {
  team: Team;
  onUpdate: (updatedTeam: Team) => void;
  onDelete: () => void;
}

export function TeamNode({ team, onUpdate, onDelete }: TeamNodeProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [name, setName] = useState(team.name);
  const [city, setCity] = useState(team.city);

  const { save, isSaving, error } = useAutoSave({
    saveFn: async (data: Partial<Team>) => {
      await updateTeam(team.id, data);
      onUpdate({ ...team, ...data });
    },
    debounceMs: 800,
  });

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (name !== team.name && name.trim()) {
      save({ name: name.trim() });
    } else {
      setName(team.name); // Reset if empty or unchanged
    }
  };

  const handleCityBlur = () => {
    setIsEditingCity(false);
    if (city !== team.city && city.trim()) {
      save({ city: city.trim() });
    } else {
      setCity(team.city); // Reset if empty or unchanged
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${team.name} (${team.city})? This will remove all players on this team.`)) {
      onDelete();
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-zinc-700/30 rounded group">
      {/* Team Icon */}
      <span className="text-gray-500">•</span>

      {/* Team Name (editable) */}
      {isEditingName ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNameBlur();
            if (e.key === 'Escape') {
              setName(team.name);
              setIsEditingName(false);
            }
          }}
          className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditingName(true)}
          className="text-white hover:text-emerald-400 transition-colors text-left"
        >
          {team.name}
        </button>
      )}

      {/* City (editable) */}
      {isEditingCity ? (
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={handleCityBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCityBlur();
            if (e.key === 'Escape') {
              setCity(team.city);
              setIsEditingCity(false);
            }
          }}
          className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditingCity(true)}
          className="text-gray-400 hover:text-gray-300 transition-colors text-left"
        >
          ({team.city})
        </button>
      )}

      {/* Save Status */}
      {isSaving && (
        <span className="text-xs text-gray-500 ml-2">Saving...</span>
      )}
      {error && (
        <span className="text-xs text-red-400 ml-2" title={error.message}>
          ⚠
        </span>
      )}

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="ml-auto opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
        title="Delete team"
      >
        🗑️
      </button>
    </div>
  );
}
