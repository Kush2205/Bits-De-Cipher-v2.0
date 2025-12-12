/**
 * Leaderboard Service
 * 
 * API calls for leaderboard and ranking operations.
 * 
 * Functions:
 * - getGlobalLeaderboard(limit): Fetch global top scores
 * - getQuizLeaderboard(quizId, limit): Get quiz-specific rankings
 * - getSessionLeaderboard(sessionId): Get live session rankings
 * - getUserStats(userId): Get user statistics and rank
 * 
 * Each function returns a Promise with typed response data.
 */

import api from '../lib/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  timeTaken?: number;
  quizzesTaken?: number;
}

interface UserStats {
  userId: string;
  globalRank: number;
  totalScore: number;
  averageScore: number;
  quizzesTaken: number;
  quizHistory: any[];
}

// Get global leaderboard
export const getGlobalLeaderboard = async (limit: number = 100) => {
  const response = await api.get('/leaderboard/global', {
    params: { limit }
  });
  return response.data;
};

// Get quiz-specific leaderboard
export const getQuizLeaderboard = async (quizId: string, limit: number = 100) => {
  const response = await api.get(`/leaderboard/quiz/${quizId}`, {
    params: { limit }
  });
  return response.data;
};

// Get live session leaderboard
export const getSessionLeaderboard = async (sessionId: string) => {
  const response = await api.get(`/leaderboard/session/${sessionId}`);
  return response.data;
};

// Get user statistics
export const getUserStats = async (userId: string): Promise<UserStats> => {
  const response = await api.get(`/leaderboard/user/${userId}`);
  return response.data;
};
