import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeasonStandings } from '../api/season';
import type { TeamStanding } from '../types/Season';

type ViewMode = 'division' | 'conference' | 'league';
type SortField = 'winPercentage' | 'wins' | 'pointsFor' | 'pointsAgainst' | 'pointDifferential';
type SortDirection = 'asc' | 'desc';

// Mock league leaders data - In a real app, this would come from an API
// These stats are placeholders until a stats API endpoint is implemented
interface LeagueLeader {
  playerId: number;
  playerName: string;
  teamName: string;
  teamCity: string;
  value: number;
}

interface LeagueLeadersData {
  passing: {
    yards: LeagueLeader[];
    touchdowns: LeagueLeader[];
    rating: LeagueLeader[];
  };
  rushing: {
    yards: LeagueLeader[];
    touchdowns: LeagueLeader[];
    ypc: LeagueLeader[];
  };
  receiving: {
    yards: LeagueLeader[];
    touchdowns: LeagueLeader[];
    receptions: LeagueLeader[];
  };
  defense: {
    sacks: LeagueLeader[];
    interceptions: LeagueLeader[];
  };
}

// Mock data for league leaders - placeholder until API is available
const mockLeagueLeaders: LeagueLeadersData = {
  passing: {
    yards: [
      { playerId: 1, playerName: 'Patrick Mahomes', teamName: 'Chiefs', teamCity: 'Kansas City', value: 4183 },
      { playerId: 2, playerName: 'Josh Allen', teamName: 'Bills', teamCity: 'Buffalo', value: 4012 },
      { playerId: 3, playerName: 'Joe Burrow', teamName: 'Bengals', teamCity: 'Cincinnati', value: 3891 },
      { playerId: 4, playerName: 'Tua Tagovailoa', teamName: 'Dolphins', teamCity: 'Miami', value: 3745 },
      { playerId: 5, playerName: 'Lamar Jackson', teamName: 'Ravens', teamCity: 'Baltimore', value: 3678 },
    ],
    touchdowns: [
      { playerId: 1, playerName: 'Patrick Mahomes', teamName: 'Chiefs', teamCity: 'Kansas City', value: 38 },
      { playerId: 2, playerName: 'Josh Allen', teamName: 'Bills', teamCity: 'Buffalo', value: 35 },
      { playerId: 6, playerName: 'Jalen Hurts', teamName: 'Eagles', teamCity: 'Philadelphia', value: 32 },
      { playerId: 3, playerName: 'Joe Burrow', teamName: 'Bengals', teamCity: 'Cincinnati', value: 30 },
      { playerId: 7, playerName: 'Dak Prescott', teamName: 'Cowboys', teamCity: 'Dallas', value: 28 },
    ],
    rating: [
      { playerId: 1, playerName: 'Patrick Mahomes', teamName: 'Chiefs', teamCity: 'Kansas City', value: 112.4 },
      { playerId: 4, playerName: 'Tua Tagovailoa', teamName: 'Dolphins', teamCity: 'Miami', value: 108.9 },
      { playerId: 2, playerName: 'Josh Allen', teamName: 'Bills', teamCity: 'Buffalo', value: 105.2 },
      { playerId: 8, playerName: 'Brock Purdy', teamName: '49ers', teamCity: 'San Francisco', value: 103.8 },
      { playerId: 3, playerName: 'Joe Burrow', teamName: 'Bengals', teamCity: 'Cincinnati', value: 101.5 },
    ],
  },
  rushing: {
    yards: [
      { playerId: 10, playerName: 'Derrick Henry', teamName: 'Titans', teamCity: 'Tennessee', value: 1538 },
      { playerId: 11, playerName: 'Nick Chubb', teamName: 'Browns', teamCity: 'Cleveland', value: 1412 },
      { playerId: 12, playerName: 'Josh Jacobs', teamName: 'Raiders', teamCity: 'Las Vegas', value: 1356 },
      { playerId: 13, playerName: 'Saquon Barkley', teamName: 'Giants', teamCity: 'New York', value: 1289 },
      { playerId: 14, playerName: 'Christian McCaffrey', teamName: '49ers', teamCity: 'San Francisco', value: 1245 },
    ],
    touchdowns: [
      { playerId: 10, playerName: 'Derrick Henry', teamName: 'Titans', teamCity: 'Tennessee', value: 15 },
      { playerId: 12, playerName: 'Josh Jacobs', teamName: 'Raiders', teamCity: 'Las Vegas', value: 14 },
      { playerId: 14, playerName: 'Christian McCaffrey', teamName: '49ers', teamCity: 'San Francisco', value: 13 },
      { playerId: 11, playerName: 'Nick Chubb', teamName: 'Browns', teamCity: 'Cleveland', value: 12 },
      { playerId: 15, playerName: 'Austin Ekeler', teamName: 'Chargers', teamCity: 'Los Angeles', value: 11 },
    ],
    ypc: [
      { playerId: 16, playerName: 'Kenneth Walker', teamName: 'Seahawks', teamCity: 'Seattle', value: 5.8 },
      { playerId: 11, playerName: 'Nick Chubb', teamName: 'Browns', teamCity: 'Cleveland', value: 5.6 },
      { playerId: 10, playerName: 'Derrick Henry', teamName: 'Titans', teamCity: 'Tennessee', value: 5.4 },
      { playerId: 14, playerName: 'Christian McCaffrey', teamName: '49ers', teamCity: 'San Francisco', value: 5.2 },
      { playerId: 17, playerName: 'Breece Hall', teamName: 'Jets', teamCity: 'New York', value: 5.0 },
    ],
  },
  receiving: {
    yards: [
      { playerId: 20, playerName: 'Tyreek Hill', teamName: 'Dolphins', teamCity: 'Miami', value: 1710 },
      { playerId: 21, playerName: "Ja'Marr Chase", teamName: 'Bengals', teamCity: 'Cincinnati', value: 1456 },
      { playerId: 22, playerName: 'Stefon Diggs', teamName: 'Bills', teamCity: 'Buffalo', value: 1389 },
      { playerId: 23, playerName: 'CeeDee Lamb', teamName: 'Cowboys', teamCity: 'Dallas', value: 1324 },
      { playerId: 24, playerName: 'A.J. Brown', teamName: 'Eagles', teamCity: 'Philadelphia', value: 1298 },
    ],
    touchdowns: [
      { playerId: 20, playerName: 'Tyreek Hill', teamName: 'Dolphins', teamCity: 'Miami', value: 13 },
      { playerId: 21, playerName: "Ja'Marr Chase", teamName: 'Bengals', teamCity: 'Cincinnati', value: 12 },
      { playerId: 25, playerName: 'Travis Kelce', teamName: 'Chiefs', teamCity: 'Kansas City', value: 11 },
      { playerId: 22, playerName: 'Stefon Diggs', teamName: 'Bills', teamCity: 'Buffalo', value: 10 },
      { playerId: 26, playerName: 'Davante Adams', teamName: 'Raiders', teamCity: 'Las Vegas', value: 10 },
    ],
    receptions: [
      { playerId: 20, playerName: 'Tyreek Hill', teamName: 'Dolphins', teamCity: 'Miami', value: 119 },
      { playerId: 22, playerName: 'Stefon Diggs', teamName: 'Bills', teamCity: 'Buffalo', value: 108 },
      { playerId: 25, playerName: 'Travis Kelce', teamName: 'Chiefs', teamCity: 'Kansas City', value: 103 },
      { playerId: 21, playerName: "Ja'Marr Chase", teamName: 'Bengals', teamCity: 'Cincinnati', value: 98 },
      { playerId: 23, playerName: 'CeeDee Lamb', teamName: 'Cowboys', teamCity: 'Dallas', value: 95 },
    ],
  },
  defense: {
    sacks: [
      { playerId: 30, playerName: 'Micah Parsons', teamName: 'Cowboys', teamCity: 'Dallas', value: 16.5 },
      { playerId: 31, playerName: 'Nick Bosa', teamName: '49ers', teamCity: 'San Francisco', value: 15.0 },
      { playerId: 32, playerName: 'T.J. Watt', teamName: 'Steelers', teamCity: 'Pittsburgh', value: 14.5 },
      { playerId: 33, playerName: 'Myles Garrett', teamName: 'Browns', teamCity: 'Cleveland', value: 13.5 },
      { playerId: 34, playerName: 'Maxx Crosby', teamName: 'Raiders', teamCity: 'Las Vegas', value: 12.0 },
    ],
    interceptions: [
      { playerId: 40, playerName: 'Sauce Gardner', teamName: 'Jets', teamCity: 'New York', value: 7 },
      { playerId: 41, playerName: 'Tariq Woolen', teamName: 'Seahawks', teamCity: 'Seattle', value: 6 },
      { playerId: 42, playerName: 'Patrick Surtain II', teamName: 'Broncos', teamCity: 'Denver', value: 6 },
      { playerId: 43, playerName: 'Trevon Diggs', teamName: 'Cowboys', teamCity: 'Dallas', value: 5 },
      { playerId: 44, playerName: 'Minkah Fitzpatrick', teamName: 'Steelers', teamCity: 'Pittsburgh', value: 5 },
    ],
  },
};

