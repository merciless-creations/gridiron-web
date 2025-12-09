import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeague } from '../api/leagues';
import { getLeagueConstraints } from '../api/leagueConstraints';
import { addConference, deleteConference, addDivision, deleteDivision, addTeam, deleteTeam } from '../api/leagueStructure';
import { LeagueStructureTree } from '../components/LeagueStructure';
import type { LeagueDetail, LeagueConstraints, Conference, Division } from '../types/League';
import type { Team } from '../types/Team';

export default function LeagueStructurePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [constraints, setConstraints] = useState<LeagueConstraints | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch league and constraints
  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError('League ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const [leagueData, constraintsData] = await Promise.all([
          getLeague(Number(id)),
          getLeagueConstraints(),
        ]);
        setLeague(leagueData);
        setConstraints(constraintsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load league');
        console.error('Error loading league:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Handler functions for structure modifications
  const handleAddConference = async () => {
    if (!league) return;

    try {
      // Count total conferences in league
      const totalConferencesCount = league.conferences.length;

      const newConference = await addConference(league.id, {
        name: `Conference ${totalConferencesCount + 1}`,
        numberOfDivisions: 4,
        teamsPerDivision: 4,
      });

      setLeague({
        ...league,
        conferences: [...league.conferences, newConference],
        totalConferences: league.totalConferences + 1,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error adding conference:', err);
      alert('Failed to add conference');
    }
  };

  const handleDeleteConference = async (conferenceId: number) => {
    if (!league) return;

    try {
      await deleteConference(conferenceId);

      const updatedConferences = league.conferences.filter(c => c.id !== conferenceId);
      setLeague({
        ...league,
        conferences: updatedConferences,
        totalConferences: updatedConferences.length,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error deleting conference:', err);
      alert('Failed to delete conference');
    }
  };

  const handleUpdateConference = (updatedConference: Conference) => {
    if (!league) return;

    setLeague({
      ...league,
      conferences: league.conferences.map(c =>
        c.id === updatedConference.id ? updatedConference : c
      ),
    });
    setLastSaved(new Date());
  };

  const handleAddDivision = async (conferenceId: number) => {
    if (!league) return;

    const conference = league.conferences.find(c => c.id === conferenceId);
    if (!conference) return;

    try {
      // Count total divisions across all conferences
      const totalDivisionsCount = league.conferences.reduce((total, conf) => {
        return total + conf.divisions.length;
      }, 0);

      const newDivision = await addDivision(conferenceId, {
        name: `Division ${totalDivisionsCount + 1}`,
        numberOfTeams: 4,
      });

      setLeague({
        ...league,
        conferences: league.conferences.map(c =>
          c.id === conferenceId
            ? { ...c, divisions: [...c.divisions, newDivision] }
            : c
        ),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error adding division:', err);
      alert('Failed to add division');
    }
  };

  const handleDeleteDivision = async (conferenceId: number, divisionId: number) => {
    if (!league) return;

    try {
      await deleteDivision(divisionId);

      setLeague({
        ...league,
        conferences: league.conferences.map(c =>
          c.id === conferenceId
            ? { ...c, divisions: c.divisions.filter(d => d.id !== divisionId) }
            : c
        ),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error deleting division:', err);
      alert('Failed to delete division');
    }
  };

  const handleUpdateDivision = (conferenceId: number, updatedDivision: Division) => {
    if (!league) return;

    setLeague({
      ...league,
      conferences: league.conferences.map(c =>
        c.id === conferenceId
          ? {
              ...c,
              divisions: c.divisions.map(d =>
                d.id === updatedDivision.id ? updatedDivision : d
              ),
            }
          : c
      ),
    });
    setLastSaved(new Date());
  };

  const handleAddTeam = async (conferenceId: number, divisionId: number) => {
    if (!league) return;

    const conference = league.conferences.find(c => c.id === conferenceId);
    const division = conference?.divisions.find(d => d.id === divisionId);
    if (!division) return;

    try {
      // Count total teams across all conferences and divisions
      const totalTeamsCount = league.conferences.reduce((total, conf) => {
        return total + conf.divisions.reduce((divTotal, div) => {
          return divTotal + div.teams.length;
        }, 0);
      }, 0);

      const newTeam = await addTeam(divisionId, {
        name: `Team ${totalTeamsCount + 1}`,
        city: 'City',
      });

      setLeague({
        ...league,
        conferences: league.conferences.map(c =>
          c.id === conferenceId
            ? {
                ...c,
                divisions: c.divisions.map(d =>
                  d.id === divisionId
                    ? { ...d, teams: [...d.teams, newTeam] }
                    : d
                ),
              }
            : c
        ),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error adding team:', err);
      alert('Failed to add team');
    }
  };

  const handleDeleteTeam = async (conferenceId: number, divisionId: number, teamId: number) => {
    if (!league) return;

    try {
      await deleteTeam(teamId);

      setLeague({
        ...league,
        conferences: league.conferences.map(c =>
          c.id === conferenceId
            ? {
                ...c,
                divisions: c.divisions.map(d =>
                  d.id === divisionId
                    ? { ...d, teams: d.teams.filter(t => t.id !== teamId) }
                    : d
                ),
              }
            : c
        ),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team');
    }
  };

  const handleUpdateTeam = (conferenceId: number, divisionId: number, updatedTeam: Team) => {
    if (!league) return;

    setLeague({
      ...league,
      conferences: league.conferences.map(c =>
        c.id === conferenceId
          ? {
              ...c,
              divisions: c.divisions.map(d =>
                d.id === divisionId
                  ? {
                      ...d,
                      teams: d.teams.map(t =>
                        t.id === updatedTeam.id ? updatedTeam : t
                      ),
                    }
                  : d
              ),
            }
          : c
      ),
    });
    setLastSaved(new Date());
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 5) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return 'Saved 1 minute ago';
    return `Saved ${minutes} minutes ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading league...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !league || !constraints) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load league'}</p>
          <button
            onClick={() => navigate('/leagues')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
          >
            Back to Leagues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/leagues')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Leagues
          </button>
          <h1 className="text-3xl font-bold text-white">{league.name}</h1>
          <p className="text-gray-400 mt-2">
            Season {league.season} • {league.totalTeams} Teams • {league.totalConferences} Conferences
          </p>
        </div>

        {/* Structure Editor */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">League Structure</h2>
            {lastSaved && (
              <span className="text-sm text-gray-500">
                ✓ {formatLastSaved()}
              </span>
            )}
          </div>
          
          <LeagueStructureTree
            league={league}
            constraints={constraints}
            onUpdateLeague={setLeague}
            onAddConference={handleAddConference}
            onDeleteConference={handleDeleteConference}
            onUpdateConference={handleUpdateConference}
            onAddDivision={handleAddDivision}
            onDeleteDivision={handleDeleteDivision}
            onUpdateDivision={handleUpdateDivision}
            onAddTeam={handleAddTeam}
            onDeleteTeam={handleDeleteTeam}
            onUpdateTeam={handleUpdateTeam}
          />
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Click any name to edit • Changes save automatically
        </div>
      </div>
    </div>
  );
}
