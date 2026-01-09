import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayers } from '../api/players';
import { useTeam } from '../api/teams';
import { Loading } from '../components/Loading';
import { Position, PositionLabels } from '../types/enums';
import type { Player } from '../types/Player';

type PositionFilter = 'all' | 'offense' | 'defense' | 'special';
type SortField = 'name' | 'position' | 'number' | 'age' | 'salary' | 'overall';
type SortDirection = 'asc' | 'desc';

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

export const RosterPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNum = Number(teamId);

  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
          <div className="inline-flex rounded-lg bg-gridiron-light p-1">
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
              className="w-full px-4 py-2 rounded-lg bg-gridiron-light text-white placeholder-gray-500 border border-zinc-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-zinc-700">
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('number')}
                >
                  #{getSortIndicator('number')}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('name')}
                >
                  Name{getSortIndicator('name')}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('position')}
                >
                  Pos{getSortIndicator('position')}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white text-center"
                  onClick={() => handleSort('overall')}
                >
                  OVR{getSortIndicator('overall')}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white text-center hidden md:table-cell"
                  onClick={() => handleSort('age')}
                >
                  Age{getSortIndicator('age')}
                </th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Exp</th>
                <th className="px-4 py-3 hidden xl:table-cell">College</th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white text-right hidden md:table-cell"
                  onClick={() => handleSort('salary')}
                >
                  Salary{getSortIndicator('salary')}
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Contract</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No players found
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <PlayerRow key={player.id} player={player} />
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
}

function PlayerRow({ player }: PlayerRowProps) {
  const overall = calculateOverall(player);
  const overallColor =
    overall >= 85 ? 'text-emerald-400' :
    overall >= 75 ? 'text-yellow-400' :
    overall >= 65 ? 'text-orange-400' :
    'text-red-400';

  return (
    <tr className="hover:bg-zinc-700/30 transition-colors">
      <td className="px-4 py-3 text-gray-400 font-mono">{player.number}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">
            {player.firstName} {player.lastName}
          </span>
          {player.isInjured && (
            <span className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded">INJ</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 text-xs font-medium rounded ${getPositionColor(player.position)}`}>
          {PositionLabels[player.position]}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`font-bold ${overallColor}`}>{overall}</span>
      </td>
      <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">{player.age}</td>
      <td className="px-4 py-3 text-center text-gray-400 hidden lg:table-cell">{player.exp} yr</td>
      <td className="px-4 py-3 text-gray-400 hidden xl:table-cell">{player.college}</td>
      <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
        {formatSalary(player.salary)}
      </td>
      <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">
        {player.contractYears} yr
      </td>
      <td className="px-4 py-3 text-center hidden lg:table-cell">
        <HealthBar health={player.health} />
      </td>
    </tr>
  );
}

interface HealthBarProps {
  health: number;
}

function HealthBar({ health }: HealthBarProps) {
  const color =
    health >= 80 ? 'bg-emerald-500' :
    health >= 60 ? 'bg-yellow-500' :
    health >= 40 ? 'bg-orange-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${health}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{health}</span>
    </div>
  );
}

export default RosterPage;
