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

  // Calculate total teams
  const totalTeams = formData.numberOfConferences * 
                     formData.divisionsPerConference * 
                     formData.teamsPerDivision;

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
