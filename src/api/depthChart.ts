import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Player } from '../types/Player';
import type { Position } from '../types/enums';

export interface DepthChartResponse {
  teamId: number;
  positions: Record<Position, Player[]>;
}

export const getDepthChart = async (teamId: number): Promise<DepthChartResponse> => {
  const response = await apiClient.get<DepthChartResponse>(`/api/teams/${teamId}/depth-chart`);
  return response.data;
};

export const useDepthChart = (teamId: number) => {
  return useQuery({
    queryKey: ['depthChart', teamId],
    queryFn: () => getDepthChart(teamId),
    enabled: !!teamId && teamId > 0,
  });
};
