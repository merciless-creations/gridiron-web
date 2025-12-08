import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave({ saveFn }));

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should debounce save calls', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ saveFn, debounceMs: 500 })
    );

    // Call save multiple times rapidly
    act(() => {
      result.current.save({ name: 'test1' });
      result.current.save({ name: 'test2' });
      result.current.save({ name: 'test3' });
    });

    // Should not have called saveFn yet
    expect(saveFn).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have called saveFn only once with the last value
    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith({ name: 'test3' });
    });
  });

  it('should save immediately when saveImmediate is called', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave({ saveFn }));

    await act(async () => {
      await result.current.saveImmediate({ name: 'immediate' });
    });

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ name: 'immediate' });
  });

  it('should set isSaving to true during save', async () => {
    let resolveSave: () => void;
    const saveFn = vi.fn(() => new Promise<void>(resolve => {
      resolveSave = resolve;
    }));

    const { result } = renderHook(() => useAutoSave({ saveFn }));

    act(() => {
      result.current.save({ name: 'test' });
      vi.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    await act(async () => {
      resolveSave!();
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });

  it('should update lastSaved timestamp on successful save', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave({ saveFn }));

    const beforeSave = new Date();

    await act(async () => {
      await result.current.saveImmediate({ name: 'test' });
    });

    expect(result.current.lastSaved).not.toBeNull();
    expect(result.current.lastSaved!.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
  });

  it('should set error state on save failure', async () => {
    const error = new Error('Save failed');
    const saveFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useAutoSave({ saveFn, onError })
    );

    await act(async () => {
      await result.current.saveImmediate({ name: 'test' });
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
      expect(result.current.isSaving).toBe(false);
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should clear error state when clearError is called', async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error('Save failed'));
    const { result } = renderHook(() => useAutoSave({ saveFn }));

    await act(async () => {
      await result.current.saveImmediate({ name: 'test' });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should call onSuccess callback on successful save', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useAutoSave({ saveFn, onSuccess })
    );

    await act(async () => {
      await result.current.saveImmediate({ name: 'test' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should cancel pending debounced save when saveImmediate is called', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ saveFn, debounceMs: 500 })
    );

    // Start a debounced save
    act(() => {
      result.current.save({ name: 'debounced' });
    });

    // Immediately call saveImmediate before debounce completes
    await act(async () => {
      await result.current.saveImmediate({ name: 'immediate' });
    });

    // Advance time past debounce
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should only have called saveFn once (for immediate)
    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ name: 'immediate' });
  });

  it('should respect custom debounce time', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ saveFn, debounceMs: 1000 })
    );

    act(() => {
      result.current.save({ name: 'test' });
    });

    // Fast-forward 500ms - should not have saved yet
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(saveFn).not.toHaveBeenCalled();

    // Fast-forward another 500ms - now should have saved
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledTimes(1);
    });
  });

  it('should cleanup timers on unmount', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() =>
      useAutoSave({ saveFn, debounceMs: 500 })
    );

    act(() => {
      result.current.save({ name: 'test' });
    });

    unmount();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not have called saveFn after unmount
    expect(saveFn).not.toHaveBeenCalled();
  });
});