export default function StandingsPage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id);
  const [viewMode, setViewMode] = useState<ViewMode>('division');
  const [showLeaders, setShowLeaders] = useState(true);
  const [sortField, setSortField] = useState<SortField>('winPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: standings, isLoading, error } = useSeasonStandings(leagueId);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortTeams = (teams: TeamStanding[]) => {
    return [...teams].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === 'desc' ? -1 : 1;
      return (aVal - bVal) * multiplier;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load standings</p>
          <Link
            to={`/leagues/${leagueId}/season`}
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
          >
            Back to Season
          </Link>
        </div>
      </div>
    );
  }

  if (!standings) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to={`/leagues/${leagueId}/season`}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Season
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4">Standings</h1>
          <div className="bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No standings data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const allTeams = standings.conferences.flatMap(conf =>
    conf.divisions.flatMap(div => div.teams)
  );

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/leagues/${leagueId}/season`}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Season
          </Link>
          <h1 className="text-3xl font-bold text-white">Standings & Leaders</h1>
          <p className="text-gray-400 mt-2">
            {standings.year} Season - Week {standings.currentWeek}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="inline-flex rounded-lg bg-zinc-800 p-1">
            <button
              onClick={() => setViewMode('division')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'division'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              By Division
            </button>
            <button
              onClick={() => setViewMode('conference')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'conference'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              By Conference
            </button>
            <button
              onClick={() => setViewMode('league')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'league'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              League-wide
            </button>
          </div>

          <button
            onClick={() => setShowLeaders(prev => !prev)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showLeaders
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            {showLeaders ? 'Hide Leaders' : 'Show Leaders'}
          </button>
        </div>

        <div className={`grid gap-8 ${showLeaders ? 'lg:grid-cols-3' : ''}`}>
          <div className={showLeaders ? 'lg:col-span-2' : ''}>
            {viewMode === 'division' && (
              <div className="space-y-8">
                {standings.conferences.map((conf) => (
                  <div key={conf.conferenceId}>
                    <h2 className="text-xl font-semibold text-white mb-4">{conf.conferenceName}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {conf.divisions.map((div) => (
                        <div key={div.divisionId} className="bg-zinc-800 rounded-lg overflow-hidden">
                          <div className="bg-zinc-700/50 px-4 py-2">
                            <h3 className="text-sm font-medium text-gray-300">{div.divisionName}</h3>
                          </div>
                          <StandingsTable teams={div.teams} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'conference' && (
              <div className="space-y-8">
                {standings.conferences.map((conf) => {
                  const confTeams = conf.divisions.flatMap(div => div.teams);
                  const sortedTeams = sortTeams(confTeams);
                  return (
                    <div key={conf.conferenceId} className="bg-zinc-800 rounded-lg overflow-hidden">
                      <div className="bg-zinc-700/50 px-4 py-3">
                        <h2 className="text-lg font-semibold text-white">{conf.conferenceName}</h2>
                      </div>
                      <StandingsTable
                        teams={sortedTeams}
                        showDivision
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'league' && (
              <div className="bg-zinc-800 rounded-lg overflow-hidden">
                <div className="bg-zinc-700/50 px-4 py-3">
                  <h2 className="text-lg font-semibold text-white">League Standings</h2>
                </div>
                <StandingsTable
                  teams={sortTeams(allTeams)}
                  showDivision
                  showConference
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </div>
            )}
          </div>

          {showLeaders && (
            <div className="space-y-6">
              <LeagueLeadersSection leaders={mockLeagueLeaders} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StandingsTableProps {
  teams: TeamStanding[];
  compact?: boolean;
  showDivision?: boolean;
  showConference?: boolean;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

interface SortableHeaderProps {
  field: SortField;
  label: string;
  className?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

function SortableHeader({ field, label, className = '', sortField, sortDirection, onSort }: SortableHeaderProps) {
  const isSorted = sortField === field;
  const canSort = onSort !== undefined;

  return (
    <th
      className={`px-4 py-3 text-center ${canSort ? 'cursor-pointer hover:text-white' : ''} ${className}`}
      onClick={() => canSort && onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isSorted && (
          <span className="text-emerald-400">
            {sortDirection === 'desc' ? '↓' : '↑'}
          </span>
        )}
      </span>
    </th>
  );
}

function StandingsTable({
  teams,
  compact,
  showDivision,
  showConference,
  sortField,
  sortDirection,
  onSort
}: StandingsTableProps) {
  if (teams.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No teams found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-3 w-8">#</th>
            <th className="px-4 py-3">Team</th>
            {showConference && <th className="px-4 py-3 hidden md:table-cell">Conf</th>}
            {showDivision && <th className="px-4 py-3 hidden md:table-cell">Div</th>}
            <SortableHeader field="wins" label="W" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
            <th className="px-4 py-3 text-center">L</th>
            {!compact && <th className="px-4 py-3 text-center hidden sm:table-cell">T</th>}
            <SortableHeader field="winPercentage" label="PCT" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
            {!compact && (
              <>
                <SortableHeader field="pointsFor" label="PF" className="hidden lg:table-cell" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                <SortableHeader field="pointsAgainst" label="PA" className="hidden lg:table-cell" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                <SortableHeader field="pointDifferential" label="DIFF" className="hidden lg:table-cell" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                <th className="px-4 py-3 text-center hidden xl:table-cell">STRK</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700">
          {teams.map((team, idx) => (
            <tr key={team.teamId} className="hover:bg-zinc-700/30 transition-colors">
              <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
              <td className="px-4 py-3">
                <span className="text-white font-medium">
                  {team.teamCity} {team.teamName}
                </span>
              </td>
              {showConference && (
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {team.conferenceName}
                </td>
              )}
              {showDivision && (
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {team.divisionName}
                </td>
              )}
              <td className="px-4 py-3 text-center text-white">{team.wins}</td>
              <td className="px-4 py-3 text-center text-white">{team.losses}</td>
              {!compact && (
                <td className="px-4 py-3 text-center text-white hidden sm:table-cell">
                  {team.ties}
                </td>
              )}
              <td className="px-4 py-3 text-center text-white">
                {team.winPercentage.toFixed(3).replace(/^0/, '')}
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3 text-center text-gray-400 hidden lg:table-cell">
                    {team.pointsFor}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 hidden lg:table-cell">
                    {team.pointsAgainst}
                  </td>
                  <td className={`px-4 py-3 text-center hidden lg:table-cell ${
                    team.pointDifferential > 0
                      ? 'text-emerald-400'
                      : team.pointDifferential < 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}>
                    {team.pointDifferential > 0 ? '+' : ''}{team.pointDifferential}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 hidden xl:table-cell">
                    {team.streak}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface LeagueLeadersSectionProps {
  leaders: LeagueLeadersData;
}

