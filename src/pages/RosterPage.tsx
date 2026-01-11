import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayers } from '../api/players';
import { useTeam } from '../api/teams';
import { Loading, GridColumnCustomizer } from '../components';
import { usePreferences } from '../contexts';
import { Position, PositionLabels } from '../types/enums';
import type { Player } from '../types/Player';

type PositionFilter = 'all' | 'offense' | 'defense' | 'special';
type SortField = 'name' | 'position' | 'number' | 'age' | 'salary' | 'overall';

const OFFENSE_POSITIONS: Position[] = [Position.QB, Position.RB, Position.WR, Position.TE, Position.OL];
const DEFENSE_POSITIONS: Position[] = [Position.DL, Position.LB, Position.CB, Position.S];
const SPECIAL_POSITIONS: Position[] = [Position.K, Position.P];

// Calculate overall rating from key attributes
function calculateOverall(player: Player): number {
  const attrs = [
    player.speed,
    player.strength,
    player.agility,
    player.awareness,
  ];
  const avg = attrs.reduce((sum, val) => sum + val, 0) / attrs.length;
  return Math.round(avg);
}

// Get position color for badge
function getPositionColor(position: Position): string {
  if (OFFENSE_POSITIONS.includes(position)) {
    return 'bg-emerald-600 text-white';
  }
  if (DEFENSE_POSITIONS.includes(position)) {
    return 'bg-red-600 text-white';
  }
  return 'bg-amber-600 text-white';
}

// Format salary as currency
function formatSalary(salary: number): string {
  if (salary >= 1000000) {
    return `$${(salary / 1000000).toFixed(1)}M`;
  }
  return `$${(salary / 1000).toFixed(0)}K`;
}

// Column definitions for the roster grid
const ROSTER_COLUMNS = [
  { key: 'number', label: '#', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'position', label: 'Pos', defaultVisible: true },
  { key: 'overall', label: 'OVR', defaultVisible: true },
  { key: 'age', label: 'Age', defaultVisible: true },
  { key: 'exp', label: 'Exp', defaultVisible: true },
  { key: 'college', label: 'College', defaultVisible: true },
  { key: 'salary', label: 'Salary', defaultVisible: true },
  { key: 'contract', label: 'Contract', defaultVisible: true },
  { key: 'health', label: 'Health', defaultVisible: true },
];

