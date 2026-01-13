import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  Season,
  SeasonStandings,
  SeasonSchedule,
  AdvanceWeekResponse,
  GenerateScheduleRequest,
  GenerateScheduleResponse,
  ProcessYearEndResponse,
  AdvanceDaysRequest,
  AdvanceDaysResponse,
} from '../types/Season';

export const seasonApi = {
  getSeason: async (leagueId: number): Promise<Season> => {
    const response = await apiClient.get<Season>(`/leagues-management/${leagueId}/season`);
    return response.data;
  },

  getStandings: async (leagueId: number): Promise<SeasonStandings> => {
    const response = await apiClient.get<SeasonStandings>(`/leagues-management/${leagueId}/standings`);
    return response.data;
  },

  getSchedule: async (leagueId: number): Promise<SeasonSchedule> => {
    const response = await apiClient.get<SeasonSchedule>(`/leagues-management/${leagueId}/schedule`);
    return response.data;
  },

  generateSchedule: async (request: GenerateScheduleRequest): Promise<GenerateScheduleResponse> => {
    const url = request.randomSeed !== undefined
      ? `/leagues-management/${request.leagueId}/generate-schedule?seed=${request.randomSeed}`
      : `/leagues-management/${request.leagueId}/generate-schedule`;
    const response = await apiClient.post<GenerateScheduleResponse>(url);
    return response.data;
  },

  advanceWeek: async (leagueId: number): Promise<AdvanceWeekResponse> => {
    const response = await apiClient.post<AdvanceWeekResponse>(`/leagues-management/${leagueId}/advance-week`);
    return response.data;
  },

  advanceByDays: async (request: AdvanceDaysRequest): Promise<AdvanceDaysResponse> => {
    const response = await apiClient.post<AdvanceDaysResponse>(
      `/leagues-management/${request.leagueId}/advance-days`,
      { days: request.days }
    );
    return response.data;
  },

  processYearEnd: async (leagueId: number): Promise<ProcessYearEndResponse> => {
    const response = await apiClient.post<ProcessYearEndResponse>(`/leagues-management/${leagueId}/process-year-end`);
    return response.data;
  },
};

export const useSeason = (leagueId: number) => {
  return useQuery({
    queryKey: ['season', leagueId],
    queryFn: () => seasonApi.getSeason(leagueId),
    enabled: !!leagueId,
  });
};

export const useSeasonStandings = (leagueId: number) => {
  return useQuery({
    queryKey: ['standings', leagueId],
    queryFn: () => seasonApi.getStandings(leagueId),
    enabled: !!leagueId,
  });
};

export const useSeasonSchedule = (leagueId: number) => {
  return useQuery({
    queryKey: ['schedule', leagueId],
    queryFn: () => seasonApi.getSchedule(leagueId),
    enabled: !!leagueId,
  });
};

export const useGenerateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seasonApi.generateSchedule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['season', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['standings', variables.leagueId] });
    },
  });
};

export const useAdvanceWeek = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seasonApi.advanceWeek,
    onSuccess: (_, leagueId) => {
      queryClient.invalidateQueries({ queryKey: ['season', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['schedule', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['standings', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId] });
    },
  });
};

export const useProcessYearEnd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seasonApi.processYearEnd,
    onSuccess: (_, leagueId) => {
      queryClient.invalidateQueries({ queryKey: ['season', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['schedule', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['standings', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useAdvanceByDays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seasonApi.advanceByDays,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['season', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['standings', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['leagues', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['injuries'] });
    },
  });
};
