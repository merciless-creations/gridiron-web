import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeasonSchedule } from '../api/season';
import type { ScheduleWeek } from '../types/Season';

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const { data: schedule, isLoading, error } = useSeasonSchedule(leagueId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load schedule</p>
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

  if (!schedule || schedule.weeks.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to={`/leagues/${leagueId}/season`}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Season
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4">Schedule</h1>
          <div className="bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No schedule has been generated yet.</p>
            <Link
              to={`/leagues/${leagueId}/season`}
              className="mt-4 inline-block text-emerald-400 hover:text-emerald-300"
            >
              Go to Season Dashboard to generate a schedule
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentWeek = schedule.weeks.find(w => w.isCurrent);
  const displayWeek = selectedWeek ?? currentWeek?.week ?? 1;
  const weekData = schedule.weeks.find(w => w.week === displayWeek);

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/leagues/${leagueId}/season`}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Season
          </Link>
          <h1 className="text-3xl font-bold text-white">Schedule</h1>
          <p className="text-gray-400 mt-2">
            {schedule.year} Season • Week {schedule.currentWeek} of {schedule.weeks.length}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="week-select" className="block text-sm font-medium text-gray-300 mb-2">
            Select Week
          </label>
          <select
            id="week-select"
            value={displayWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="w-full md:w-48 bg-zinc-700 border border-zinc-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {schedule.weeks.map((week) => (
              <option key={week.week} value={week.week}>
                Week {week.week}
                {week.isCurrent ? ' (Current)' : ''}
                {week.isComplete ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </div>

        <WeekGames week={weekData} />
      </div>
    </div>
  );
}

function WeekGames({ week }: { week: ScheduleWeek | undefined }) {
  if (!week) {
    return (
      <div className="bg-zinc-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Week not found</p>
      </div>
    );
  }

  const completedGames = week.games.filter(g => g.isComplete && !g.isByeWeek);
  const upcomingGames = week.games.filter(g => !g.isComplete && !g.isByeWeek);
  const byeTeams = week.games.filter(g => g.isByeWeek);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Week {week.week}</h2>
          {week.isComplete ? (
            <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-sm">
              Complete
            </span>
          ) : week.isCurrent ? (
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
              Current Week
            </span>
          ) : (
            <span className="px-2 py-1 bg-zinc-700 text-gray-400 rounded text-sm">
              Upcoming
            </span>
          )}
        </div>

        {completedGames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Final Scores</h3>
            <div className="space-y-2">
              {completedGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-zinc-700/50 rounded p-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className={`flex justify-between items-center ${
                        (game.awayScore ?? 0) > (game.homeScore ?? 0) ? 'text-white font-medium' : 'text-gray-400'
                      }`}>
                        <span>{game.awayTeamCity} {game.awayTeamName}</span>
                        <span className="text-lg">{game.awayScore}</span>
                      </div>
                      <div className={`flex justify-between items-center mt-1 ${
                        (game.homeScore ?? 0) > (game.awayScore ?? 0) ? 'text-white font-medium' : 'text-gray-400'
                      }`}>
                        <span>{game.homeTeamCity} {game.homeTeamName}</span>
                        <span className="text-lg">{game.homeScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingGames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Upcoming Games</h3>
            <div className="space-y-2">
              {upcomingGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-zinc-700/50 rounded p-4"
                >
                  <div className="flex justify-between items-center text-white">
                    <span>{game.awayTeamCity} {game.awayTeamName}</span>
                    <span className="text-gray-500">@</span>
                    <span>{game.homeTeamCity} {game.homeTeamName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {byeTeams.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Bye Week</h3>
            <div className="flex flex-wrap gap-2">
              {byeTeams.map((bye) => (
                <span
                  key={bye.id}
                  className="px-3 py-1 bg-zinc-700 text-gray-300 rounded text-sm"
                >
                  {bye.homeTeamCity} {bye.homeTeamName}
                </span>
              ))}
            </div>
          </div>
        )}

        {week.games.length === 0 && (
          <p className="text-gray-500 italic text-center">No games scheduled for this week</p>
        )}
      </div>
    </div>
  );
}
