import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface TeamAssignmentDto {
  id: number;
  teamId: number;
  teamName: string;
  leagueId: number;
  leagueName: string;
  email: string;
  displayName: string;
  controlState: 'AiControlled' | 'Pending' | 'HumanControlled';
  hasViewed: boolean;
  assignedAt: string;
  firstViewedAt: string | null;
}

export interface UserTeamDto {
  teamId: number;
  teamName: string;
  leagueId: number;
  leagueName: string;
  hasViewed: boolean;
}

export interface AssignGmRequest {
  email: string;
  displayName: string;
}

export const teamAssignmentsApi = {
  getMyTeams: async (): Promise<UserTeamDto[]> => {
    const response = await apiClient.get<UserTeamDto[]>('/users/me/teams');
    return response.data;
  },

  getTeamAssignment: async (leagueId: number, teamId: number): Promise<TeamAssignmentDto | null> => {
    const response = await apiClient.get<TeamAssignmentDto>(`/leagues/${leagueId}/teams/${teamId}/assignment`);
    return response.data;
  },

  getLeagueTeamAssignments: async (leagueId: number): Promise<TeamAssignmentDto[]> => {
    const response = await apiClient.get<TeamAssignmentDto[]>(`/leagues/${leagueId}/team-assignments`);
    return response.data;
  },

  assignGm: async (leagueId: number, teamId: number, request: AssignGmRequest): Promise<TeamAssignmentDto> => {
    const response = await apiClient.post<TeamAssignmentDto>(
      `/leagues/${leagueId}/teams/${teamId}/assign`,
      request
    );
    return response.data;
  },

  removeAssignment: async (leagueId: number, teamId: number): Promise<void> => {
    await apiClient.delete(`/leagues/${leagueId}/teams/${teamId}/assignment`);
  },

  selfAssign: async (leagueId: number, teamId: number): Promise<TeamAssignmentDto> => {
    const response = await apiClient.post<TeamAssignmentDto>(
      `/leagues/${leagueId}/teams/${teamId}/self-assign`
    );
    return response.data;
  },

  takeControl: async (teamId: number): Promise<TeamAssignmentDto> => {
    const response = await apiClient.post<TeamAssignmentDto>(`/teams/${teamId}/take-control`);
    return response.data;
  },
};

export const useMyTeams = () => {
  return useQuery({
    queryKey: ['users', 'me', 'teams'],
    queryFn: teamAssignmentsApi.getMyTeams,
  });
};

export const useTeamAssignment = (leagueId: number, teamId: number) => {
  return useQuery({
    queryKey: ['leagues', leagueId, 'teams', teamId, 'assignment'],
    queryFn: () => teamAssignmentsApi.getTeamAssignment(leagueId, teamId),
    enabled: !!leagueId && !!teamId,
  });
};

export const useLeagueTeamAssignments = (leagueId: number) => {
  return useQuery({
    queryKey: ['leagues', leagueId, 'team-assignments'],
    queryFn: () => teamAssignmentsApi.getLeagueTeamAssignments(leagueId),
    enabled: !!leagueId,
  });
};

export const useAssignGm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, teamId, request }: { leagueId: number; teamId: number; request: AssignGmRequest }) =>
      teamAssignmentsApi.assignGm(leagueId, teamId, request),
    onSuccess: (_, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'team-assignments'] });
    },
  });
};

export const useRemoveAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, teamId }: { leagueId: number; teamId: number }) =>
      teamAssignmentsApi.removeAssignment(leagueId, teamId),
    onSuccess: (_, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'team-assignments'] });
    },
  });
};

export const useSelfAssign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, teamId }: { leagueId: number; teamId: number }) =>
      teamAssignmentsApi.selfAssign(leagueId, teamId),
    onSuccess: (_, { leagueId }) => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'team-assignments'] });
    },
  });
};

export const useTakeControl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => teamAssignmentsApi.takeControl(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me', 'teams'] });
    },
  });
};