export const RosterPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNum = Number(teamId);

  // Get preferences
  const { preferences, setGridPreferences } = usePreferences();
  const gridPrefs = preferences.grids?.roster;

  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  const [sortField, setSortField] = useState<SortField>(
    (gridPrefs?.sortColumn as SortField) ?? 'position'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    gridPrefs?.sortDirection ?? 'asc'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Track visible columns from preferences
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    gridPrefs?.columns ?? ROSTER_COLUMNS.filter(c => c.defaultVisible).map(c => c.key)
  );

  // Sync visible columns when preferences change
  useEffect(() => {
    if (gridPrefs?.columns) {
      setVisibleColumns(gridPrefs.columns);
    }
  }, [gridPrefs?.columns?.join(',')]);

  // Handle column visibility changes
  const handleColumnsChange = useCallback((columns: string[]) => {
    setVisibleColumns(columns);
  }, []);

  const { data: team, isLoading: teamLoading, error: teamError } = useTeam(teamIdNum);
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers(teamIdNum);

  const isLoading = teamLoading || playersLoading;
  const error = teamError || playersError;

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];

    let filtered = [...players];

    // Apply position filter
    if (positionFilter === 'offense') {
      filtered = filtered.filter(p => OFFENSE_POSITIONS.includes(p.position));
    } else if (positionFilter === 'defense') {
      filtered = filtered.filter(p => DEFENSE_POSITIONS.includes(p.position));
    } else if (positionFilter === 'special') {
      filtered = filtered.filter(p => SPECIAL_POSITIONS.includes(p.position));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
        PositionLabels[p.position].toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
          break;
        case 'position':
          comparison = a.position - b.position;
          if (comparison === 0) {
            comparison = a.number - b.number;
          }
          break;
        case 'number':
          comparison = a.number - b.number;
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'salary':
          comparison = a.salary - b.salary;
          break;
        case 'overall':
          comparison = calculateOverall(a) - calculateOverall(b);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [players, positionFilter, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
    }
    // Persist sort preferences
    setGridPreferences('roster', {
      sortColumn: field,
      sortDirection: newDirection,
    });
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ^' : ' v';
  };

  if (isLoading) {
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

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Roster</h2>
        <p className="text-gray-400 mb-6">
          Something went wrong while loading the roster. Please try again.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/teams/${teamId}/manage`}
            className="text-gridiron-accent hover:underline text-sm mb-2 inline-block"
          >
            &larr; Back to Team Management
          </Link>
          <h1 className="text-3xl font-bold">
            {team.city} {team.name} Roster
          </h1>
          <p className="text-gray-400">{filteredPlayers.length} Players</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Position Filter Tabs */}
          <div className="inline-flex rounded-lg bg-gridiron-bg-tertiary p-1">
            <button
              onClick={() => setPositionFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                positionFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPositionFilter('offense')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                positionFilter === 'offense'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Offense
            </button>
            <button
              onClick={() => setPositionFilter('defense')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                positionFilter === 'defense'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Defense
            </button>
            <button
              onClick={() => setPositionFilter('special')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                positionFilter === 'special'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Special Teams
            </button>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Column Customizer */}
          <GridColumnCustomizer
            gridKey="roster"
            columns={ROSTER_COLUMNS}
            onChange={handleColumnsChange}
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gridiron-text-secondary uppercase tracking-wider border-b border-gridiron-border-subtle">
                {visibleColumns.includes('number') && (
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gridiron-text-primary"
                    onClick={() => handleSort('number')}
                  >
                    #{getSortIndicator('number')}
                  </th>
                )}
                {visibleColumns.includes('name') && (
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gridiron-text-primary"
                    onClick={() => handleSort('name')}
                  >
                    Name{getSortIndicator('name')}
                  </th>
                )}
                {visibleColumns.includes('position') && (
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gridiron-text-primary"
                    onClick={() => handleSort('position')}
                  >
                    Pos{getSortIndicator('position')}
                  </th>
                )}
                {visibleColumns.includes('overall') && (
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gridiron-text-primary text-center"
                    onClick={() => handleSort('overall')}
                  >
                    OVR{getSortIndicator('overall')}
                  </th>
                )}
                {visibleColumns.includes('age') && (
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gridiron-text-primary text-center"
                    onClick={() => handleSort('age')}
                  >
                    Age{getSortIndicator('age')}
                  </th>
                )}
                {visibleColumns.includes('exp') && (
                  <th className="px-4 py-3 text-center">Exp</th>
                )}
                {visibleColumns.includes('college') && (
                  <th className="px-4 py-3">College</th>
                )}
                {visibleColumns.includes('salary') && (
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gridiron-text-primary text-right"
                    onClick={() => handleSort('salary')}
                  >
                    Salary{getSortIndicator('salary')}
                  </th>
                )}
                {visibleColumns.includes('contract') && (
                  <th className="px-4 py-3 text-center">Contract</th>
                )}
                {visibleColumns.includes('health') && (
                  <th className="px-4 py-3 text-center">Health</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-gridiron-text-muted">
                    No players found
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <PlayerRow key={player.id} player={player} visibleColumns={visibleColumns} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface PlayerRowProps {
  player: Player;
  visibleColumns: string[];
}

function PlayerRow({ player, visibleColumns }: PlayerRowProps) {
  const overall = calculateOverall(player);
  const overallColor =
    overall >= 85 ? 'text-gridiron-accent' :
    overall >= 75 ? 'text-yellow-400' :
    overall >= 65 ? 'text-orange-400' :
    'text-red-400';

  return (
    <tr className="hover:bg-gridiron-bg-tertiary/50 transition-colors">
      {visibleColumns.includes('number') && (
        <td className="px-4 py-3 text-gridiron-text-secondary font-mono">{player.number}</td>
      )}
      {visibleColumns.includes('name') && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-gridiron-text-primary font-medium">
              {player.firstName} {player.lastName}
            </span>
            {player.isInjured && (
              <span className="px-1.5 py-0.5 text-xs bg-gridiron-loss text-white rounded">INJ</span>
            )}
          </div>
        </td>
      )}
      {visibleColumns.includes('position') && (
        <td className="px-4 py-3">
          <span className={`px-2 py-1 text-xs font-medium rounded ${getPositionColor(player.position)}`}>
            {PositionLabels[player.position]}
          </span>
        </td>
      )}
      {visibleColumns.includes('overall') && (
        <td className="px-4 py-3 text-center">
          <span className={`font-bold ${overallColor}`}>{overall}</span>
        </td>
      )}
      {visibleColumns.includes('age') && (
        <td className="px-4 py-3 text-center text-gridiron-text-secondary">{player.age}</td>
      )}
      {visibleColumns.includes('exp') && (
        <td className="px-4 py-3 text-center text-gridiron-text-secondary">{player.exp} yr</td>
      )}
      {visibleColumns.includes('college') && (
        <td className="px-4 py-3 text-gridiron-text-secondary">{player.college}</td>
      )}
      {visibleColumns.includes('salary') && (
        <td className="px-4 py-3 text-right text-gridiron-text-secondary">
          {formatSalary(player.salary)}
        </td>
      )}
      {visibleColumns.includes('contract') && (
        <td className="px-4 py-3 text-center text-gridiron-text-secondary">
          {player.contractYears} yr
        </td>
      )}
      {visibleColumns.includes('health') && (
        <td className="px-4 py-3 text-center">
          <HealthBar health={player.health} />
        </td>
      )}
    </tr>
  );
}

interface HealthBarProps {
  health: number;
}

function HealthBar({ health }: HealthBarProps) {
  const color =
    health >= 80 ? 'bg-gridiron-win' :
    health >= 60 ? 'bg-yellow-500' :
    health >= 40 ? 'bg-orange-500' :
    'bg-gridiron-loss';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gridiron-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${health}%` }}
        />
      </div>
      <span className="text-xs text-gridiron-text-muted">{health}</span>
    </div>
  );
}

export default RosterPage;
