import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseAutoSaveOptions<T> {
  /**
   * Function to save data
   */
  saveFn: (data: T) => Promise<void>;
  
  /**
   * Debounce delay in milliseconds (default: 800ms)
   */
  debounceMs?: number;
  
  /**
   * Callback when save succeeds
   */
  onSuccess?: () => void;
  
  /**
   * Callback when save fails
   */
  onError?: (error: Error) => void;
}

export interface UseAutoSaveReturn<T> {
  /**
   * Trigger a save (debounced)
   */
  save: (data: T) => void;
  
  /**
   * Trigger an immediate save (no debounce)
   */
  saveImmediate: (data: T) => Promise<void>;
  
  /**
   * Whether a save is currently in progress
   */
  isSaving: boolean;
  
  /**
   * Timestamp of last successful save
   */
  lastSaved: Date | null;
  
  /**
   * Error from last save attempt
   */
  error: Error | null;
  
  /**
   * Clear the error state
   */
  clearError: () => void;
}

/**
 * Hook for auto-saving data with debouncing and visual feedback
 * 
 * @example
 * const { save, isSaving, lastSaved, error } = useAutoSave({
 *   saveFn: async (data) => {
 *     await updateLeague(leagueId, data);
 *   },
 *   debounceMs: 800,
 * });
 * 
 * // Debounced save (for text input)
 * save({ name: 'New Name' });
 * 
 * // Immediate save (for structure changes)
 * await saveImmediate({ name: 'New Name' });
 */
export function useAutoSave<T>({
  saveFn,
  debounceMs = 800,
  onSuccess,
  onError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Execute the save operation
   */
  const executeSave = useCallback(async (data: T) => {
    if (!mountedRef.current) return;
    
    setIsSaving(true);
    setError(null);

    try {
      await saveFn(data);
      
      if (mountedRef.current) {
        setLastSaved(new Date());
        setIsSaving(false);
        onSuccess?.();
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Save failed');
        setError(error);
        setIsSaving(false);
        onError?.(error);
      }
    }
  }, [saveFn, onSuccess, onError]);

  /**
   * Trigger a debounced save
   */
  const save = useCallback((data: T) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      executeSave(data);
    }, debounceMs);
  }, [executeSave, debounceMs]);

  /**
   * Trigger an immediate save (no debounce)
   */
  const saveImmediate = useCallback(async (data: T) => {
    // Clear any pending debounced saves
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    await executeSave(data);
  }, [executeSave]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    save,
    saveImmediate,
    isSaving,
    lastSaved,
    error,
    clearError,
  };
}
