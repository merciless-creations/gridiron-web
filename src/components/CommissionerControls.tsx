import { useState } from 'react';
import type { Season } from '../types/Season';

interface CommissionerControlsProps {
  season: Season | null;
  onGenerateSchedule: () => void;
  onAdvanceWeek: () => void;
  onAdvanceByDays: (days: number) => void;
  onProcessYearEnd: () => void;
  isGenerating: boolean;
  isAdvancing: boolean;
  isAdvancingByDays: boolean;
  isProcessingYearEnd: boolean;
  /** Whether a simulation is currently in progress for this league */
  simulationInProgress: boolean;
}

const QUICK_DAYS = [
  { label: '1 day', value: 1, tooltip: 'Next day (for MNF)' },
  { label: '3 days', value: 3, tooltip: 'Mid-week (for TNF)' },
  { label: '7 days', value: 7, tooltip: 'Full week' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function CommissionerControls({
  season,
  onGenerateSchedule,
  onAdvanceWeek,
  onAdvanceByDays,
  onProcessYearEnd,
  isGenerating,
  isAdvancing,
  isAdvancingByDays,
  isProcessingYearEnd,
  simulationInProgress,
}: CommissionerControlsProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [daysToAdvance, setDaysToAdvance] = useState(7);

  const handleConfirm = (action: string) => {
    if (confirmAction === action) {
      if (action === 'generate') onGenerateSchedule();
      if (action === 'advance') onAdvanceWeek();
      if (action === 'advanceDays') onAdvanceByDays(daysToAdvance);
      if (action === 'yearEnd') onProcessYearEnd();
      setConfirmAction(null);
    } else {
      setConfirmAction(action);
    }
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  const handleDaysInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setDaysToAdvance(Math.max(1, Math.min(126, value)));
    }
  };

  // Disable all controls when any operation is loading OR when simulation is in progress
  const isDisabled = isGenerating || isAdvancing || isAdvancingByDays || isProcessingYearEnd || simulationInProgress;
  const hasSchedule = season && season.totalWeeks > 0;
  const isSeasonComplete = season?.isComplete;
  const canAdvance = hasSchedule && !isSeasonComplete && season.currentWeek <= season.totalWeeks;
  const canProcessYearEnd = isSeasonComplete;

  // Get current day name (assuming season has currentDayOfWeek property, default to Sunday)
  const currentDayOfWeek = (season as Season & { currentDayOfWeek?: number })?.currentDayOfWeek ?? 0;
  const currentDayName = DAY_NAMES[currentDayOfWeek];

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Commissioner Controls</h2>

      {/* Simulation in progress notice */}
      {simulationInProgress && (
        <div className="mb-4 p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-amber-400 flex-shrink-0 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-amber-400">
              Simulation in progress. Controls are disabled until complete.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!hasSchedule && (
          <div>
            <p className="text-gray-400 text-sm mb-2">
              Generate a schedule to start the season. This will create matchups for all teams.
            </p>
            {confirmAction === 'generate' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirm('generate')}
                  disabled={isDisabled}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Confirm Generate'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isDisabled}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConfirm('generate')}
                disabled={isDisabled}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Generate Schedule
              </button>
            )}
          </div>
        )}

        {canAdvance && (
          <div className="space-y-4" data-testid="advance-days-controls">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">
                  Advance the season by days. Games scheduled within those days will be simulated.
                </p>
                {hasSchedule && (
                  <span className="text-xs text-gray-500">
                    Week {season?.currentWeek}, {currentDayName}
                  </span>
                )}
              </div>

              {/* Quick select buttons */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Quick:</span>
                {QUICK_DAYS.map(({ label, value, tooltip }) => (
                  <button
                    key={value}
                    onClick={() => setDaysToAdvance(value)}
                    title={tooltip}
                    disabled={isDisabled}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      daysToAdvance === value
                        ? 'bg-gridiron-accent text-gridiron-bg-primary border-gridiron-accent'
                        : 'bg-zinc-700 border-zinc-600 text-gray-300 hover:border-gridiron-accent disabled:opacity-50'
                    }`}
                    data-testid={`quick-days-${value}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Days input and advance button */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Days:</label>
                <input
                  type="number"
                  min={1}
                  max={126}
                  value={daysToAdvance}
                  onChange={handleDaysInputChange}
                  disabled={isDisabled}
                  className="w-16 px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-center text-white disabled:opacity-50"
                  data-testid="days-input"
                />
                {confirmAction === 'advanceDays' ? (
                  <div className="flex gap-2 flex-1">
                    <button
                      onClick={() => handleConfirm('advanceDays')}
                      disabled={isDisabled}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                      data-testid="advance-days-confirm"
                    >
                      {isAdvancingByDays ? 'Simulating...' : `Confirm Advance ${daysToAdvance} day${daysToAdvance === 1 ? '' : 's'}`}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isDisabled}
                      className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConfirm('advanceDays')}
                    disabled={isDisabled}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                    data-testid="advance-days-button"
                  >
                    Advance {daysToAdvance} day{daysToAdvance === 1 ? '' : 's'}
                  </button>
                )}
              </div>
            </div>

            {/* Legacy advance week button - now secondary */}
            <div className="pt-2 border-t border-zinc-700">
              <p className="text-gray-500 text-xs mb-2">
                Or advance a full week at once:
              </p>
              {confirmAction === 'advance' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirm('advance')}
                    disabled={isDisabled}
                    className="flex-1 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                  >
                    {isAdvancing ? 'Simulating...' : 'Confirm Advance Week'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isDisabled}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConfirm('advance')}
                  disabled={isDisabled}
                  className="w-full px-4 py-2 bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                >
                  Advance Full Week
                </button>
              )}
            </div>
          </div>
        )}

        {canProcessYearEnd && (
          <div>
            <p className="text-gray-400 text-sm mb-2">
              Process year end. This will age players, apply progression, and start a new season.
            </p>
            {confirmAction === 'yearEnd' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirm('yearEnd')}
                  disabled={isDisabled}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                >
                  {isProcessingYearEnd ? 'Processing...' : 'Confirm Year End'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isDisabled}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConfirm('yearEnd')}
                disabled={isDisabled}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Process Year End
              </button>
            )}
          </div>
        )}

        {hasSchedule && !canAdvance && !canProcessYearEnd && (
          <p className="text-gray-500 text-sm italic">
            Season in progress. No actions available at this time.
          </p>
        )}
      </div>
    </div>
  );
}
