import { useParams, Link } from 'react-router-dom';
import { useSeason, useSeasonStandings, useGenerateSchedule, useAdvanceWeek, useProcessYearEnd } from '../api/season';
import { CommissionerControls } from '../components/CommissionerControls';

export default function SeasonDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id);

  const { data: season, isLoading: isLoadingSeason, error: seasonError } = useSeason(leagueId);
  const { data: standings, isLoading: isLoadingStandings } = useSeasonStandings(leagueId);

  const generateSchedule = useGenerateSchedule();
  const advanceWeek = useAdvanceWeek();
  const processYearEnd = useProcessYearEnd();

  const handleGenerateSchedule = () => {
    generateSchedule.mutate({ leagueId });
  };

  const handleAdvanceWeek = () => {
    advanceWeek.mutate(leagueId);
  };

  const handleProcessYearEnd = () => {
    processYearEnd.mutate(leagueId);
  };

  if (isLoadingSeason) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading season...</p>
        </div>
      </div>
    );
  }

  if (seasonError) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load season data</p>
          <Link
            to={`/leagues/${leagueId}`}
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
          >
            Back to League
          </Link>
        </div>
      </div>
    );
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'preseason': return 'Preseason';
      case 'regular': return 'Regular Season';
      case 'playoffs': return 'Playoffs';
      case 'offseason': return 'Offseason';
      default: return phase;
    }
  };

  const topTeamsByConference = standings?.conferences.map(conf => {
    const allTeams = conf.divisions.flatMap(div => div.teams);
    const sorted = [...allTeams].sort((a, b) => b.winPercentage - a.winPercentage);
    return {
      conferenceName: conf.conferenceName,
      topTeams: sorted.slice(0, 3),
    };
  }) ?? [];

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/leagues/${leagueId}`}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to League
          </Link>
          <h1 className="text-3xl font-bold text-white">Season Dashboard</h1>
          {season && (
            <p className="text-gray-400 mt-2">
              {season.year} Season • {getPhaseLabel(season.phase)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {season && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Season Progress</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-700/50 rounded p-4">
                    <p className="text-gray-400 text-sm">Current Week</p>
                    <p className="text-2xl font-bold text-white">
                      {season.totalWeeks > 0 ? `${season.currentWeek} / ${season.totalWeeks}` : 'Not Started'}
                    </p>
                  </div>
                  <div className="bg-zinc-700/50 rounded p-4">
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {season.isComplete ? 'Complete' : 'In Progress'}
                    </p>
                  </div>
                </div>
                {season.totalWeeks > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((season.currentWeek / season.totalWeeks) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(season.currentWeek / season.totalWeeks) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Standings Preview</h2>
                <Link
                  to={`/leagues/${leagueId}/standings`}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  View Full Standings →
                </Link>
              </div>
              {isLoadingStandings ? (
                <p className="text-gray-400">Loading standings...</p>
              ) : topTeamsByConference.length > 0 ? (
                <div className="space-y-4">
                  {topTeamsByConference.map(conf => (
                    <div key={conf.conferenceName}>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">{conf.conferenceName}</h3>
                      <div className="space-y-2">
                        {conf.topTeams.map((team, idx) => (
                          <div
                            key={team.teamId}
                            className="flex justify-between items-center bg-zinc-700/50 rounded px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 w-6">{idx + 1}.</span>
                              <span className="text-white">{team.teamCity} {team.teamName}</span>
                            </div>
                            <span className="text-gray-400">
                              {team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No standings available yet</p>
              )}
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Quick Links</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to={`/leagues/${leagueId}/schedule`}
                  className="bg-zinc-700/50 hover:bg-zinc-700 rounded p-4 text-center transition-colors"
                >
                  <p className="text-white font-medium">Schedule</p>
                  <p className="text-gray-400 text-sm">View all games</p>
                </Link>
                <Link
                  to={`/leagues/${leagueId}/standings`}
                  className="bg-zinc-700/50 hover:bg-zinc-700 rounded p-4 text-center transition-colors"
                >
                  <p className="text-white font-medium">Standings</p>
                  <p className="text-gray-400 text-sm">View rankings</p>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <CommissionerControls
              season={season ?? null}
              onGenerateSchedule={handleGenerateSchedule}
              onAdvanceWeek={handleAdvanceWeek}
              onProcessYearEnd={handleProcessYearEnd}
              isGenerating={generateSchedule.isPending}
              isAdvancing={advanceWeek.isPending}
              isProcessingYearEnd={processYearEnd.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
