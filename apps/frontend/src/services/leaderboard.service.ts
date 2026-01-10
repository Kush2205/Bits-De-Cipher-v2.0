import api from '../lib/api';
import type { LeaderboardEntry, LeaderboardResponse } from '../types/leaderboard';

const normalizeResponse = (data: LeaderboardResponse): LeaderboardEntry[] => data.leaderboard || [];

export const fetchTopLeaderboard = async (limit: number = 15): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get<LeaderboardResponse>('/leaderboard', {
    params: { limit },
  });

  return normalizeResponse(data);
};

export const fetchFullLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get<LeaderboardResponse>('/leaderboard/all');

  return normalizeResponse(data);
};

export const fetchLeaderboardByView = async (
  view: 'top' | 'all',
  limit?: number
): Promise<LeaderboardEntry[]> => {
  if (view === 'all') {
    return fetchFullLeaderboard();
  }

  return fetchTopLeaderboard(limit);
};
