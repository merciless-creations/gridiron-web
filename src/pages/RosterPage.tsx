import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePlayers } from '../api/players';
import { useTeam } from '../api/teams';
import {
  Loading,
  GridColumnCustomizer,
  ColumnFilterPopover,
  ResizableColumnHeader,
} from '../components';
import { passesFilter, type NumericFilterValue } from '../utils/numericFilter';
import { usePreferences } from '../contexts';
import { useTeamColors } from '../hooks';
import type { GridKey } from '../contexts/preferences/types';
import {
  Position,
  PositionLabels,
  PlayerStatus,
  PlayerStatusShortLabels,
  PlayerStatusColors,
} from '../types/enums';
import type { Player } from '../types/Player';
import {
  type Skill,
  type RosterGridType,
  SKILL_LABELS,
  SKILL_ABBREV,
  ALL_SKILLS,
  ROSTER_GRID_POSITIONS,
  getGridSkills,
  isSkillRelevant,
} from '../types/PositionSkills';

// Columns that support numeric filtering
const NUMERIC_COLUMNS: Set<string> = new Set([
  'number', 'age', 'exp', 'salary', 'overall', 'health',
  ...ALL_SKILLS,
]);

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

// Get player status from player data
function getPlayerStatus(player: Player): PlayerStatus {
  if (player.isRetired) return PlayerStatus.Retired;
  if (player.isInjured) return PlayerStatus.Injured;
  return PlayerStatus.Active;
}

// Statuses available for filtering (Active/Retired excluded - use no filter for "all")
const FILTERABLE_STATUSES: PlayerStatus[] = [PlayerStatus.Injured];

