import { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePlayers } from '../api/players';
import { useTeam } from '../api/teams';
import { Loading, GridColumnCustomizer } from '../components';
import { usePreferences } from '../contexts';
import type { GridKey } from '../contexts/preferences/types';
import { Position, PositionLabels } from '../types/enums';
import type { Player } from '../types/Player';
import {
  type Skill,
  type RosterGridType,
  SKILL_LABELS,
  ALL_SKILLS,
  ROSTER_GRID_POSITIONS,
  getGridSkills,
  isSkillRelevant,
} from '../types/PositionSkills';

type SortField = 'name' | 'position' | 'number' | 'age' | 'salary' | 'overall' | Skill;

const OFFENSE_POSITIONS: Position[] = [Position.QB, Position.RB, Position.WR, Position.TE, Position.OL];
const DEFENSE_POSITIONS: Position[] = [Position.DL, Position.LB, Position.CB, Position.S];

// Map roster grid type to grid key for preferences
const GRID_TYPE_TO_KEY: Record<RosterGridType, GridKey> = {
  all: 'rosterAll',
  offense: 'rosterOffense',
  defense: 'rosterDefense',
  specialTeams: 'rosterSpecialTeams',
};

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

// Base column definitions (non-skill columns)
const BASE_COLUMNS = [
  { key: 'number', label: '#', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'position', label: 'Pos', defaultVisible: true },
  { key: 'overall', label: 'OVR', defaultVisible: true },
  { key: 'age', label: 'Age', defaultVisible: true },
  { key: 'exp', label: 'Exp', defaultVisible: false },
  { key: 'college', label: 'College', defaultVisible: false },
  { key: 'salary', label: 'Salary', defaultVisible: false },
  { key: 'contract', label: 'Contract', defaultVisible: false },
  { key: 'health', label: 'Health', defaultVisible: false },
];

// Create skill column definitions
function createSkillColumns(skills: Skill[]) {
  return skills.map(skill => ({
    key: skill,
    label: SKILL_LABELS[skill],
    defaultVisible: false,
  }));
}

// Get columns for a specific grid type
function getColumnsForGrid(gridType: RosterGridType) {
  const availableSkills = gridType === 'all' ? ALL_SKILLS : getGridSkills(gridType);
  return [...BASE_COLUMNS, ...createSkillColumns(availableSkills)];
}

// Sortable columns mapping
const SORTABLE_COLUMNS: Record<string, SortField | null> = {
  number: 'number',
  name: 'name',
  position: 'position',
  overall: 'overall',
  age: 'age',
  salary: 'salary',
  exp: null,
  college: null,
  contract: null,
  health: null,
  // All skills are sortable
  ...Object.fromEntries(ALL_SKILLS.map(skill => [skill, skill as SortField])),
};

// Column header configurations
const COLUMN_HEADER_CONFIG: Record<string, { label: string; className: string }> = {
  number: { label: '#', className: 'px-4 py-3' },
  name: { label: 'Name', className: 'px-4 py-3' },
  position: { label: 'Pos', className: 'px-4 py-3' },
  overall: { label: 'OVR', className: 'px-4 py-3 text-center' },
  age: { label: 'Age', className: 'px-4 py-3 text-center' },
  exp: { label: 'Exp', className: 'px-4 py-3 text-center' },
  college: { label: 'College', className: 'px-4 py-3' },
  salary: { label: 'Salary', className: 'px-4 py-3 text-right' },
  contract: { label: 'Contract', className: 'px-4 py-3 text-center' },
  health: { label: 'Health', className: 'px-4 py-3 text-center' },
  // Skill columns
  ...Object.fromEntries(ALL_SKILLS.map(skill => [
    skill,
    { label: SKILL_LABELS[skill], className: 'px-4 py-3 text-center' }
  ])),
};

// Tab configuration
const TABS: { key: RosterGridType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'offense', label: 'Offense' },
  { key: 'defense', label: 'Defense' },
  { key: 'specialTeams', label: 'Special Teams' },
];