function LeagueLeadersSection({ leaders }: LeagueLeadersSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'passing' | 'rushing' | 'receiving' | 'defense'>('passing');

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden">
      <div className="bg-zinc-700/50 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">League Leaders</h2>
      </div>

      <div className="border-b border-zinc-700">
        <div className="flex">
          {(['passing', 'rushing', 'receiving', 'defense'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeCategory === cat
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-700/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeCategory === 'passing' && (
          <>
            <LeadersList title="Passing Yards" leaders={leaders.passing.yards} unit="YDS" />
            <LeadersList title="Passing TDs" leaders={leaders.passing.touchdowns} unit="TD" />
            <LeadersList title="Passer Rating" leaders={leaders.passing.rating} unit="RTG" />
          </>
        )}
        {activeCategory === 'rushing' && (
          <>
            <LeadersList title="Rushing Yards" leaders={leaders.rushing.yards} unit="YDS" />
            <LeadersList title="Rushing TDs" leaders={leaders.rushing.touchdowns} unit="TD" />
            <LeadersList title="Yards Per Carry" leaders={leaders.rushing.ypc} unit="YPC" />
          </>
        )}
        {activeCategory === 'receiving' && (
          <>
            <LeadersList title="Receiving Yards" leaders={leaders.receiving.yards} unit="YDS" />
            <LeadersList title="Receiving TDs" leaders={leaders.receiving.touchdowns} unit="TD" />
            <LeadersList title="Receptions" leaders={leaders.receiving.receptions} unit="REC" />
          </>
        )}
        {activeCategory === 'defense' && (
          <>
            <LeadersList title="Sacks" leaders={leaders.defense.sacks} unit="SACK" />
            <LeadersList title="Interceptions" leaders={leaders.defense.interceptions} unit="INT" />
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        <p className="text-xs text-gray-500 italic">
          * Stats shown are placeholder data. Real stats will be available when the stats API is implemented.
        </p>
      </div>
    </div>
  );
}

interface LeadersListProps {
  title: string;
  leaders: LeagueLeader[];
  unit: string;
}

function LeadersList({ title, leaders, unit }: LeadersListProps) {
  const topLeaders = leaders.slice(0, 3);

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1">
        {topLeaders.map((leader, idx) => (
          <div
            key={leader.playerId}
            className={`flex items-center justify-between py-1.5 px-2 rounded ${
              idx === 0 ? 'bg-emerald-500/10' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xs font-bold w-4 ${idx === 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>
                  {leader.playerName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {leader.teamCity} {leader.teamName}
                </p>
              </div>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <span className={`text-sm font-bold ${idx === 0 ? 'text-emerald-400' : 'text-white'}`}>
                {typeof leader.value === 'number' && leader.value % 1 !== 0
                  ? leader.value.toFixed(1)
                  : leader.value.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 ml-1">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
