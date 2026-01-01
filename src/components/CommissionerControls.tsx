import { useState } from 'react';
import type { Season } from '../types/Season';

interface CommissionerControlsProps {
  season: Season | null;
  onGenerateSchedule: () => void;
  onAdvanceWeek: () => void;
  onProcessYearEnd: () => void;
  isGenerating: boolean;
  isAdvancing: boolean;
  isProcessingYearEnd: boolean;
}

export function CommissionerControls({
  season,
  onGenerateSchedule,
  onAdvanceWeek,
  onProcessYearEnd,
  isGenerating,
  isAdvancing,
  isProcessingYearEnd,
}: CommissionerControlsProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleConfirm = (action: string) => {
    if (confirmAction === action) {
      if (action === 'generate') onGenerateSchedule();
      if (action === 'advance') onAdvanceWeek();
      if (action === 'yearEnd') onProcessYearEnd();
      setConfirmAction(null);
    } else {
      setConfirmAction(action);
    }
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  const isAnyLoading = isGenerating || isAdvancing || isProcessingYearEnd;
  const hasSchedule = season && season.totalWeeks > 0;
  const isSeasonComplete = season?.isComplete;
  const canAdvance = hasSchedule && !isSeasonComplete && season.currentWeek < season.totalWeeks;
  const canProcessYearEnd = isSeasonComplete;

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Commissioner Controls</h2>
      
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
                  disabled={isAnyLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Confirm Generate'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isAnyLoading}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConfirm('generate')}
                disabled={isAnyLoading}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Generate Schedule
              </button>
            )}
          </div>
        )}

        {canAdvance && (
          <div>
            <p className="text-gray-400 text-sm mb-2">
              Advance to week {(season?.currentWeek ?? 0) + 1}. This will simulate all games for the current week.
            </p>
            {confirmAction === 'advance' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirm('advance')}
                  disabled={isAnyLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                >
                  {isAdvancing ? 'Simulating...' : 'Confirm Advance'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isAnyLoading}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConfirm('advance')}
                disabled={isAnyLoading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Advance Week
              </button>
            )}
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
                  disabled={isAnyLoading}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                >
                  {isProcessingYearEnd ? 'Processing...' : 'Confirm Year End'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isAnyLoading}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConfirm('yearEnd')}
                disabled={isAnyLoading}
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
