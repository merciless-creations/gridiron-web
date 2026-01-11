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
    onSuccess: (data) => {
      // Update the cache with the new preferences
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
    onError: (error) => {
      console.error('Failed to update preferences:', error);
    },
  });
};