// Base column definitions (non-skill columns)
const BASE_COLUMNS = [
  { key: 'number', label: '#', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'nameShort', label: 'Name Short', defaultVisible: false },
  { key: 'position', label: 'Pos', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
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
  nameShort: 'name', // Sort by name field
  position: 'position',
  status: null,
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
  nameShort: { label: 'Name', className: 'px-4 py-3' },
  position: { label: 'Pos', className: 'px-4 py-3' },
  status: { label: 'Status', className: 'px-4 py-3 text-center' },
  overall: { label: 'OVR', className: 'px-4 py-3 text-center' },
  age: { label: 'Age', className: 'px-4 py-3 text-center' },
  exp: { label: 'Exp', className: 'px-4 py-3 text-center' },
  college: { label: 'College', className: 'px-4 py-3' },
  salary: { label: 'Salary', className: 'px-4 py-3 text-right' },
  contract: { label: 'Contract', className: 'px-4 py-3 text-center' },
  health: { label: 'Health', className: 'px-4 py-3 text-center' },
  // Skill columns (use 3-letter abbreviations)
  ...Object.fromEntries(ALL_SKILLS.map(skill => [
    skill,
    { label: SKILL_ABBREV[skill], className: 'px-2 py-3 text-center' }
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

  // Get preferences and team colors
  const { preferences, setGridPreferences, getTeamColorScheme } = usePreferences();
  const gridPrefs = preferences.grids?.[gridKey];
  const { applyColors, DEFAULT_COLORS } = useTeamColors();

  // Apply team colors when page loads
  useEffect(() => {
    const savedColors = getTeamColorScheme(teamIdNum);
    applyColors(savedColors ?? DEFAULT_COLORS);
  }, [teamIdNum, getTeamColorScheme, applyColors, DEFAULT_COLORS]);

  // Get available columns for this grid type
  const availableColumns = useMemo(() => getColumnsForGrid(activeTab), [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');

  // Track visible columns - use local state for optimistic updates, fall back to preferences
  const [localColumns, setLocalColumns] = useState<string[] | null>(null);

  // Position filter state - load from preferences, empty means all positions in the tab
  const [positionFilter, setPositionFilter] = useState<Position[]>(
    () => (gridPrefs?.positionFilter as Position[]) ?? []
  );

  // Status filter state - load from preferences, empty means all statuses
  const [statusFilter, setStatusFilter] = useState<PlayerStatus[]>(
    () => (gridPrefs?.statusFilter as PlayerStatus[]) ?? []
  );

  // Numeric column filters - load from preferences
  const [columnFilters, setColumnFilters] = useState<Record<string, NumericFilterValue | null>>(
    () => (gridPrefs?.numericFilters as Record<string, NumericFilterValue | null>) ?? {}
  );

  // Reset state when tab changes
  const [prevTab, setPrevTab] = useState(activeTab);
  if (prevTab !== activeTab) {
    setPrevTab(activeTab);
    setLocalColumns(null);
    // Load filters from new tab's preferences
    const newGridPrefs = preferences.grids?.[GRID_TYPE_TO_KEY[activeTab]];
    setPositionFilter((newGridPrefs?.positionFilter as Position[]) ?? []);
    setStatusFilter((newGridPrefs?.statusFilter as PlayerStatus[]) ?? []);
    setColumnFilters((newGridPrefs?.numericFilters as Record<string, NumericFilterValue | null>) ?? {});
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

  // Handle position filter change (local state only, persist on close)
  const handlePositionFilterChange = useCallback((positions: Position[]) => {
    setPositionFilter(positions);
  }, []);

  // Handle status filter change (local state only, persist on close)
  const handleStatusFilterChange = useCallback((statuses: PlayerStatus[]) => {
    setStatusFilter(statuses);
  }, []);

  // Handle column filter change (local state only, persist on close)
  const handleColumnFilterChange = useCallback((columnKey: string, filter: NumericFilterValue | null) => {
    setColumnFilters(prev => ({ ...prev, [columnKey]: filter }));
  }, []);

  // Persist filters when popover closes
  const handleFilterClose = useCallback(() => {
    // Build clean numeric filters (remove nulls)
    const cleanFilters: Record<string, NumericFilterValue> = {};
    for (const [key, value] of Object.entries(columnFilters)) {
      if (value !== null) {
        cleanFilters[key] = value;
      }
    }

    // Persist position, status, and numeric filters
    setGridPreferences(gridKey, {
      positionFilter: positionFilter,
      statusFilter: statusFilter,
      numericFilters: cleanFilters,
    });
  }, [columnFilters, positionFilter, statusFilter, gridKey, setGridPreferences]);

  // Get column widths from preferences
  const columnWidths = gridPrefs?.columnWidths ?? {};

  // Handle column width change
  const handleColumnWidthChange = useCallback((columnKey: string, width: number) => {
    setGridPreferences(gridKey, {
      columnWidths: {
        ...columnWidths,
        [columnKey]: width,
      },
    });
  }, [gridKey, columnWidths, setGridPreferences]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setPositionFilter([]);
    setStatusFilter([]);
    setColumnFilters({});
    // Persist cleared filters
    setGridPreferences(gridKey, { positionFilter: [], statusFilter: [], numericFilters: {} });
  }, [gridKey, setGridPreferences]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || positionFilter.length > 0 || statusFilter.length > 0 || Object.values(columnFilters).some(f => f !== null);

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

    // Apply position filter dropdown (within the allowed positions for this tab)
    if (positionFilter.length > 0) {
      filtered = filtered.filter(p => positionFilter.includes(p.position));
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(p => statusFilter.includes(getPlayerStatus(p)));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
        PositionLabels[p.position].toLowerCase().includes(query)
      );
    }

    // Apply column filters
    for (const [columnKey, filter] of Object.entries(columnFilters)) {
      if (!filter) continue;

      filtered = filtered.filter(player => {
        let value: number | null | undefined;

        // Get the value based on column key
        if (columnKey === 'overall') {
          value = calculateOverall(player);
        } else if (ALL_SKILLS.includes(columnKey as Skill)) {
          // For skills, only filter players where the skill is relevant
          const skill = columnKey as Skill;
          if (!isSkillRelevant(player.position, skill)) {
            return false; // Exclude non-relevant skills from filter results
          }
          value = player[skill as keyof Player] as number;
        } else if (columnKey in player) {
          value = player[columnKey as keyof Player] as number;
        }

        return passesFilter(value, filter);
      });
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
  }, [players, activeTab, positionFilter, statusFilter, searchQuery, columnFilters, sortField, sortDirection]);

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
            className="text-team-primary hover:underline text-sm mb-2 inline-block"
          >
            &larr; Back to Team Management
          </Link>
          <h1 className="text-3xl font-bold text-team-primary">
            {team.city} {team.name} Roster
          </h1>
          <p className="text-team-secondary">{filteredPlayers.length} Players</p>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="card border-l-4 border-team-primary">
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
                      ? 'bg-team-primary text-team-secondary'
                      : 'text-gray-400 hover:text-team-primary'
                  }`}
                  data-testid={`roster-tab-${tab.key}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Column Customizer */}
            <div className="flex flex-1 gap-3 md:justify-end flex-wrap">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-1 md:max-w-xs md:flex-none"
                data-testid="roster-search"
              />
              <GridColumnCustomizer
                gridKey={gridKey}
                columns={availableColumns}
                onChange={handleColumnsChange}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                  data-testid="clear-all-filters"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="card overflow-hidden border-l-4 border-team-primary">
        <div className="overflow-x-auto">
          <table className="min-w-full" data-testid="roster-table">
            <thead>
              <tr className="text-left text-xs text-gridiron-text-secondary uppercase tracking-wider border-b border-gridiron-border-subtle">
                {visibleColumns.map((columnKey) => {
                  const config = COLUMN_HEADER_CONFIG[columnKey];
                  const sortableField = SORTABLE_COLUMNS[columnKey];
                  const isNumeric = NUMERIC_COLUMNS.has(columnKey);
                  const isPosition = columnKey === 'position';
                  const isStatus = columnKey === 'status';
                  const hasFilter = isNumeric || isPosition || isStatus;

                  // Determine filter type
                  const filterType = isPosition ? 'position' : isStatus ? 'status' : 'numeric';

                  if (!config) return null;

                  return (
                    <ResizableColumnHeader
                      key={columnKey}
                      columnKey={columnKey}
                      width={columnWidths[columnKey]}
                      className={config.className}
                      onWidthChange={handleColumnWidthChange}
                      data-testid={`column-header-${columnKey}`}
                    >
                      <div className="flex items-center gap-1 pr-2">
                        <span
                          className={sortableField ? 'cursor-pointer hover:text-gridiron-text-primary' : ''}
                          onClick={sortableField ? () => handleSort(sortableField) : undefined}
                        >
                          {config.label}{sortableField ? getSortIndicator(sortableField) : ''}
                        </span>
                        {hasFilter && (
                          <ColumnFilterPopover
                            columnKey={columnKey}
                            type={filterType}
                            numericFilter={isNumeric ? columnFilters[columnKey] ?? null : undefined}
                            onNumericFilterChange={isNumeric ? (filter) => handleColumnFilterChange(columnKey, filter) : undefined}
                            positionFilter={isPosition ? positionFilter : undefined}
                            availablePositions={isPosition ? ROSTER_GRID_POSITIONS[activeTab] : undefined}
                            onPositionFilterChange={isPosition ? handlePositionFilterChange : undefined}
                            statusFilter={isStatus ? statusFilter : undefined}
                            availableStatuses={isStatus ? FILTERABLE_STATUSES : undefined}
                            onStatusFilterChange={isStatus ? handleStatusFilterChange : undefined}
                            onClose={handleFilterClose}
                          />
                        )}
                      </div>
                    </ResizableColumnHeader>
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
            <span className="text-gridiron-text-primary font-medium">
              {player.firstName} {player.lastName}
            </span>
          </td>
        );
      case 'nameShort':
        return (
          <td key={columnKey} className="px-4 py-3" data-testid={`cell-${columnKey}`}>
            <span className="text-gridiron-text-primary font-medium">
              {player.firstName.charAt(0)}. {player.lastName}
            </span>
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
      case 'status': {
        const status = getPlayerStatus(player);
        return (
          <td key={columnKey} className="px-4 py-3 text-center" data-testid={`cell-${columnKey}`}>
            {status !== PlayerStatus.Active && (
              <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${PlayerStatusColors[status]}`}>
                {PlayerStatusShortLabels[status]}
              </span>
            )}
          </td>
        );
      }
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
