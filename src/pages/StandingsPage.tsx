import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeasonStandings } from '../api/season';
import type { TeamStanding } from '../types/Season';

type ViewMode = 'division' | 'conference' | 'league';

export default function StandingsPage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id);
  const [viewMode, setViewMode] = useState<ViewMode>('division');

  const { data: standings, isLoading, error } = useSeasonStandings(leagueId);

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
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/leagues/${leagueId}/season`}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Season
          </Link>
          <h1 className="text-3xl font-bold text-white">Standings</h1>
          <p className="text-gray-400 mt-2">
            {standings.year} Season • Week {standings.currentWeek}
          </p>
        </div>

        <div className="mb-6">
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
        </div>

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
              const sortedTeams = [...confTeams].sort((a, b) => b.winPercentage - a.winPercentage);
              return (
                <div key={conf.conferenceId} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <div className="bg-zinc-700/50 px-4 py-3">
                    <h2 className="text-lg font-semibold text-white">{conf.conferenceName}</h2>
                  </div>
                  <StandingsTable teams={sortedTeams} showDivision />
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
              teams={[...allTeams].sort((a, b) => b.winPercentage - a.winPercentage)}
              showDivision
              showConference
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface StandingsTableProps {
  teams: TeamStanding[];
  compact?: boolean;
  showDivision?: boolean;
  showConference?: boolean;
}

function StandingsTable({ teams, compact, showDivision, showConference }: StandingsTableProps) {
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
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">L</th>
            {!compact && <th className="px-4 py-3 text-center hidden sm:table-cell">T</th>}
            <th className="px-4 py-3 text-center">PCT</th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-center hidden lg:table-cell">PF</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">PA</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">DIFF</th>
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
