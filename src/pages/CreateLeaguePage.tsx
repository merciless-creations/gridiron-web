import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLeague } from '../api/leagues';
import { getLeagueConstraints } from '../api/leagueConstraints';
import type { CreateLeagueRequest, LeagueConstraints } from '../types/League';

export default function CreateLeaguePage() {
  const navigate = useNavigate();
  
  const [constraints, setConstraints] = useState<LeagueConstraints | null>(null);
  const [isLoadingConstraints, setIsLoadingConstraints] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateLeagueRequest>({
    name: '',
    numberOfConferences: 2,
    divisionsPerConference: 4,
    teamsPerDivision: 4,
    playoffTeamsPerConference: 7,
    divisionWinnersAutoQualify: true,
    byeWeekForTopSeed: true,
    useHeadToHeadTiebreaker: true,
    usePointDifferentialTiebreaker: true,
  });

  // Fetch constraints on mount
  useEffect(() => {
    async function loadConstraints() {
      try {
        const data = await getLeagueConstraints();
        setConstraints(data);
      } catch (err) {
        setError('Failed to load league constraints');
        console.error('Error loading constraints:', err);
      } finally {
        setIsLoadingConstraints(false);
      }
    }

    loadConstraints();
  }, []);

  // Calculate total teams and teams per conference
  const teamsPerConference = formData.divisionsPerConference * formData.teamsPerDivision;
  const totalTeams = formData.numberOfConferences * teamsPerConference;
  const maxPlayoffTeams = Math.min(16, teamsPerConference);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('League name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const league = await createLeague(formData);
      // Navigate to structure editor
      navigate(`/leagues/${league.id}/structure`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create league');
      console.error('Error creating league:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (isLoadingConstraints) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Error loading constraints
  if (!constraints) {
    return (
      <div className="min-h-screen bg-zinc-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error || 'Failed to load constraints'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/leagues')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Leagues
          </button>
          <h1 className="text-3xl font-bold text-white">Create New League</h1>
          <p className="text-gray-400 mt-2">
            Configure your league structure. You can customize names after creation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-6 space-y-6">
          {/* League Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              League Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., National Football League"
              required
              autoFocus
            />
          </div>

          {/* Season */}
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-300 mb-2">
              Season
            </label>
            <input
              id="season"
              type="number"
              value={new Date().getFullYear()}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Season is set to current year</p>
          </div>

          {/* Number of Conferences */}
          <div>
            <label htmlFor="conferences" className="block text-sm font-medium text-gray-300 mb-2">
              Number of Conferences
            </label>
            <div className="flex items-center gap-4">
              <input
                id="conferences"
                type="range"
                min={constraints.minConferences}
                max={constraints.maxConferences}
                value={formData.numberOfConferences}
                onChange={(e) => setFormData({ ...formData, numberOfConferences: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min={constraints.minConferences}
                max={constraints.maxConferences}
                value={formData.numberOfConferences}
                onChange={(e) => setFormData({ ...formData, numberOfConferences: Number(e.target.value) })}
                className="w-20 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Min: {constraints.minConferences}, Max: {constraints.maxConferences}
            </p>
          </div>

          {/* Divisions per Conference */}
          <div>
            <label htmlFor="divisions" className="block text-sm font-medium text-gray-300 mb-2">
              Divisions per Conference
            </label>
            <div className="flex items-center gap-4">
              <input
                id="divisions"
                type="range"
                min={constraints.minDivisionsPerConference}
                max={constraints.maxDivisionsPerConference}
                value={formData.divisionsPerConference}
                onChange={(e) => setFormData({ ...formData, divisionsPerConference: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min={constraints.minDivisionsPerConference}
                max={constraints.maxDivisionsPerConference}
                value={formData.divisionsPerConference}
                onChange={(e) => setFormData({ ...formData, divisionsPerConference: Number(e.target.value) })}
                className="w-20 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Min: {constraints.minDivisionsPerConference}, Max: {constraints.maxDivisionsPerConference}
            </p>
          </div>

          {/* Teams per Division */}
          <div>
            <label htmlFor="teams" className="block text-sm font-medium text-gray-300 mb-2">
              Teams per Division
            </label>
            <div className="flex items-center gap-4">
              <input
                id="teams"
                type="range"
                min={constraints.minTeamsPerDivision}
                max={constraints.maxTeamsPerDivision}
                value={formData.teamsPerDivision}
                onChange={(e) => setFormData({ ...formData, teamsPerDivision: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min={constraints.minTeamsPerDivision}
                max={constraints.maxTeamsPerDivision}
                value={formData.teamsPerDivision}
                onChange={(e) => setFormData({ ...formData, teamsPerDivision: Number(e.target.value) })}
                className="w-20 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Min: {constraints.minTeamsPerDivision}, Max: {constraints.maxTeamsPerDivision}
            </p>
          </div>

          {/* Total Teams Calculation */}
          <div className="bg-zinc-700/50 rounded p-4 border border-zinc-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Teams:</span>
              <span className="text-2xl font-bold text-emerald-400">{totalTeams}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {formData.numberOfConferences} conference{formData.numberOfConferences !== 1 ? 's' : ''} × {formData.divisionsPerConference} division{formData.divisionsPerConference !== 1 ? 's' : ''} × {formData.teamsPerDivision} team{formData.teamsPerDivision !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Playoff Configuration Section */}
          <div className="border-t border-zinc-600 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Playoff Configuration</h2>

            {/* Playoff Teams per Conference */}
            <div className="mb-6">
              <label htmlFor="playoffTeams" className="block text-sm font-medium text-gray-300 mb-2">
                Playoff Teams per Conference
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="playoffTeams"
                  type="range"
                  min={2}
                  max={maxPlayoffTeams}
                  value={Math.min(formData.playoffTeamsPerConference ?? 7, maxPlayoffTeams)}
                  onChange={(e) => setFormData({ ...formData, playoffTeamsPerConference: Number(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="number"
                  min={2}
                  max={maxPlayoffTeams}
                  value={Math.min(formData.playoffTeamsPerConference ?? 7, maxPlayoffTeams)}
                  onChange={(e) => setFormData({ ...formData, playoffTeamsPerConference: Math.min(Number(e.target.value), maxPlayoffTeams) })}
                  className="w-20 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {teamsPerConference} teams per conference (max {maxPlayoffTeams} playoff spots)
              </p>
            </div>

            {/* Division Winners Auto Qualify */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.divisionWinnersAutoQualify ?? true}
                  onChange={(e) => setFormData({ ...formData, divisionWinnersAutoQualify: e.target.checked })}
                  className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800"
                />
                <span className="text-gray-300">Division winners automatically qualify</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Division winners are guaranteed a playoff spot regardless of record
              </p>
            </div>

            {/* Bye Week for Top Seed */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.byeWeekForTopSeed ?? true}
                  onChange={(e) => setFormData({ ...formData, byeWeekForTopSeed: e.target.checked })}
                  className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800"
                />
                <span className="text-gray-300">First-round bye for top seed</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Top-seeded team in each conference skips the first playoff round
              </p>
            </div>

            {/* Tiebreaker Options */}
            <div className="border-t border-zinc-700 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Tiebreaker Rules</h3>
              
              <div className="mb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useHeadToHeadTiebreaker ?? true}
                    onChange={(e) => setFormData({ ...formData, useHeadToHeadTiebreaker: e.target.checked })}
                    className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800"
                  />
                  <span className="text-gray-300">Head-to-head record</span>
                </label>
              </div>

              <div className="mb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.usePointDifferentialTiebreaker ?? true}
                    onChange={(e) => setFormData({ ...formData, usePointDifferentialTiebreaker: e.target.checked })}
                    className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800"
                  />
                  <span className="text-gray-300">Point differential</span>
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/leagues')}
              className="flex-1 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Creating...
                </span>
              ) : (
                'Create League'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
