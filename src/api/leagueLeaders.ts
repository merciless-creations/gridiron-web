import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface LeagueLeader {
  playerId: number;
  playerName: string;
  teamName: string;
  teamCity: string;
  value: number;
}

export interface LeagueLeadersResponse {
  leagueId: number;
  seasonId: number;
  passing: {
    yards: LeagueLeader[];
    touchdowns: LeagueLeader[];
    rating: LeagueLeader[];
  };
  rushing: {
    yards: LeagueLeader[];
    touchdowns: LeagueLeader[];
    ypc: LeagueLeader[];
  };
  receiving: {
    yards: LeagueLeader[];
    touchdowns: LeagueLeader[];
    receptions: LeagueLeader[];
  };
  defense: {
    sacks: LeagueLeader[];
    interceptions: LeagueLeader[];
  };
}

export const getLeagueLeaders = async (leagueId: number): Promise<LeagueLeadersResponse> => {
  const response = await apiClient.get<LeagueLeadersResponse>(`/api/leagues-management/${leagueId}/leaders`);
  return response.data;
};

export const useLeagueLeaders = (leagueId: number) => {
  return useQuery({
    queryKey: ['leagueLeaders', leagueId],
    queryFn: () => getLeagueLeaders(leagueId),
    enabled: !!leagueId && leagueId > 0,
  });
};