export const RosterPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const teamIdNum = Number(teamId);

  // Get the active tab from URL or default to 'all'
  const activeTab = (searchParams.get('tab') as RosterGridType) || 'all';
  const gridKey = GRID_TYPE_TO_KEY[activeTab];

  // Get preferences
  const { preferences, setGridPreferences } = usePreferences();
  const gridPrefs = preferences.grids?.[gridKey];

  // Get available columns for this grid type
  const availableColumns = useMemo(() => getColumnsForGrid(activeTab), [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');

  // Track visible columns - use local state for optimistic updates, fall back to preferences
  const [localColumns, setLocalColumns] = useState<string[] | null>(null);

  // Reset local columns when tab changes
  const [prevTab, setPrevTab] = useState(activeTab);
  if (prevTab !== activeTab) {
    setPrevTab(activeTab);
    setLocalColumns(null);
  }

  // Derive visible columns from local state or preferences
  const visibleColumns = useMemo(() => {
    if (localColumns !== null) {
      return localColumns;
    }
    return gridPrefs?.columns ?? availableColumns.filter(c => c.defaultVisible).map(c => c.key);
  }, [localColumns, gridPrefs?.columns, availableColumns]);

  // Sort state
  const [sortField, setSortField] = useState<SortField>(
    (gridPrefs?.sortColumn as SortField) ?? 'position'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    gridPrefs?.sortDirection ?? 'asc'
  );

  // Handle column visibility changes - update local state for immediate feedback
  const handleColumnsChange = useCallback((columns: string[]) => {
    setLocalColumns(columns);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: RosterGridType) => {
    setSearchParams({ tab });
    // Reset sort when changing tabs
    setSortField('position');
    setSortDirection('asc');
  }, [setSearchParams]);

  const { data: team, isLoading: teamLoading, error: teamError } = useTeam(teamIdNum);
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers(teamIdNum);

  const isLoading = teamLoading || playersLoading;
  const error = teamError || playersError;

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];

    let filtered = [...players];

    // Apply position filter based on active tab
    const allowedPositions = ROSTER_GRID_POSITIONS[activeTab];
    filtered = filtered.filter(p => allowedPositions.includes(p.position));

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

      // Check if sorting by a skill
      if (ALL_SKILLS.includes(sortField as Skill)) {
        const skill = sortField as Skill;
        const aValue = a[skill as keyof Player] as number;
        const bValue = b[skill as keyof Player] as number;
        const aRelevant = isSkillRelevant(a.position, skill);
        const bRelevant = isSkillRelevant(b.position, skill);

        // Non-relevant skills sort to bottom
        if (!aRelevant && !bRelevant) {
          comparison = 0;
        } else if (!aRelevant) {
          return 1; // a goes to bottom
        } else if (!bRelevant) {
          return -1; // b goes to bottom
        } else {
          comparison = aValue - bValue;
        }
      } else {
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
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [players, activeTab, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
      newDirection = 'asc';
      setSortDirection('asc');
    }
    // Persist sort preferences
    setGridPreferences(gridKey, {
      sortColumn: field,
      sortDirection: newDirection,
    });
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
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

      {/* Filters and Tabs */}
      <div className="card">
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="inline-flex rounded-lg bg-gridiron-bg-tertiary p-1" data-testid="roster-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid={`roster-tab-${tab.key}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Column Customizer */}
            <div className="flex flex-1 gap-4 md:justify-end">
              <input
                type="text"
                placeholder="Search by name or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-1 md:max-w-xs"
                data-testid="roster-search"
              />
              <GridColumnCustomizer
                gridKey={gridKey}
                columns={availableColumns}
                onChange={handleColumnsChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="roster-table">
            <thead>
              <tr className="text-left text-xs text-gridiron-text-secondary uppercase tracking-wider border-b border-gridiron-border-subtle">
                {visibleColumns.map((columnKey) => {
                  const config = COLUMN_HEADER_CONFIG[columnKey];
                  const sortableField = SORTABLE_COLUMNS[columnKey];

                  if (!config) return null;

                  return (
                    <th
                      key={columnKey}
                      className={`${config.className} ${sortableField ? 'cursor-pointer hover:text-gridiron-text-primary' : ''}`}
                      onClick={sortableField ? () => handleSort(sortableField) : undefined}
                      data-testid={`column-header-${columnKey}`}
                    >
                      {config.label}{sortableField ? getSortIndicator(sortableField) : ''}
                    </th>
                  );
                })}
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

  // Render cell based on column key
  const renderCell = (columnKey: string) => {
    // Check if it's a skill column
    if (ALL_SKILLS.includes(columnKey as Skill)) {
      const skill = columnKey as Skill;
      const value = player[skill as keyof Player] as number;
      const isRelevant = isSkillRelevant(player.position, skill);

      return (
        <td key={columnKey} className="px-4 py-3 text-center" data-testid={`cell-${columnKey}`}>
          {isRelevant ? (
            <span className={getSkillColor(value)}>{value}</span>
          ) : (
            <span className="text-gridiron-text-muted">--</span>
          )}
        </td>
      );
    }

    switch (columnKey) {
      case 'number':
        return (
          <td key={columnKey} className="px-4 py-3 text-gridiron-text-secondary font-mono" data-testid={`cell-${columnKey}`}>
            {player.number}
          </td>
        );
      case 'name':
        return (
          <td key={columnKey} className="px-4 py-3" data-testid={`cell-${columnKey}`}>
            <div className="flex items-center gap-2">
              <span className="text-gridiron-text-primary font-medium">
                {player.firstName} {player.lastName}
              </span>
              {player.isInjured && (
                <span className="px-1.5 py-0.5 text-xs bg-gridiron-loss text-white rounded">INJ</span>
              )}
            </div>
          </td>
        );
      case 'position':
        return (
          <td key={columnKey} className="px-4 py-3" data-testid={`cell-${columnKey}`}>
            <span className={`px-2 py-1 text-xs font-medium rounded ${getPositionColor(player.position)}`}>
              {PositionLabels[player.position]}
            </span>
          </td>
        );
      case 'overall':
        return (
          <td key={columnKey} className="px-4 py-3 text-center" data-testid={`cell-${columnKey}`}>
            <span className={`font-bold ${overallColor}`}>{overall}</span>
          </td>
        );
      case 'age':
        return (
          <td key={columnKey} className="px-4 py-3 text-center text-gridiron-text-secondary" data-testid={`cell-${columnKey}`}>
            {player.age}
          </td>
        );
      case 'exp':
        return (
          <td key={columnKey} className="px-4 py-3 text-center text-gridiron-text-secondary" data-testid={`cell-${columnKey}`}>
            {player.exp} yr
          </td>
        );
      case 'college':
        return (
          <td key={columnKey} className="px-4 py-3 text-gridiron-text-secondary" data-testid={`cell-${columnKey}`}>
            {player.college}
          </td>
        );
      case 'salary':
        return (
          <td key={columnKey} className="px-4 py-3 text-right text-gridiron-text-secondary" data-testid={`cell-${columnKey}`}>
            {formatSalary(player.salary)}
          </td>
        );
      case 'contract':
        return (
          <td key={columnKey} className="px-4 py-3 text-center text-gridiron-text-secondary" data-testid={`cell-${columnKey}`}>
            {player.contractYears} yr
          </td>
        );
      case 'health':
        return (
          <td key={columnKey} className="px-4 py-3 text-center" data-testid={`cell-${columnKey}`}>
            <HealthBar health={player.health} />
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <tr className="hover:bg-gridiron-bg-tertiary/50 transition-colors" data-testid={`player-row-${player.id}`}>
      {visibleColumns.map(renderCell)}
    </tr>
  );
}

// Get color class based on skill value
function getSkillColor(value: number): string {
  if (value >= 85) return 'text-gridiron-accent font-semibold';
  if (value >= 75) return 'text-yellow-400';
  if (value >= 65) return 'text-orange-400';
  if (value >= 50) return 'text-gridiron-text-secondary';
  return 'text-red-400';
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
