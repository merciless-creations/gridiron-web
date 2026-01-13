import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { UserPreferences, PreferencesResponse } from '../types/Preferences';

// Query key for preferences
export const PREFERENCES_QUERY_KEY = ['users', 'me', 'preferences'] as const;

// API functions
export const preferencesApi = {
  getPreferences: async (): Promise<PreferencesResponse> => {
    const response = await apiClient.get<PreferencesResponse>('/users/me/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: UserPreferences): Promise<PreferencesResponse> => {
    const response = await apiClient.put<PreferencesResponse>('/users/me/preferences', { preferences });
    return response.data;
  },
};

/**
 * Hook to fetch user preferences
 */
export const usePreferencesQuery = () => {
  return useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: preferencesApi.getPreferences,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: preferencesApi.updatePreferences,
    // Optimistic update for immediate UI feedback
    onMutate: async (newPreferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PREFERENCES_QUERY_KEY });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData(PREFERENCES_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, (old: PreferencesResponse | undefined) => ({
        preferences: newPreferences,
        lastUpdated: old?.lastUpdated ?? new Date().toISOString(),
      }));

      return { previousPreferences };
    },
    onSuccess: (data, variables) => {
      // Merge server response with what we sent (in case server returns partial/empty)
      // This preserves the optimistic update if the server doesn't echo back the full preferences
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, (old: PreferencesResponse | undefined) => {
        const serverPrefs = data?.preferences || {};
        const sentPrefs = variables;
        // Merge: sent preferences override server response (preserves optimistic update)
        return {
          preferences: {
            ...serverPrefs,
            ...sentPrefs,
            ui: { ...serverPrefs.ui, ...sentPrefs.ui },
            grids: { ...serverPrefs.grids, ...sentPrefs.grids },
          },
          lastUpdated: data?.lastUpdated || old?.lastUpdated || new Date().toISOString(),
        };
      });
    },
    onError: (error, _newPreferences, context) => {
      // Roll back to previous value on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(PREFERENCES_QUERY_KEY, context.previousPreferences);
      }
      console.error('Failed to update preferences:', error);
    },
  });
};
